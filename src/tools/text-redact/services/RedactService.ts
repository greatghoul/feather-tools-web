const PATTERNS = {
    email: { regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
    phone: { regex: /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g },
    idCard: { regex: /\b[1-9]\d{5}(?:19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx]\b/g },
    url: { regex: /https?:\/\/[^\s<>"']+/g },
    ip: { regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g },
};

function maskPart(part) {
    if (part.length <= 2) {
        return '*'.repeat(part.length);
    }
    const maskCount = Math.round(part.length * 0.3);
    const keepCount = part.length - maskCount;
    const leftKeep = Math.floor(keepCount / 2);
    const rightKeep = keepCount - leftKeep;
    return part.slice(0, leftKeep) + '*'.repeat(maskCount) + part.slice(part.length - rightKeep);
}

function getEmailMask(email, replacement) {
    if (replacement === 'redacted') return '[REDACTED]';
    const atIndex = email.indexOf('@');
    if (atIndex <= 0) return '****';

    const localPart = email.slice(0, atIndex);
    const domainFull = email.slice(atIndex + 1);

    const dotIndex = domainFull.indexOf('.');
    let domainName = domainFull;
    let domainSuffix = '';
    if (dotIndex > 0) {
        domainName = domainFull.slice(0, dotIndex);
        domainSuffix = domainFull.slice(dotIndex);
    }

    return maskPart(localPart) + '@' + maskPart(domainName) + domainSuffix;
}

function getUrlMask(url, replacement) {
    if (replacement === 'redacted') return '[REDACTED]';

    const protocolEnd = url.indexOf('://');
    if (protocolEnd < 0) return maskPart(url);

    const protocol = url.slice(0, protocolEnd + 3);
    const afterProtocol = url.slice(protocolEnd + 3);

    let hostEnd = afterProtocol.length;
    const firstSlash = afterProtocol.indexOf('/');
    const firstQuery = afterProtocol.indexOf('?');
    const firstHash = afterProtocol.indexOf('#');
    if (firstSlash >= 0) hostEnd = Math.min(hostEnd, firstSlash);
    if (firstQuery >= 0) hostEnd = Math.min(hostEnd, firstQuery);
    if (firstHash >= 0) hostEnd = Math.min(hostEnd, firstHash);

    const hostPart = afterProtocol.slice(0, hostEnd);
    const pathPart = afterProtocol.slice(hostEnd);

    const parts = hostPart.split('.');
    let maskedHost;
    if (parts.length >= 2) {
        const suffix = parts.pop();
        const domainName = parts.pop();
        const prefix = parts.join('.');
        const maskedDomain = maskPart(domainName);
        maskedHost = prefix
            ? `${prefix}.${maskedDomain}.${suffix}`
            : `${maskedDomain}.${suffix}`;
    } else {
        maskedHost = maskPart(hostPart);
    }

    const maskedPath = pathPart ? maskPart(pathPart) : '';

    return protocol + maskedHost + maskedPath;
}

function getMask(match, replacement) {
    if (replacement === 'redacted') {
        return '[REDACTED]';
    }
    const prefix = match.slice(0, 2);
    const suffix = match.slice(-2);
    return prefix + '*'.repeat(Math.max(3, match.length - 4)) + suffix;
}

const TYPE_LABELS = {
    email: 'text-redact/options/email',
    phone: 'text-redact/options/phone',
    idCard: 'text-redact/options/id_card',
    url: 'text-redact/options/url',
    ip: 'text-redact/options/ip',
    custom: 'text-redact/options/custom',
};

const RedactService = {
    redact(text, options) {
        const replacement = options.replacement || 'asterisk';
        const allMatches: any[] = [];

        const activeTypes: string[] = [];
        if (options.email) activeTypes.push('email');
        if (options.phone) activeTypes.push('phone');
        if (options.idCard) activeTypes.push('idCard');
        if (options.url) activeTypes.push('url');
        if (options.ip) activeTypes.push('ip');

        const activePatterns = activeTypes.map((type) => ({ type, regex: PATTERNS[type].regex }));

        if (options.enableCustom && options.customPattern) {
            activeTypes.push('custom');
            try {
                activePatterns.push({
                    type: 'custom',
                    regex: new RegExp(options.customPattern, 'g'),
                });
            } catch (e) {
                // Invalid regex, skip
            }
        }

        for (const { type, regex } of activePatterns) {
            regex.lastIndex = 0;
            let match;
            while ((match = regex.exec(text)) !== null) {
                allMatches.push({
                    type,
                    start: match.index,
                    end: match.index + match[0].length,
                    text: match[0],
                });
            }
        }

        allMatches.sort((a, b) => a.start - b.start);

        const nonOverlapping: any[] = [];
        for (const m of allMatches) {
            if (nonOverlapping.length === 0 || m.start >= nonOverlapping[nonOverlapping.length - 1].end) {
                nonOverlapping.push(m);
            }
        }

        const typeCounts = new Map();
        let result = text;
        for (let i = nonOverlapping.length - 1; i >= 0; i--) {
            const m = nonOverlapping[i];
            const mask = m.type === 'email'
                ? getEmailMask(m.text, replacement)
                : m.type === 'url'
                    ? getUrlMask(m.text, replacement)
                    : m.type === 'phone' || m.type === 'idCard'
                        ? replacement === 'redacted' ? '[REDACTED]' : maskPart(m.text)
                        : m.type === 'ip'
                            ? replacement === 'redacted' ? '[REDACTED]' : m.text.replace(/^(\d+)\.\d+\.\d+(\.\d+)$/, '$1.*.*$2')
                            : getMask(m.text, replacement);
            result = result.slice(0, m.start) + mask + result.slice(m.end);
            typeCounts.set(m.type, (typeCounts.get(m.type) || 0) + 1);
        }

        const details = activeTypes
            .filter((type) => TYPE_LABELS[type])
            .map((type) => ({
                type,
                label: TYPE_LABELS[type],
                count: typeCounts.get(type) || 0,
            }));

        const stats = {
            total: nonOverlapping.length,
            details,
        };

        return { text: result, stats };
    },
};

export default RedactService;

const PATTERNS = {
    email: { regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
    phone: { regex: /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g },
    idCard: { regex: /\b[1-9]\d{5}(?:19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx]\b/g },
    url: { regex: /https?:\/\/[^\s<>"']+/g },
    ip: { regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g },
};

const TYPE_LABELS = {
    email: 'text-extract/options/email',
    phone: 'text-extract/options/phone',
    idCard: 'text-extract/options/id_card',
    url: 'text-extract/options/url',
    ip: 'text-extract/options/ip',
    custom: 'text-extract/options/custom',
};

const ExtractService = {
    extract(text, options) {
        if (!text || !text.trim()) {
            return { groups: {}, total: 0 };
        }

        const activeTypes = [];
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

        const allMatches = [];

        for (const { type, regex } of activePatterns) {
            regex.lastIndex = 0;
            let match;
            const seen = new Set();
            while ((match = regex.exec(text)) !== null) {
                const value = match[0].trim();
                if (!seen.has(value)) {
                    seen.add(value);
                    allMatches.push({
                        type,
                        value,
                    });
                }
            }
        }

        const groups = {};
        for (const m of allMatches) {
            if (!groups[m.type]) {
                groups[m.type] = [];
            }
            groups[m.type].push(m.value);
        }

        let total = 0;
        for (const type of Object.keys(groups)) {
            total += groups[type].length;
        }

        return { groups, total };
    },
};

export default ExtractService;

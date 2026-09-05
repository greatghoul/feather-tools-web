/**
 * TextSplitter - Character counting and text splitting service for X.com (Twitter)
 *
 * Implements X's weighted character counting:
 * - URLs: 23 characters (t.co wrapping)
 * - CJK characters: 2 characters each
 * - Emojis: 2 characters each
 * - Other characters: 1 character each
 *
 * Supports splitting by paragraph, sentence, word, or character boundaries.
 * Supports numbering formats: none, 1/N, (1/N) with optional line breaks.
 */

const URL_REGEX = /(https?:\/\/[^\s<>"']+)/gi;

const TCO_LENGTH = 23;

const CJK_RANGES = [
    [0x1100, 0x115f],
    [0x2329, 0x232a],
    [0x2e80, 0x2eff],
    [0x2f00, 0x2fdf],
    [0x3000, 0x303e],
    [0x3041, 0x3096],
    [0x3099, 0x30ff],
    [0x3105, 0x312f],
    [0x3130, 0x318f],
    [0x3190, 0x319f],
    [0x31a0, 0x31bf],
    [0x31f0, 0x31ff],
    [0x3200, 0x32ff],
    [0x3300, 0x33ff],
    [0x3400, 0x4dbf],
    [0x4e00, 0x9fff],
    [0xa000, 0xa48f],
    [0xa490, 0xa4cf],
    [0xac00, 0xd7af],
    [0xf900, 0xfaff],
    [0xfe30, 0xfe4f],
    [0xff00, 0xffef],
    [0x20000, 0x2fffd],
    [0x30000, 0x3fffd],
];

const EMOJI_RANGES = [
    [0x1f1e6, 0x1f1ff],
    [0x1f300, 0x1f5ff],
    [0x1f600, 0x1f64f],
    [0x1f680, 0x1f6ff],
    [0x1f700, 0x1f77f],
    [0x1f780, 0x1f7ff],
    [0x1f800, 0x1f8ff],
    [0x1f900, 0x1f9ff],
    [0x1fa00, 0x1fa6f],
    [0x1fa70, 0x1faff],
    [0x2600, 0x26ff],
    [0x2700, 0x27bf],
    [0x2b00, 0x2bff],
    [0x2190, 0x21ff],
    [0x2300, 0x23ff],
    [0xfe00, 0xfe0f],
    [0x1f018, 0x1f270],
];

const ZWJ = 0x200d;
const VARIATION_SELECTOR = 0xfe0f;
const SKIN_TONE_MODIFIERS = [
    0x1f3fb, 0x1f3fc, 0x1f3fd, 0x1f3fe, 0x1f3ff,
];

const isInRange = (code, ranges) => {
    for (const [start, end] of ranges) {
        if (code >= start && code <= end) return true;
    }
    return false;
};

const isCJK = (code) => isInRange(code, CJK_RANGES);

const isEmojiBase = (code) => isInRange(code, EMOJI_RANGES);

const isModifier = (code) =>
    code === ZWJ ||
    code === VARIATION_SELECTOR ||
    SKIN_TONE_MODIFIERS.includes(code);

const charWeight = (code) => {
    if (isCJK(code)) return 2;
    if (isEmojiBase(code)) return 2;
    if (isModifier(code)) return 0;
    return 1;
};

const countChars = (text) => {
    if (!text) return { weighted: 0, urls: 0 };

    const normalized = text.normalize('NFC');

    const urlMatches = normalized.match(URL_REGEX) || [];
    const urlCount = urlMatches.length;
    const urlTotalWeight = urlCount * TCO_LENGTH;

    let textWithoutUrls = normalized;
    if (urlCount > 0) {
        textWithoutUrls = normalized.replace(URL_REGEX, '');
    }

    const codePoints = [...textWithoutUrls];
    let nonUrlWeight = 0;
    for (let i = 0; i < codePoints.length; i++) {
        const code = codePoints[i].codePointAt(0);
        nonUrlWeight += charWeight(code);
    }

    return { weighted: nonUrlWeight + urlTotalWeight, urls: urlCount };
};

/**
 * Build the numbering prefix string for a segment.
 * @param {number} index - 1-based segment index
 * @param {number} total - total number of segments
 * @param {string} format - 'none' | 'prefix' | 'paren'
 * @param {string} breakMode - 'none' | 'break' | 'break-blank'
 * @returns {string}
 */
const buildNumbering = (index, total, format, breakMode) => {
    if (format === 'none') return '';
    const num = format === 'paren'
        ? `(${index}/${total})`
        : `${index}/${total}`;
    switch (breakMode) {
        case 'break': return num + '\n';
        case 'break-blank': return num + '\n\n';
        default: return num + ' ';
    }
};

const splitParagraphs = (text) => {
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    return paragraphs.map((p, i) =>
        i < paragraphs.length - 1 ? p + '\n\n' : p
    );
};

const splitSentences = (text) => {
    const regex = /[^.!?。！？\n]+[.!?。！？]*[\s]*|\n+/g;
    const matches = text.match(regex) || [];
    return matches.filter((s) => s.trim().length > 0);
};

const splitWords = (text) => {
    const regex = /\S+\s*/g;
    const matches = text.match(regex) || [];
    return matches.filter((w) => w.trim().length > 0);
};

const splitChars = (text) => {
    return [...text];
};

const greedyAccumulate = (tokens, limit, numbering, subSplit) => {
    const segments: string[] = [];
    let current = '';
    let currentWeight = 0;
    const numWeight = numbering ? countChars(numbering).weighted : 0;
    const effectiveLimit = limit - numWeight;

    for (const token of tokens) {
        const tokenWeight = countChars(token).weighted;

        if (tokenWeight > effectiveLimit && effectiveLimit > 0) {
            if (current.trim()) {
                segments.push(current);
                current = '';
                currentWeight = 0;
            }
            const subParts = subSplit(token, effectiveLimit);
            for (const part of subParts) {
                segments.push(part);
            }
            continue;
        }

        if (currentWeight + tokenWeight > effectiveLimit && current.trim()) {
            segments.push(current);
            current = token;
            currentWeight = tokenWeight;
        } else {
            current += token;
            currentWeight += tokenWeight;
        }
    }

    if (current.trim()) {
        segments.push(current);
    }

    return segments;
};

const hardSplit = (text, limit) => {
    const codePoints = [...text];
    const segments: string[] = [];
    let current = '';
    let currentWeight = 0;

    for (const cp of codePoints) {
        const code = cp.codePointAt(0);
        const w = charWeight(code);
        if (currentWeight + w > limit && current.length > 0) {
            segments.push(current);
            current = cp;
            currentWeight = w;
        } else {
            current += cp;
            currentWeight += w;
        }
    }

    if (current.length > 0) {
        segments.push(current);
    }

    return segments;
};

const splitText = (text, limit, mode, numbering: any = null) => {
    if (!text || !text.trim()) return [];
    const totalWeight = countChars(text).weighted;
    if (totalWeight <= limit) return [text];

    const subSplitters = {
        paragraph: (t, lim) => splitText(t, lim, 'sentence', null),
        sentence: (t, lim) => splitText(t, lim, 'word', null),
        word: (t, lim) => hardSplit(t, lim),
        char: (t, lim) => hardSplit(t, lim),
    };

    let tokens;
    switch (mode) {
        case 'paragraph':
            tokens = splitParagraphs(text);
            break;
        case 'sentence':
            tokens = splitSentences(text);
            break;
        case 'word':
            tokens = splitWords(text);
            break;
        case 'char':
            tokens = splitChars(text);
            break;
        default:
            tokens = splitWords(text);
    }

    const rawSegments = greedyAccumulate(tokens, limit, numbering, subSplitters[mode] || subSplitters.word);
    return rawSegments.filter((s) => s.trim().length > 0);
};

/**
 * Split text with optional segment numbering.
 *
 * @param {string} text - Text to split
 * @param {number} limit - Character limit per segment
 * @param {string} mode - Split mode: 'paragraph' | 'sentence' | 'word' | 'char'
 * @param {string} numberingFormat - 'none' | 'prefix' | 'paren'
 * @param {string} numberingBreak - 'none' | 'break' | 'break-blank'
 * @returns {Array<{text, numbering, fullText, index, total, weight, textWeight, overLimit}>}
 */
const split = (text, limit, mode, numberingFormat, numberingBreak) => {
    if (!text || !text.trim()) return [];

    let segments = splitText(text, limit, mode, null);
    let total = segments.length;

    if (numberingFormat !== 'none' && total > 1) {
        for (let attempt = 0; attempt < 3; attempt++) {
            const numStr = buildNumbering(total, total, numberingFormat, numberingBreak);
            const newSegments = splitText(text, limit, mode, numStr);
            const newTotal = newSegments.length;

            if (newTotal === total) {
                segments = newSegments;
                break;
            }
            total = newTotal;
            segments = newSegments;
        }

        return segments.map((seg, i) => {
            const numbering = buildNumbering(i + 1, total, numberingFormat, numberingBreak);
            const trimmed = seg.trim();
            const fullText = numbering + trimmed;
            const textWeight = countChars(trimmed).weighted;
            const weight = countChars(fullText).weighted;
            return {
                text: trimmed,
                numbering,
                fullText,
                index: i + 1,
                total,
                weight,
                textWeight,
                overLimit: weight > limit,
            };
        });
    }

    return segments.map((seg, i) => {
        const trimmed = seg.trim();
        const weight = countChars(trimmed).weighted;
        return {
            text: trimmed,
            numbering: null,
            fullText: trimmed,
            index: i + 1,
            total: segments.length,
            weight,
            textWeight: weight,
            overLimit: weight > limit,
        };
    });
};

export const xTextSplitter = {
    countChars,
    split,
    buildNumbering,
    TCO_LENGTH,
};

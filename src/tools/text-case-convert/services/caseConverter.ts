const WORD_SEPARATOR = /[\s_-]+|(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])/g;

const splitIntoWords = (text) => {
    return text.split(WORD_SEPARATOR).filter(w => w.length > 0);
};

const toUppercase = (text) => {
    return text.toUpperCase();
};

const toLowercase = (text) => {
    return text.toLowerCase();
};

const toTitleCase = (text) => {
    const words = splitIntoWords(text);
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
};

const toCapitalize = (text) => {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

const toSentenceCase = (text) => {
    return text.replace(/(?:^|[.!?]\s+)(\w)/g, (match) => match.toUpperCase());
};

const toCamelCase = (text) => {
    const words = splitIntoWords(text);
    if (words.length === 0) return text;
    const first = words[0].toLowerCase();
    const rest = words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    return first + rest.join('');
};

const toPascalCase = (text) => {
    const words = splitIntoWords(text);
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
};

const toKebabCase = (text) => {
    const words = splitIntoWords(text);
    return words.map(w => w.toLowerCase()).join('-');
};

const toSnakeCase = (text) => {
    const words = splitIntoWords(text);
    return words.map(w => w.toLowerCase()).join('_');
};

const toInvertCase = (text) => {
    return text.split('').map(c => {
        if (c === c.toUpperCase()) return c.toLowerCase();
        if (c === c.toLowerCase()) return c.toUpperCase();
        return c;
    }).join('');
};

const toAlternatingCase = (text) => {
    let result = '';
    let index = 0;
    for (const c of text) {
        if (/[a-zA-Z]/.test(c)) {
            result += index % 2 === 0 ? c.toUpperCase() : c.toLowerCase();
            index++;
        } else {
            result += c;
        }
    }
    return result;
};

const CONVERTERS = {
    uppercase: toUppercase,
    lowercase: toLowercase,
    title_case: toTitleCase,
    capitalize: toCapitalize,
    sentence_case: toSentenceCase,
    camel_case: toCamelCase,
    pascal_case: toPascalCase,
    kebab_case: toKebabCase,
    snake_case: toSnakeCase,
    invert_case: toInvertCase,
    alternating_case: toAlternatingCase,
};

export const convertText = (text, caseType) => {
    const converter = CONVERTERS[caseType];
    if (!converter) return text;
    return converter(text);
};

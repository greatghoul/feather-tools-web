import { t } from '~/helpers/i18n';

const STYLES = {
    rounded: { tl: '\u256d', tr: '\u256e', bl: '\u2570', br: '\u256f', h: '\u2500', v: '\u2502' },
    double: { tl: '\u2554', tr: '\u2557', bl: '\u255a', br: '\u255d', h: '\u2550', v: '\u2551' },
    bold: { tl: '\u250f', tr: '\u2513', bl: '\u2517', br: '\u251b', h: '\u2501', v: '\u2503' },
};

function repeat(char, count) {
    return Array.from({ length: Math.max(0, count) }, () => char).join('');
}

function isWideChar(char) {
    const cp = char.codePointAt(0);
    if (cp == null) return false;
    return (cp >= 0x1100 && cp <= 0x115F) ||
        (cp >= 0x2E80 && cp <= 0xA4CF) ||
        (cp >= 0xAC00 && cp <= 0xD7A3) ||
        (cp >= 0xF900 && cp <= 0xFAFF) ||
        (cp >= 0xFE10 && cp <= 0xFE6F) ||
        (cp >= 0xFF01 && cp <= 0xFF60) ||
        (cp >= 0xFFE0 && cp <= 0xFFE6) ||
        (cp >= 0x20000 && cp <= 0x3FFFF);
}

function visualLength(str) {
    let len = 0;
    for (const char of str) {
        len += isWideChar(char) ? 2 : 1;
    }
    return len;
}

function padVisual(str, targetWidth) {
    const current = visualLength(str);
    const padding = Math.max(0, targetWidth - current);
    return str + ' '.repeat(padding);
}

function getArrowPos(arrow, innerWidth) {
    if (arrow.endsWith('left')) return 1;
    if (arrow.endsWith('right')) return innerWidth;
    return Math.floor((innerWidth + 2) / 2);
}

export function generateBubble(text, styleKey, arrow) {
    const s = STYLES[styleKey] || STYLES.rounded;
    const lines = text.split('\n');

    if (lines.length === 0 || (lines.length === 1 && lines[0] === '')) {
        return t('text-bubble/output/placeholder');
    }

    const maxLen = lines.reduce((max, line) => Math.max(max, visualLength(line)), 0);
    const innerWidth = maxLen;

    const topLine = s.tl + repeat(s.h, innerWidth + 2) + s.tr;
    const middleLines = lines.map(line => s.v + ' ' + padVisual(line, innerWidth) + ' ' + s.v);
    const bottomLine = s.bl + repeat(s.h, innerWidth + 2) + s.br;

    const result: string[] = [];

    if (arrow !== 'none' && arrow.startsWith('up')) {
        const isRight = arrow.endsWith('right');
        const tailChar = isRight ? '\u256e' : '\u256d';
        const breakChar = isRight ? '\u2570' : '\u256f';
        const tailPos = getArrowPos(arrow, innerWidth);
        const upperTail = repeat(' ', tailPos + 1) + tailChar;
        const topArr = s.tl + repeat(s.h, tailPos) + breakChar + repeat(s.h, innerWidth + 2 - tailPos - 1) + s.tr;
        result.push(upperTail);
        result.push(topArr);
    } else {
        result.push(topLine);
    }

    result.push(...middleLines);

    if (arrow !== 'none' && !arrow.startsWith('up')) {
        const tailPos = getArrowPos(arrow, innerWidth);
        const bottomArr = s.bl + repeat(s.h, tailPos) + '\u256e' + repeat(s.h, innerWidth + 2 - tailPos - 1) + s.br;
        const lowerTail = repeat(' ', tailPos + 1) + '\u2570';
        result.push(bottomArr);
        result.push(lowerTail);
    } else {
        result.push(bottomLine);
    }

    return result.join('\n');
}

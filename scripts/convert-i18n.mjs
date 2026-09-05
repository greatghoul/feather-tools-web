// One-time conversion: Flask gettext .po files -> JSON translation files.
//
// Outputs:
//   src/i18n/en.json, src/i18n/zh.json        - full key sets (used by page shells)
//   src/i18n/client/en.json, client/zh.json   - keys used by client-side JS
//                                               (common/ + habitica/ prefixes)
//   src/tools/<slug>/i18n/{en,zh}.json        - per-tool keys (full keys kept)
//
// Usage: npm run convert-i18n  (reads .po from the old repo path below)
import { po } from 'gettext-parser';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const PROJECT = resolve(ROOT, '..');
const OLD_PO = {
    en: '/home/greatghoul/feather-tools/app/translations/en/LC_MESSAGES/messages.po',
    zh: '/home/greatghoul/feather-tools/app/translations/zh/LC_MESSAGES/messages.po',
};

// Prefixes that client-side JS reads via t()/getText()
const CLIENT_PREFIXES = ['common/', 'habitica/'];

// Known-garbled values in the source .po (unescaped quotes from an old, longer
// wording that was later simplified). Cleaned to match the current English text.
const VALUE_FIXES = {
    zh: {
        'text-line-numbers/how_to_use/step2': '选择行号类型（数字、字母或罗马数字）',
        'text-line-numbers/how_to_use/step3': '使用前缀、后缀等选项自定义格式',
    },
};

// The zh catalog contains msgstr lines with unescaped interior quotes which are
// invalid PO syntax. Escape them so the file can be parsed; VALUE_FIXES then
// restores clean wording for known entries.
function repairPoText(text, file) {
    const lines = text.split('\n');
    let repaired = 0;
    const fixed = lines.map((line) => {
        const match = line.match(/^(msgid|msgstr) "(.*)"\s*$/);
        if (!match) return line;
        const content = match[2];
        const escaped = content.replace(/(?<!\\)"/g, '\\"');
        if (escaped !== content) {
            repaired++;
            console.log(`repaired unescaped quote at ${file}: ${match[1]} "${content.slice(0, 40)}..."`);
        }
        return `${match[1]} "${escaped}"`;
    });
    return { text: fixed.join('\n'), repaired };
}

function parsePo(file) {
    const { text } = repairPoText(readFileSync(file, 'utf-8'), file);
    const parsed = po.parse(text);
    const ctx = parsed.translations[''] || {};
    const out = {};
    for (const [key, entry] of Object.entries(ctx)) {
        if (!key) continue; // header entry
        const msgstr = Array.isArray(entry.msgstr) ? entry.msgstr[0] : entry.msgstr;
        out[key] = typeof msgstr === 'string' ? msgstr : '';
    }
    for (const [key, value] of Object.entries(VALUE_FIXES[file.endsWith('/en/LC_MESSAGES/messages.po') ? 'en' : 'zh'] || {})) {
        if (out[key] !== undefined && out[key] !== value) {
            console.log(`applied VALUE_FIXES[${key}]`);
            out[key] = value;
        }
    }
    return out;
}

function readTools() {
    const src = readFileSync(resolve(PROJECT, 'src/data/tools.ts'), 'utf-8');
    return [...src.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1]);
}

const en = parsePo(OLD_PO.en);
const zh = parsePo(OLD_PO.zh);
const slugs = new Set(readTools());

// Fill gaps: prefer the locale's own value, fall back to the other locale.
const missing = { en: [], zh: [] };
for (const key of new Set([...Object.keys(en), ...Object.keys(zh)])) {
    if (en[key] === undefined || en[key] === '') {
        if (zh[key]) { en[key] = zh[key]; missing.en.push(key); }
    }
    if (zh[key] === undefined || zh[key] === '') {
        if (en[key]) { zh[key] = en[key]; missing.zh.push(key); }
    }
}

const sortKeys = (obj) => Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));

const enFull = sortKeys(en);
const zhFull = sortKeys(zh);

// Full sets for page shells
mkdirSync(resolve(PROJECT, 'src/i18n'), { recursive: true });
writeFileSync(resolve(PROJECT, 'src/i18n/en.json'), JSON.stringify(enFull, null, 4) + '\n');
writeFileSync(resolve(PROJECT, 'src/i18n/zh.json'), JSON.stringify(zhFull, null, 4) + '\n');

// Client-side common slices
const pickClient = (all) => sortKeys(Object.fromEntries(
    Object.entries(all).filter(([key]) => CLIENT_PREFIXES.some((p) => key.startsWith(p)))
));
mkdirSync(resolve(PROJECT, 'src/i18n/client'), { recursive: true });
writeFileSync(resolve(PROJECT, 'src/i18n/client/en.json'), JSON.stringify(pickClient(enFull), null, 4) + '\n');
writeFileSync(resolve(PROJECT, 'src/i18n/client/zh.json'), JSON.stringify(pickClient(zhFull), null, 4) + '\n');

// Per-tool slices (full keys kept, sorted by key)
const stripCount = { written: 0 };
for (const slug of slugs) {
    const prefix = slug + '/';
    const pick = (all) => sortKeys(Object.fromEntries(
        Object.entries(all).filter(([key]) => key.startsWith(prefix))
    ));
    const enSlice = pick(enFull);
    const zhSlice = pick(zhFull);
    if (Object.keys(enSlice).length === 0 && Object.keys(zhSlice).length === 0) continue;
    const dir = resolve(PROJECT, 'src/tools', slug, 'i18n');
    mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, 'en.json'), JSON.stringify(enSlice, null, 4) + '\n');
    writeFileSync(resolve(dir, 'zh.json'), JSON.stringify(zhSlice, null, 4) + '\n');
    stripCount.written++;
}

console.log(`i18n converted: en=${Object.keys(enFull).length} keys, zh=${Object.keys(zhFull).length} keys`);
console.log(`per-tool slices written for ${stripCount.written} tools`);
console.log(`client-common: en=${Object.keys(pickClient(enFull)).length}, zh=${Object.keys(pickClient(zhFull)).length}`);
if (missing.en.length) console.log(`en fallbacks applied: ${missing.en.length} (e.g. ${missing.en.slice(0, 5).join(', ')})`);
if (missing.zh.length) console.log(`zh fallbacks applied: ${missing.zh.length} (e.g. ${missing.zh.slice(0, 5).join(', ')})`);

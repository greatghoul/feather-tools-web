// HTML parity check: compares the Astro build (dist-astro) against the legacy
// baseline (dist snapshot in .astro-baseline) for the Phase 1 pages, after
// normalizing formatting differences between React SSR and Astro output.
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(scriptDir, '..');

const PAGES = [
    'en/index.html',
    'zh/index.html',
    'en/about/index.html',
    'zh/about/index.html',
    'en/privacy/index.html',
    'zh/privacy/index.html',
    'en/terms/index.html',
    'zh/terms/index.html',
];

// React SSR vs Astro output differences that are semantically identical.
// Entity escaping differs (React emits &#x27;/&quot; in attributes, Astro keeps
// raw chars), so decode the common entities (amp last) before comparing.
function normalize(html) {
    return html
        .replace(/<!DOCTYPE html>\s*/, '')
        .replace(/\/>/g, '>') // self-closing void tags
        .replace(/charSet=/g, 'charset=')
        .replace(/hrefLang=/g, 'hreflang=')
        .replace(/crossOrigin=/g, 'crossorigin=')
        .replace(/style="([^"]*)"/g, (_, v) => `style="${v.replace(/\s+/g, '').replace(/;$/, '')}"`)
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .replace(/\s+$/g, ''); // legacy build appends a trailing newline
}

let failures = 0;
for (const page of PAGES) {
    const baseline = readFileSync(resolve(ROOT, '.astro-baseline', page), 'utf-8');
    const astro = readFileSync(resolve(ROOT, 'dist-astro', page), 'utf-8');
    const a = normalize(baseline);
    const b = normalize(astro);
    if (a === b) {
        console.log(`PASS  ${page}`);
        continue;
    }
    failures++;
    // Locate the first difference.
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    console.log(`FAIL  ${page}`);
    console.log(`      baseline: ...${a.slice(Math.max(0, i - 60), i + 120)}`);
    console.log(`      astro   : ...${b.slice(Math.max(0, i - 60), i + 120)}`);
}
console.log(failures === 0 ? '\nAll pages match.' : `\n${failures} page(s) differ.`);
process.exit(failures === 0 ? 0 : 1);

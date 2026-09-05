// HTML parity check for the 66 tool pages: compares the Astro build
// (dist-astro) against the legacy baseline (dist snapshot in .astro-baseline).
//
// Tool pages are not byte-identical to the baseline for three expected
// reasons, which this script normalizes away:
//   1. The "You May Also Like" suggestions are picked at build time with
//      Math.random(), so the 4 cards differ run to run.
//   2. Bundled asset wiring differs: Astro links all tool CSS into the head
//      (chunking is aligned separately in Phase 3) and mounts the tool via an
//      <astro-island>, vs the legacy shared/per-tool CSS + module script.
//   3. Entity escaping differs (React emits &#x27;, Astro emits &#39;).
// Everything deterministic must match: SEO head, security badge, h1 (with
// logo), lead, PageSections, #app loading placeholder, and the tool-extras
// static css/scripts (e.g. /static/gif-maker/gif-maker.css, /static/libs/*.js).
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(scriptDir, '..');

const TOOLS = [
    'batch-qrcode', 'blood-pressure-tracker', 'clean-urls', 'csv-redact', 'csv-sample',
    'emoji-picker', 'gif-cut', 'gif-frames', 'gif-maker', 'habit-tracker',
    'habitica-batch-tasks', 'habitica-egg-hatcher', 'hanzi-paper', 'image-adjust',
    'image-annotation', 'image-batch-crop', 'image-compress', 'image-convert',
    'image-grayscale', 'image-palette', 'image-placeholder', 'image-rotation',
    'image-round-corner', 'image-shadow', 'image-split', 'image-torn-edge',
    'image-watermark', 'line-paper', 'long-post-splitter', 'meal-planner',
    'merge-images', 'minecraft-shape-calculator', 'monthly-planner', 'number-images',
    'pixelate-images', 'qrcode-decode', 'reading-log', 'remove-whitespaces',
    'resize-images', 'rich-qrcode', 'shape-image', 'simple-qrcode', 'sleep-chart',
    'sudoku-generator', 'text-ascii-art', 'text-bubble', 'text-case-convert',
    'text-column-extractor', 'text-dedup', 'text-extract', 'text-frequency',
    'text-line-numbers', 'text-redact', 'text-sort', 'text-to-speech', 'text-truncate',
    'todo-paper', 'video-crop', 'video-cut', 'video-flip', 'video-frames',
    'video-speed', 'video-to-gif', 'video-to-mp3', 'video-volume', 'weight-tracker',
];

// Decode entity differences, collapse whitespace, and normalize HTML
// serialization differences (React emits charSet/self-closing tags, Astro
// emits charset/void tags without slash) for a stable fingerprint.
function normalize(s) {
    return s
        .replace(/\/>/g, '>')
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
        .replace(/^\s+|\s+$/g, '');
}

// Deterministic SEO fingerprint: <title>, all <meta>, canonical, hreflang links.
function seoFingerprint(html) {
    const parts = [];
    const title = html.match(/<title>[\s\S]*?<\/title>/);
    if (title) parts.push(normalize(title[0]));
    const metas = html.match(/<meta [^>]*>/g) || [];
    for (const m of metas) parts.push(normalize(m));
    const canonical = html.match(/<link rel="canonical" href="[^"]*"/);
    if (canonical) parts.push(normalize(canonical[0]));
    const hreflang = html.match(/<link rel="alternate" hrefLang="[^"]*" href="[^"]*"/g) || [];
    for (const h of hreflang) parts.push(normalize(h));
    return parts.join('\n');
}

// Main content: security badge, h1 (+logo), lead, PageSections, #app loading.
// The suggestions block (random) is cut at "You May Also Like", and Astro's
// island hydration machinery (astro-island element, injected scripts/styles)
// inside #app is normalized to the legacy loading placeholder it wraps.
function mainFingerprint(html) {
    const mainStart = html.indexOf('<main');
    const mainEnd = html.indexOf('</main>');
    if (mainStart < 0 || mainEnd < 0) return '';
    let main = html.slice(mainStart, mainEnd);
    // The suggestions block (random) is cut at its heading in either locale.
    for (const heading of ['You May Also Like', '你可能也喜欢']) {
        const cut = main.indexOf(heading);
        if (cut >= 0) {
            main = main.slice(0, cut);
            break;
        }
    }
    return normalize(
        main
            .replace(/<style>[\s\S]*?<\/style>/g, '')
            .replace(/<script>[\s\S]*?<\/script>/g, '')
            .replace(/<astro-island[^>]*>[\s\S]*?<\/astro-island>/g, LOADING)
            .replace(/<astro-island[^>]*\/>/g, '')
            .replace(/<astro-island[^>]*>[\s\S]*?<!--astro:end-->/g, '')
    );
}

// The legacy #app loading placeholder, used in place of the island that wraps it.
const LOADING =
    '<div class="d-flex align-items-center"><strong role="status">Loading...</strong><div class="spinner-border ms-auto" aria-hidden="true"></div></div>';

// Static tool-extras tags (/static/... css, /static/libs|jsdelivr scripts).
function extrasFingerprint(html) {
    const parts = [];
    const links = html.match(/<link rel="stylesheet" href="\/static\/[^"]*"/g) || [];
    const scripts = html.match(/<script src="\/(static|cdn\.jsdelivr|https:\/\/cdn\.jsdelivr)[^"]*"/g) || [];
    for (const l of links) parts.push(normalize(l));
    for (const s of scripts) parts.push(normalize(s));
    return parts.join('\n');
}

function fingerprint(html) {
    return [seoFingerprint(html), mainFingerprint(html), extrasFingerprint(html)].join('\n---\n');
}

let failures = 0;
for (const slug of TOOLS) {
    for (const locale of ['en', 'zh']) {
        const page = `${locale}/${slug}/index.html`;
        const baselinePath = resolve(ROOT, '.astro-baseline', page);
        const astroPath = resolve(ROOT, 'dist-astro', page);
        if (!existsSync(baselinePath) || !existsSync(astroPath)) {
            failures++;
            console.log(`FAIL  ${page} (missing)`);
            continue;
        }
        const a = fingerprint(readFileSync(baselinePath, 'utf-8'));
        const b = fingerprint(readFileSync(astroPath, 'utf-8'));
        if (a === b) {
            console.log(`PASS  ${page}`);
            continue;
        }
        failures++;
        const al = a.split('\n---\n');
        const bl = b.split('\n---\n');
        const labels = ['SEO', 'MAIN', 'EXTRAS'];
        let detail = '';
        for (let i = 0; i < 3; i++) {
            if (al[i] !== bl[i]) detail += ` [${labels[i]} differs]`;
        }
        let k = 0;
        while (k < a.length && k < b.length && a[k] === b[k]) k++;
        console.log(`FAIL  ${page}${detail}`);
        console.log(`      baseline: ...${a.slice(Math.max(0, k - 60), k + 140)}`);
        console.log(`      astro   : ...${b.slice(Math.max(0, k - 60), k + 140)}`);
    }
}
console.log(`\n${failures === 0 ? 'All tool pages match.' : `${failures} page(s) differ.`}`);
process.exit(failures === 0 ? 0 : 1);

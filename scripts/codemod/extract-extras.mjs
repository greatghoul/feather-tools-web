// Regenerates src/data/generated/tool-extras.json from the old Jinja templates:
// per-tool extra <script src> tags (classic globals like gif.js) and tool CSS
// links. Run after any codemod pass: node scripts/codemod/extract-extras.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OLD = '/home/greatghoul/feather-tools/app';

function mapUrl(raw) {
    // {{ url_for('static', filename='x/y.css') }}?v1.0 -> /static/x/y.css
    const m = /filename='([^']+)'/.exec(raw);
    if (m) return `/static/${m[1]}`;
    return raw.replace(/\{\{[^}]+\}\}/g, '').replace(/\?[^?]*$/, '').trim();
}

const toolsTs = readFileSync(resolve(ROOT, 'src/data/tools.ts'), 'utf-8');
const slugs = [...toolsTs.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1]);

const extras = {};
for (const slug of slugs) {
    const tplPath = resolve(OLD, 'templates/tools', slug, 'index.html');
    const scripts = [];
    const cssLinks = [];
    if (existsSync(tplPath)) {
        const tpl = readFileSync(tplPath, 'utf-8');
        for (const m of tpl.matchAll(/<script[^>]*src="([^"]+)"/g)) {
            const url = mapUrl(m[1]);
            if (url.startsWith('/static') || url.startsWith('http')) scripts.push(url);
        }
        for (const m of tpl.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)) {
            const url = mapUrl(m[1]);
            if (url.startsWith('/static')) cssLinks.push(url);
        }
    }
    extras[slug] = { scripts, cssLinks };
    const mark = scripts.length || cssLinks.length ? '*' : '';
    if (mark) console.log(`${mark}${slug}: scripts=${JSON.stringify(scripts)} css=${cssLinks.length}`);
}

const out = resolve(ROOT, 'src/data/generated/tool-extras.json');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(extras, null, 4) + '\n');
console.log(`extras written for ${slugs.length} tools`);

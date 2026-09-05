// Scans src/tools and src/components for .map() calls whose returned JSX has
// no key prop (React "Each child in a list should have a unique key"
// warnings). Reports file:line for every candidate.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve, dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(scriptDir, '..');
const SCAN_DIRS = [resolve(ROOT, 'src/tools'), resolve(ROOT, 'src/components')];

function walk(dir) {
    const out = [];
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) out.push(...walk(full));
        else if (extname(full) === '.tsx') out.push(full);
    }
    return out;
}

// Find the index of the closing paren that matches the opening paren at `start`
// (skipping strings, template literals, comments, and nested () [] {}).
function matchParen(src, start) {
    let depth = 0;
    let i = start;
    while (i < src.length) {
        const c = src[i];
        if (c === "'" || c === '"' || c === '`') {
            const quote = c;
            i++;
            while (i < src.length && src[i] !== quote) {
                if (src[i] === '\\') i++;
                i++;
            }
            i++;
            continue;
        }
        if (c === '/' && src[i + 1] === '/') {
            while (i < src.length && src[i] !== '\n') i++;
            continue;
        }
        if (c === '/' && src[i + 1] === '*') {
            i += 2;
            while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++;
            i += 2;
            continue;
        }
        if (c === '(' || c === '[' || c === '{') depth++;
        else if (c === ')' || c === ']' || c === '}') {
            depth--;
            if (depth === 0) return i;
        }
        i++;
    }
    return -1;
}

const results = [];
for (const dir of SCAN_DIRS) {
    for (const file of walk(dir)) {
        const src = readFileSync(file, 'utf-8');
        let searchFrom = 0;
        while (true) {
            const m = src.indexOf('.map(', searchFrom);
            if (m === -1) break;
            const close = matchParen(src, m + 4); // position of ')' at .map(...
            if (close === -1) {
                searchFrom = m + 1;
                continue;
            }
            // Slice from after the opening '(' to the closing ')'.
            const body = src.slice(m + 5, close);
            // Heuristic classification:
            // - A map that returns a shorthand fragment <>...</> is ALWAYS wrong:
            //   the fragment is what React keys, and <> cannot take a key — even
            //   when a key sits on an element inside the fragment, React warns.
            // - A JSX-returning map with no key anywhere is wrong.
            // - A bare function reference (arr.map(renderFn)) needs the render
            //   fn to key its own output — report it separately for review.
            const returnsFragment = /<>[\s\S]*<\/>/.test(body);
            const looksJsx = /<[A-Za-z]/.test(body);
            const hasKey = /\bkey\s*[=:]/.test(body);
            const isFunctionRef = /^[a-zA-Z_$][\w$]*$/.test(body.trim());
            if (returnsFragment || (looksJsx && !hasKey)) {
                const line = src.slice(0, m).split('\n').length;
                results.push({
                    kind: 'FIX',
                    file,
                    line,
                    snippet: body.trim().slice(0, 60).replace(/\s+/g, ' '),
                });
            } else if (isFunctionRef && looksJsx === false) {
                const line = src.slice(0, m).split('\n').length;
                results.push({
                    kind: 'VERIFY',
                    file,
                    line,
                    snippet: body.trim().slice(0, 60).replace(/\s+/g, ' '),
                });
            }
            searchFrom = close + 1;
        }
    }
}

const byFile = {};
for (const r of results) {
    (byFile[r.file] ??= []).push(r);
}
for (const [file, entries] of Object.entries(byFile)) {
    for (const e of entries) {
        console.log(`${file.replace(ROOT + '/', '')}:${e.line}  ${e.snippet}`);
    }
}
console.log(`\n${results.length} unkeyed .map() call(s) in ${Object.keys(byFile).length} file(s)`);

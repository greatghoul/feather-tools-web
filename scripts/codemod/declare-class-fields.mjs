// Inserts explicit field declarations into classes converted from plain JS.
// Old JS assigns this.* in constructors/methods without declarations, which
// TS rejects (TS2339). Collects this.<prop> = assignments per file and adds
// `private <prop>: any;` after each class declaration line.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdirSync, statSync } from 'node:fs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

function listFiles(dir) {
    const files = [];
    if (!require_exists(dir)) return files;
    function require_exists(p) { try { statSync(p); return true; } catch { return false; } }
    for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) files.push(...listFiles(p));
        else files.push(p);
    }
    return files;
}

const files = [
    ...listFiles(join(ROOT, 'src/tools')),
    ...listFiles(join(ROOT, 'src/components')),
    ...listFiles(join(ROOT, 'src/services')),
].filter((f) => /\.(ts|tsx)$/.test(f));

let patched = 0;
for (const file of files) {
    const src = readFileSync(file, 'utf-8');
    if (!/\bclass\s+\w+/.test(src)) continue;

    const props = new Set();
    for (const m of src.matchAll(/this\.(\w+)\s*=(?![=>])/g)) {
        props.add(m[1]);
    }
    if (props.size === 0) continue;

    // skip props already declared as class fields or with modifiers
    const declared = new Set();
    for (const m of src.matchAll(/^\s*(?:private|public|protected|readonly|declare)?\s*(\w+)\s*[?]?:\s*[^=;\n]+[;=]/gm)) {
        declared.add(m[1]);
    }
    const toDeclare = [...props].filter((p) => !declared.has(p));
    if (toDeclare.length === 0) continue;

    const decls = toDeclare.map((p) => `private ${p}: any;`).join('\n        ');
    const out = src.replace(
        /^(\s*)((?:export\s+)?(?:default\s+)?abstract\s+class\s+\w+[^{]*|(?:export\s+)?(?:default\s+)?class\s+\w+[^{]*)\{\s*$/gm,
        (m, indent, header) => `${indent}${header} {\n${indent}    ${decls}\n`
    );
    if (out !== src) {
        writeFileSync(file, out);
        patched++;
        console.log(`declared fields in ${file.replace(ROOT + '/', '')}`);
    }
}
console.log(`patched ${patched} files`);

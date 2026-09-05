// One-shot migration codemod: old Preact/htm tool JS -> React/JSX under src/.
// Run: node scripts/codemod/convert.mjs [slug ...]   (no args = all remaining tools)
//
// Handles: htm template -> JSX, preact imports -> react, getText -> t,
// goober css`` -> CSS Modules, @/ aliases -> relative paths, per-tool
// entries/{en,zh}.tsx generation, Jinja content sections -> PageSections.tsx.
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, readdirSync, statSync, copyFileSync } from 'node:fs';
import { resolve, join, dirname, relative, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OLD = '/home/greatghoul/feather-tools/app';
const NEW = ROOT;
const LOCALES = ['en', 'zh'];
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

// ---------------------------------------------------------------- scanner --
function skipString(src, i, q) {
    i++;
    while (i < src.length) {
        if (src[i] === '\\') { i += 2; continue; }
        if (src[i] === q) return i;
        i++;
    }
    return i;
}

function skipTemplate(src, i) { // src[i] === '`'
    i++;
    while (i < src.length) {
        if (src[i] === '\\') { i += 2; continue; }
        if (src[i] === '`') return i;
        if (src[i] === '$' && src[i + 1] === '{') {
            const end = findMatchingBrace(src, i + 1);
            i = end < 0 ? src.length : end + 1;
            continue;
        }
        i++;
    }
    return i;
}

function findMatchingBrace(src, i) { // src[i] === '{'
    let depth = 0;
    while (i < src.length) {
        const c = src[i];
        if (c === '/' && src[i + 1] === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
        if (c === '/' && src[i + 1] === '*') { i += 2; while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++; i += 2; continue; }
        if (c === '"' || c === "'") { i = skipString(src, i, c); i++; continue; }
        if (c === '`') { i = skipTemplate(src, i); i++; continue; }
        if (c === '{') depth++;
        else if (c === '}') { depth--; if (depth === 0) return i; }
        i++;
    }
    return -1;
}

// ------------------------------------------------------------- htm -> JSX --
const ATTR_MAP = {
    'class': 'className', 'for': 'htmlFor', 'readonly': 'readOnly',
    'maxlength': 'maxLength', 'minlength': 'minLength', 'tabindex': 'tabIndex',
    'colspan': 'colSpan', 'rowspan': 'rowSpan', 'contenteditable': 'contentEditable',
    'spellcheck': 'spellCheck', 'srcset': 'srcSet', 'autocomplete': 'autoComplete',
    'autofocus': 'autoFocus', 'autoplay': 'autoPlay', 'crossorigin': 'crossOrigin',
    'datetime': 'dateTime', 'enctype': 'encType', 'formaction': 'formAction',
    'novalidate': 'noValidate', 'playsinline': 'playsInline', 'accesskey': 'accessKey',
    'allowfullscreen': 'allowFullScreen', 'usemap': 'useMap', 'inputmode': 'inputMode',
    'referrerpolicy': 'referrerPolicy',
};

function mapAttrName(name) {
    const lower = name.toLowerCase();
    if (ATTR_MAP[lower]) return ATTR_MAP[lower];
    if (/^(data|aria)-/.test(lower)) return lower;
    // lowercase event handlers (old htm sources) -> React camelCase
    if (/^on[a-z]+$/.test(lower) && name === lower) {
        return 'on' + lower[2].toUpperCase() + lower.slice(3);
    }
    if (lower.includes('-')) return lower.replace(/-([a-zA-Z])/g, (_, c) => c.toUpperCase());
    return name;
}

function cssPropCamel(p) {
    p = p.trim();
    if (p.startsWith('--')) return `'${p}'`;
    return p.replace(/-([a-zA-Z])/g, (_, c) => c.toUpperCase());
}

function styleStringToObject(str) {
    const parts = str.split(';').map((s) => s.trim()).filter(Boolean);
    const entries = parts.map((decl) => {
        const idx = decl.indexOf(':');
        if (idx < 0) return null;
        const prop = cssPropCamel(decl.slice(0, idx));
        const value = decl.slice(idx + 1).trim().replace(/'/g, "\\'");
        return `${prop}: '${value}'`;
    }).filter(Boolean);
    return `{{ ${entries.join(', ')} }}`;
}

function parseTag(raw, i, stack) {
    // raw[i] === '<'; returns { text, next, isTag }
    let j = i + 1;
    let isComponent = false;
    let jsxName = null;
    let htmlName = null;
    if (raw[j] === '$' && raw[j + 1] === '{') {
        const end = findMatchingBrace(raw, j + 1);
        const expr = raw.slice(j + 2, end).trim();
        jsxName = expr;
        isComponent = true;
        j = end + 1;
    } else {
        const m = /^[a-zA-Z][a-zA-Z0-9_.-]*/.exec(raw.slice(j));
        if (!m) return { text: raw[i], next: i + 1 };
        htmlName = m[0];
        jsxName = m[0];
        j += m[0].length;
    }

    let attrs = '';
    let selfClose = false;
    while (j < raw.length) {
        const c = raw[j];
        if (/\s/.test(c)) { j++; continue; }
        if (c === '/' && raw[j + 1] === '>') { selfClose = true; j += 2; break; }
        if (c === '>') { j++; break; }
        // spread
        if (raw.startsWith('...${', j)) {
            const end = findMatchingBrace(raw, j + 4);
            const expr = raw.slice(j + 5, end);
            attrs += ` {...${expr}}`;
            j = end + 1;
            continue;
        }
        // attribute name
        let m = /^[^\s=/>]+/.exec(raw.slice(j));
        if (!m) { j++; continue; }
        const rawName = m[0];
        j += m[0].length;
        while (/\s/.test(raw[j])) j++; // htm allows spaces before =
        let value = null; // null = boolean attr
        let quoted = false;
        if (raw[j] === '=') {
            j++;
            while (/\s/.test(raw[j])) j++;
            if (raw[j] === '"' || raw[j] === "'") {
                const q = raw[j];
                const end = skipString(raw, j, q);
                value = raw.slice(j + 1, end);
                quoted = true;
                j = end + 1;
            } else if (raw[j] === '$' && raw[j + 1] === '{') {
                const end = findMatchingBrace(raw, j + 1);
                value = raw.slice(j + 2, end);
                j = end + 1;
            } else {
                let m2 = /^[^\s>/]+/.exec(raw.slice(j));
                value = m2 ? m2[0] : '';
                j += value.length;
            }
        }
        const name = isComponent ? rawName : mapAttrName(rawName);
        if (value === null) {
            attrs += ` ${mapAttrName(rawName)}`;
            continue;
        }
        if (quoted && !value.includes('${')) {
            if (rawName === 'style') {
                attrs += ` style=${styleStringToObject(value)}`;
            } else {
                attrs += ` ${name}="${value}"`;
            }
            continue;
        }
        if (quoted) {
            // mixed static + ${} interpolation -> template literal
            if (rawName === 'style') {
                attrs += ` style={\`${value}\`}`; // string style: rare; object assumed
            } else {
                attrs += ` ${name}={\`${value}\`}`;
            }
            continue;
        }
        if (rawName === 'style' && value.trim().startsWith('{')) {
            attrs += ` style={${value.trim()}}`;
            continue;
        }
        attrs += ` ${name}={${value}}`;
    }

    let text = `<${jsxName}${attrs}${selfClose ? ' />' : '>'}`;
    if (isComponent && !selfClose) {
        stack.push(jsxName);
    } else if (!isComponent && !selfClose && VOID.has(htmlName)) {
        text = text.slice(0, -1) + ' />';
    }
    return { text, next: j, isTag: true, htmlName, selfClose, isComponent };
}

function transformTemplate(raw) {
    let out = '';
    const stack = [];
    let i = 0;
    while (i < raw.length) {
        if (raw[i] === '$' && raw[i + 1] === '{') {
            const end = findMatchingBrace(raw, i + 1);
            const expr = convertHtmlTemplates(raw.slice(i + 2, end));
            out += `{${expr}}`;
            i = end + 1;
            continue;
        }
        if (raw.startsWith('<//>', i)) {
            const name = stack.pop();
            out += `</${name ?? 'div'}>`;
            i += 4;
            continue;
        }
        // </${Expr}> component close
        if (raw.startsWith('</${', i)) {
            const end = findMatchingBrace(raw, i + 3);
            const expr = raw.slice(i + 4, end).trim();
            out += `</${expr}>`;
            const si = stack.indexOf(expr);
            if (si >= 0) stack.splice(si, 1);
            i = end + 2; // skip }> then '>'
            continue;
        }
        if (raw.startsWith('<!--', i)) {
            const end = raw.indexOf('-->', i);
            out += `{/* ${raw.slice(i + 4, end < 0 ? raw.length : end).trim()} */}`;
            i = end < 0 ? raw.length : end + 3;
            continue;
        }
        if (raw[i] === '<' && /[a-zA-Z$]/.test(raw[i + 1] ?? '')) {
            const r = parseTag(raw, i, stack);
            out += r.text;
            i = r.next;
            // <style> children: keep raw CSS (braces are not JSX expressions)
            if (r.htmlName === 'style' && !r.selfClose) {
                const close = raw.indexOf('</style>', i);
                const cssContent = raw.slice(i, close < 0 ? raw.length : close);
                out += '{`' + cssContent + '`}</style>';
                i = close < 0 ? raw.length : close + 8;
            }
            continue;
        }
        out += raw[i];
        i++;
    }
    while (stack.length) out += `</${stack.pop()}>`;
    return out;
}

function convertHtmlTemplates(code) {
    let out = '';
    let i = 0;
    while (i < code.length) {
        if (code.startsWith('html`', i)) {
            const close = skipTemplate(code, i + 4);
            const raw = code.slice(i + 5, close);
            const jsx = transformTemplate(raw);
            out += `(\n<>\n${jsx}\n</>\n)`;
            i = close + 1;
            continue;
        }
        out += code[i];
        i++;
    }
    return out;
}

// --------------------------------------------------- goober -> CSS module --
function flattenCss(body, cls) {
    let out = '';
    let buf = '';
    let depth = 0;
    for (let i = 0; i < body.length; i++) {
        const c = body[i];
        if (c === '{') {
            if (depth === 0) {
                out += buf.replace(/&/g, `.${cls}`).trim() + ' {\n';
                buf = '';
            } else {
                out += c;
            }
            depth++;
            continue;
        }
        if (c === '}') {
            depth--;
            if (depth === 0) {
                out += buf + '\n}\n';
                buf = '';
            } else {
                out += c;
            }
            continue;
        }
        if (depth === 0) buf += c;
        else out += c.replace(/&/g, `.${cls}`);
    }
    const main = buf.trim() ? `.${cls} {\n${buf.trim()}\n}\n` : '';
    return main + out;
}

function extractGooberCss(code) {
    const blocks = [];
    let out = code.replace(/const\s+(\w+)\s*=\s*css`(?:[^`\\]|\\.)*`;\s*\n?/g, (m, name) => {
        const body = /css`([\s\S]*)`/.exec(m)[1];
        blocks.push({ name, body });
        return '';
    });
    if (blocks.length === 0) return { code: out, css: null, names: [] };
    let cssText = '';
    const names = [];
    for (const { name, body } of blocks) {
        names.push(name);
        cssText += flattenCss(body, name) + '\n';
    }
    return { code: out, css: cssText, names };
}

// --------------------------------------------------------- import rewrites --
function rewriteImports(code, relDirFromToolRoot, toolSlug) {
    const lines = code.split('\n');
    const out = [];
    for (let line of lines) {
        if (/^import\s+.*from\s+'(htm\/preact|preact|preact\/debug|goober)';?\s*$/.test(line)) {
            continue; // drop html/render/h/goober imports
        }
        if (/^import\s+\{?\s*setup\s*\}?\s*from\s+'goober';?\s*$/.test(line)) continue;
        if (/^import\s+text-sort\.css/.test(line)) continue;
        line = line.replace(/from\s+'preact\/hooks'/g, "from 'react'");
        line = line.replace(/from\s+'~\/helpers\/utils\.js'/g, "from '~/helpers/i18n'");
        line = line.replace(/from\s+'~\/helpers\/(files|messages)\.js'/g, "from '~/helpers/$1'");
        line = line.replace(/from\s+'~\/(components|contexts|services)\/([^']+)\.js'/g, "from '~/$1/$2'");
        // @/ alias -> relative path into the tool dir
        line = line.replace(/from\s+'@\/([^']+)'/g, (m, p) => {
            const depth = relDirFromToolRoot ? relDirFromToolRoot.split('/').length : 0;
            const up = depth === 0 ? './' : '../'.repeat(depth);
            return `from '${up}${p}'`;
        });
        // relative .js extension drop
        line = line.replace(/from\s+'(\.\.?\/[^']+)\.js'/g, "from '$1'");
        out.push(line);
    }
    let result = out.join('\n');
    result = result.replace(/\bgetText\b/g, 't');
    result = result.replace(/^\s*setup\(h\);?\s*$/gm, '');
    return result;
}

// -------------------------------------------------------------- per file --
function convertFile(srcPath, outPath, toolSlug, relDirFromToolRoot) {
    const original = readFileSync(srcPath, 'utf-8');
    const hasJsx = /html`/.test(original);
    let code = original;
    // htm -> JSX
    code = convertHtmlTemplates(code);
    // goober css blocks -> module css
    const { code: code2, css, names } = extractGooberCss(code);
    code = code2;
    // imports
    code = rewriteImports(code, relDirFromToolRoot, toolSlug);
    // style class references: only in ${name} interpolations and ={name} attr positions
    for (const name of names) {
        code = code.replace(new RegExp(`\\$\\{${name}\\}`, 'g'), `\${styles.${name}}`);
        code = code.replace(new RegExp(`(?<==\\s*)\\b${name}\\b`, 'g'), `styles.${name}`);
    }
    if (names.length > 0) {
        const cssFile = basename(srcPath).replace(/\.js$/, '.module.css');
        const lines = code.split('\n');
        let lastImport = -1;
        lines.forEach((l, idx) => { if (/^import\s/.test(l)) lastImport = idx; });
        lines.splice(lastImport + 1, 0, `import styles from './${cssFile}';`);
        code = lines.join('\n');
        writeFileSync(join(dirname(outPath), cssFile), css);
    }
    return { code, hasJsx };
}

// ------------------------------------------------------------ main files --
function convertMainFile(srcPath, outDir, toolSlug) {
    let code = readFileSync(srcPath, 'utf-8');
    // strip trailing DOMContentLoaded bootstrap
    const idx = code.indexOf("document.addEventListener('DOMContentLoaded'");
    let componentName = null;
    if (idx >= 0) {
        const tail = code.slice(idx);
        const m = /render\(\s*html`<\$\{(\w+)/.exec(tail) || /render\(html`<\$\{(\w+)/.exec(tail);
        componentName = m ? m[1] : null;
        code = code.slice(0, idx).trimEnd() + '\n';
    }
    code = convertHtmlTemplates(code);
    const { code: code2, css, names } = extractGooberCss(code);
    code = code2;
    code = rewriteImports(code, '', toolSlug);
    for (const name of names) {
        code = code.replace(new RegExp(`\\$\\{${name}\\}`, 'g'), `\${styles.${name}}`);
        code = code.replace(new RegExp(`(?<==\\s*)\\b${name}\\b`, 'g'), `styles.${name}`);
    }
    if (names.length > 0) {
        writeFileSync(join(outDir, 'App.module.css'), css);
        const lines = code.split('\n');
        let lastImport = -1;
        lines.forEach((l, idx) => { if (/^import\s/.test(l)) lastImport = idx; });
        lines.splice(lastImport + 1, 0, `import styles from './App.module.css';`);
        code = lines.join('\n');
    }
    // find main component name if not captured
    if (!componentName) {
        const m = /const\s+(\w+)\s*=\s*\(\)\s*=>/.exec(code);
        componentName = m ? m[1] : 'App';
    }
    if (!/export default /.test(code)) {
        code += `\nexport default ${componentName};\n`;
    }
    writeFileSync(join(outDir, 'App.tsx'), code);
    return componentName;
}

// ---------------------------------------------------------------- entries --
function writeEntries(toolDir) {
    for (const locale of LOCALES) {
        const content = `import { initMessages } from '~/helpers/i18n';
import { mountApp } from '~/helpers/mount';
import commonMessages from '~/i18n/client/${locale}.json';
import toolMessages from '../i18n/${locale}.json';
import App from '../App';

window.LOCALE = '${locale}';
initMessages({ ...commonMessages, ...toolMessages });
mountApp(<App />);
`;
        writeFileSync(join(toolDir, 'entries', `${locale}.tsx`), content);
    }
}

// ------------------------------------------------------ template sections --
function convertTemplateSections(toolSlug) {
    const tplPath = join(OLD, 'templates/tools', toolSlug, 'index.html');
    if (!existsSync(tplPath)) return { before: '', after: '', scripts: [], cssLinks: [] };
    const tpl = readFileSync(tplPath, 'utf-8');
    const contentMatch = /\{%\s*block content\s*%\}([\s\S]*?)\{%\s*endblock\s*%\}/.exec(tpl);
    if (!contentMatch) return { before: '', after: '', scripts: [], cssLinks: [] };
    let content = contentMatch[1];

    // collect extra scripts / css links from head block
    const scripts = [];
    const cssLinks = [];
    const headMatch = /\{%\s*block head\s*%\}([\s\S]*?)\{%\s*endblock\s*%\}/.exec(tpl);
    if (headMatch) {
        for (const m of headMatch[1].matchAll(/<script[^>]*src="([^"]+)"/g)) {
            const url = m[1].replace(/\{\{[^}]+\}\}/g, '').replace(/\?[^?]*$/, '').trim();
            if (url && !url.includes('register_tool_assets')) scripts.push(url);
        }
        for (const m of headMatch[1].matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)) {
            const url = m[1];
            if (url.includes('static') && !url.includes('register')) cssLinks.push(url);
        }
    }

    // strip jinja constructs we handle elsewhere
    content = content
        .replace(/\{%\s*include\s+'shared\/security_badge\.html'\s*%\}/g, '')
        .replace(/\{%\s*include\s+'shared\/app\.html'\s*%\}/g, '@@APP@@')
        .replace(/\{%\s*from[^%]*%\}/g, '')
        .replace(/\{%\s*import[^%]*%\}/g, '');

    // inline #app divs: self-contained first, then the spinner two-div variant
    content = content.replace(/<div id="app"[^>]*><\/div>/, '@@APP@@');
    content = content.replace(/<div id="app"[^>]*>[\s\S]*?<\/div>\s*<\/div>/, '@@APP@@');

    // page header (h1/p) rendered by the shell
    content = content.replace(/<h1[^>]*>\{\{\s*page_name\s*\}\}<\/h1>/, '')
        .replace(/<p[^>]*>\{\{\s*page_note\s*\}\}<\/p>/, '');

    // jinja expressions
    content = content.replace(/\{\{\s*_\('([^']+)'\)\s*\|\s*safe\s*\}\}/g, "@@SAFE:$1@@");
    content = content.replace(/\{\{\s*_\('([^']+)'\)\s*\}\}/g, '@@T:$1@@');
    content = content.replace(/\{\{\s*_\("([^"]+)"\)\s*\}\}/g, '@@T:$1@@');
    content = content.replace(/\{\{\s*page_(name|note|tags)\s*\}\}/g, '');
    content = content.replace(/\{\{[\s\S]*?\}\}/g, (m) => `{/* TODO jinja: ${m.trim()} */}`);
    content = content.replace(/\{%[\s\S]*?%\}/g, (m) => `{/* TODO jinja: ${m.trim()} */}`);

    // split at @@APP@@
    let before = '';
    let after = content;
    const appIdx = content.indexOf('@@APP@@');
    if (appIdx >= 0) {
        before = content.slice(0, appIdx);
        after = content.slice(appIdx + '@@APP@@'.length);
    }

    const toJsx = (html) => {
        if (!html.trim()) return '';
        let x = html
            .replace(/@@SAFE:([^@]+)@@/g, "<span dangerouslySetInnerHTML={{ __html: t('$1') }} />")
            .replace(/@@T:'([^']+)'@@/g, "{t('$1')}")
            .replace(/@@T:([^@]+)@@/g, "{t('$1')}");
        return transformTemplate(x);
    };

    const scriptsUrls = scripts.map((s) => s.replace(/\{\{[^}]*\}\}/g, ''));
    return { before: toJsx(before), after: toJsx(after), scripts: scriptsUrls, cssLinks };
}

// ------------------------------------------------------------ orchestrator --
function listFiles(dir) {
    const files = [];
    if (!existsSync(dir)) return files;
    for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) files.push(...listFiles(p));
        else files.push(p);
    }
    return files;
}

const EXCLUDE_TOOL_DIRS = new Set(['ffmpeg']); // vendored, copied as assets

function convertTool(slug) {
    const srcDir = join(OLD, 'static', slug);
    const outDir = join(NEW, 'src/tools', slug);
    if (!existsSync(srcDir)) {
        console.log(`SKIP ${slug}: no static dir`);
        return;
    }
    rmSync(outDir, { recursive: true, force: true });
    mkdirSync(join(outDir, 'entries'), { recursive: true });
    // NOTE: this wipes src/tools/<slug>/i18n slices generated by convert-i18n;
    // re-run `npm run convert-i18n` after the codemod to restore them.

    const files = listFiles(srcDir).filter((f) => f.endsWith('.js'));
    for (const file of files) {
        const relPath = relative(srcDir, file);
        const parts = relPath.split('/');
        const base = parts[parts.length - 1];
        if (parts.some((p) => EXCLUDE_TOOL_DIRS.has(p))) continue; // vendored
        const isMain = base === `${slug}.js`;
        const relDir = parts.slice(0, -1).join('/');
        if (isMain) {
            convertMainFile(file, outDir, slug);
            continue;
        }
        const outRel = parts.map((p, i2) => (i2 === parts.length - 1 ? p.replace(/\.js$/, '.tsx') : p)).join('/');
        const outPath = join(outDir, outRel);
        mkdirSync(dirname(outPath), { recursive: true });
        const { code, hasJsx } = convertFile(file, outPath, slug, relDir);
        const finalPath = hasJsx ? outPath : outPath.replace(/\.tsx$/, '.ts');
        writeFileSync(finalPath, code.trimEnd() + '\n');
    }

    // template sections + extra scripts
    const sections = convertTemplateSections(slug);
    const hasSections = sections.before.trim() || sections.after.trim();
    if (hasSections) {
        const content = `import { t } from '~/helpers/i18n';

export const SectionsBefore = () => (
    <>
${sections.before}
    </>
);

export const SectionsAfter = () => (
    <>
${sections.after}
    </>
);
`;
        writeFileSync(join(outDir, 'PageSections.tsx'), content);
    }

    writeEntries(outDir);

    // extra scripts map (run scripts/codemod/extract-extras.mjs to regenerate all)
    extras[slug] = { scripts: sections.scripts, cssLinks: sections.cssLinks };
    console.log(`converted ${slug}`);
}

// shared dirs (components/contexts/services)
function convertShared() {
    for (const dir of ['components', 'contexts', 'services']) {
        const srcDir = join(OLD, 'static', dir);
        for (const file of listFiles(srcDir).filter((f) => f.endsWith('.js'))) {
            const base = basename(file).replace(/\.js$/, '');
            const outPath = join(NEW, 'src', dir, `${base}.tsx`);
            if (existsSync(outPath) || existsSync(outPath.replace(/\.tsx$/, '.ts'))) {
                continue; // already hand-migrated
            }
            mkdirSync(dirname(outPath), { recursive: true });
            const { code, hasJsx } = convertFile(file, outPath, '__shared__', dir);
            writeFileSync(hasJsx ? outPath : outPath.replace(/\.tsx$/, '.ts'), code.trimEnd() + '\n');
            console.log(`shared ${dir}/${base}`);
        }
    }
}

// main
const args = process.argv.slice(2);
const extrasPath = join(NEW, 'src/data/generated/tool-extras.json');
let extras = {};
if (existsSync(extrasPath)) extras = JSON.parse(readFileSync(extrasPath, 'utf-8'));

convertShared();

const toolsRoot = join(NEW, 'src/tools');
const doneTools = new Set(readdirSync(toolsRoot).filter((d) => existsSync(join(toolsRoot, d, 'App.tsx'))));
// only directories registered as tools in src/data/tools.ts (excludes libs/, templates/, ...)
const toolsTs = readFileSync(join(NEW, 'src/data/tools.ts'), 'utf-8');
const registeredTools = new Set([...toolsTs.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1]));
const allTools = readdirSync(join(OLD, 'static')).filter((d) => statSync(join(OLD, 'static', d)).isDirectory() && registeredTools.has(d));
const targets = args.length ? args : allTools.filter((t) => !doneTools.has(t));

for (const slug of targets) {
    convertTool(slug);
}

mkdirSync(dirname(extrasPath), { recursive: true });
writeFileSync(extrasPath, JSON.stringify(extras, null, 4) + '\n');
console.log(`\nDone. Converted: ${targets.length} tools`);

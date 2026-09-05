// Static page generation: pre-renders per-locale HTML shells (home, static
// pages, migrated tool pages) plus sitemap/redirects/404 into dist/.
//
// Run after scripts/build-bundles.ts (reads dist/.bundle-map.json).
import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactElement } from 'react';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, type Locale } from '~/data/site';
import { TOOLS, TOOL_MAP } from '~/data/tools';
import { STATIC_PAGES } from '~/data/pages';
import { initMessages, t } from '~/helpers/i18n';
import { Layout } from '~/pages/Layout';
import { HomePage } from '~/pages/HomePage';
import { ToolPage } from '~/pages/ToolPage';
import { StaticPage } from '~/pages/StaticPage';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const PROJECT = resolve(scriptDir, '..');
const DIST = resolve(PROJECT, 'dist');

const LOCALES = SITE.locales as readonly Locale[];
const TODAY = new Date().toISOString().slice(0, 10);

function loadJson(file: string): Record<string, string> {
    return JSON.parse(readFileSync(resolve(PROJECT, file), 'utf-8'));
}

const fullMessages: Record<Locale, Record<string, string>> = {
    en: loadJson('src/i18n/en.json'),
    zh: loadJson('src/i18n/zh.json'),
};

// Vite manifest maps entry source paths (src/tools/<slug>/entries/<locale>.tsx)
// to built chunk files. The HTML references only the entry chunk; the browser
// fetches its shared chunks (vendor/shared/messages-*) via ESM imports.
interface ManifestEntry {
    file: string;
    isEntry?: boolean;
    css?: string[];
    imports?: string[];
}

const manifest: Record<string, ManifestEntry> = JSON.parse(
    readFileSync(resolve(DIST, '.vite/manifest.json'), 'utf-8')
);
const bundleMap: Record<string, string> = {};
const manifestKeyMap: Record<string, string> = {};
for (const [key, info] of Object.entries(manifest)) {
    const match = key.match(/tools\/([^/]+)\/entries\/(en|zh)\.tsx$/);
    if (info.isEntry && match) {
        bundleMap[`tools/${match[1]}/${match[2]}`] = info.file;
        manifestKeyMap[`tools/${match[1]}/${match[2]}`] = key;
    }
}

// CSS lives in chunk-level files that Vite would normally inject via <link>
// into HTML entries; our HTML is hand-generated, so walk the manifest import
// graph and collect every css file the entry's chunk tree needs.
function collectCss(manifestKey: string, seen = new Set<string>()): string[] {
    const info = manifest[manifestKey];
    if (!info || seen.has(manifestKey)) return [];
    seen.add(manifestKey);
    const css = [...(info.css ?? [])];
    for (const imp of info.imports ?? []) {
        css.push(...collectCss(imp, seen));
    }
    return css;
}
const migratedTools = Object.keys(bundleMap)
    .map((key) => key.split('/')[1])
    .filter((slug, index, all) => all.indexOf(slug) === index)
    .sort();

// Per-tool static sections (how-to-use / features cards converted from the old
// Jinja templates) and extra asset tags (global scripts, tool CSS).
interface PageSectionsModule {
    SectionsBefore?: () => ReactElement;
    SectionsAfter?: () => ReactElement;
}
const sections: Record<string, PageSectionsModule> = {};
for (const slug of migratedTools) {
    try {
        sections[slug] = await import(`../src/tools/${slug}/PageSections`);
    } catch {
        // tool has no static sections
    }
}

const extras: Record<string, { scripts: string[]; cssLinks: string[] }> = JSON.parse(
    readFileSync(resolve(PROJECT, 'src/data/generated/tool-extras.json'), 'utf-8')
);

// Build-time random pick, mirroring the old get_suggested_tools().
function pickSuggested(slug: string, count = 4): string[] {
    const category = TOOL_MAP[slug]?.category;
    const candidates = TOOLS
        .filter((x) => x.category === category && x.slug !== slug && migratedTools.includes(x.slug))
        .map((x) => x.slug);
    return candidates.sort(() => Math.random() - 0.5).slice(0, count);
}

function buildKeywords(tagKey?: string): string {
    const siteKeywords = t('site/keywords').split(',').map((s) => s.trim()).filter(Boolean);
    const pageTags = tagKey ? t(tagKey).split(',').map((s) => s.trim()).filter(Boolean) : [];
    return [...new Set([...pageTags, ...siteKeywords])].join(', ');
}

function renderPage(outPath: string, element: ReactElement): void {
    const html = '<!DOCTYPE html>\n' + renderToStaticMarkup(element);
    const file = resolve(DIST, outPath.replace(/^\//, ''), 'index.html');
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, html + '\n');
    console.log(`page ${outPath}`);
}

function alternatesFor(pathSuffix: string): Record<Locale, string> {
    return Object.fromEntries(LOCALES.map((loc) => [loc, `/${loc}/${pathSuffix}`])) as Record<Locale, string>;
}

function pageTitle(name: string | null): string {
    return name ? `${name} | ${t('site/title')}` : t('site/title');
}

// ---------- pages ----------
for (const locale of LOCALES) {
    initMessages(fullMessages[locale]);

    // home
    renderPage(
        `/${locale}/`,
        <Layout
            locale={locale}
            path={`/${locale}/`}
            alternates={alternatesFor('')}
            title={pageTitle(null)}
            description={t('site/description')}
            keywords={buildKeywords()}
        >
            <HomePage locale={locale} tools={migratedTools} />
        </Layout>
    );

    // about / privacy / terms
    for (const page of STATIC_PAGES) {
        renderPage(
            `/${locale}/${page.key}/`,
            <Layout
                locale={locale}
                path={`/${locale}/${page.key}/`}
                alternates={alternatesFor(`${page.key}/`)}
                title={pageTitle(t(page.titleKey))}
                description={t(page.descriptionKey)}
                keywords={buildKeywords(page.tagsKey)}
            >
                <StaticPage page={page} />
            </Layout>
        );
    }

    // tool pages
    for (const slug of migratedTools) {
        const sectionMod = sections[slug];
        const Before = sectionMod?.SectionsBefore;
        const After = sectionMod?.SectionsAfter;
        const extraTags = (
            <>
                {(extras[slug]?.cssLinks ?? []).map((href) => (
                    <link key={href} rel="stylesheet" href={href} />
                ))}
                {(extras[slug]?.scripts ?? []).map((src) => (
                    <script key={src} src={src} />
                ))}
            </>
        );
        renderPage(
            `/${locale}/${slug}/`,
            <Layout
                locale={locale}
                path={`/${locale}/${slug}/`}
                alternates={alternatesFor(`${slug}/`)}
                title={pageTitle(t(`${slug}/name`))}
                description={t(`${slug}/note`)}
                keywords={buildKeywords(`${slug}/tags`)}
                cssLinks={collectCss(manifestKeyMap[`tools/${slug}/${locale}`])}
                scripts={
                    <>
                        {extraTags}
                        <script type="module" src={`/${bundleMap[`tools/${slug}/${locale}`]}`} />
                    </>
                }
            >
                <ToolPage
                    slug={slug}
                    locale={locale}
                    suggested={pickSuggested(slug)}
                    before={Before ? <Before /> : undefined}
                    after={After ? <After /> : undefined}
                />
            </Layout>
        );
    }
}

// ---------- sitemap ----------
function sitemapUrl(path: string, changefreq: string, priority: string): string {
    const alternates = LOCALES.map((loc) => {
        const hreflang = loc === 'zh' ? 'zh-CN' : loc;
        return `      <xhtml:link rel="alternate" hreflang="${hreflang}" href="${SITE.baseUrl}/${loc}/${path}"/>`;
    });
    const xDefault = `      <xhtml:link rel="alternate" hreflang="x-default" href="${SITE.baseUrl}/${SITE.defaultLocale}/${path}"/>`;
    return [
        '    <url>',
        `      <loc>${SITE.baseUrl}/${LOCALES[0]}/${path}</loc>`,
        ...alternates,
        xDefault,
        `      <lastmod>${TODAY}</lastmod>`,
        `      <changefreq>${changefreq}</changefreq>`,
        `      <priority>${priority}</priority>`,
        '    </url>',
    ].join('\n');
}

const sitemapEntries = [
    sitemapUrl('', 'weekly', '1.0'),
    ...STATIC_PAGES.map((page) => sitemapUrl(`${page.key}/`, 'monthly', '0.8')),
    ...migratedTools.map((slug) => sitemapUrl(`${slug}/`, 'weekly', '0.9')),
];
const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...sitemapEntries,
    '</urlset>',
    '',
].join('\n');
writeFileSync(resolve(DIST, 'sitemap.xml'), sitemap);
console.log('sitemap.xml');

// ---------- _redirects (legacy ?lang= URLs -> per-locale paths) ----------
// 301 (permanent) so legacy URL equity transfers at the domain cutover.
const redirectLines: string[] = [
    '# Legacy URLs: default to English, ?lang=zh goes to the Chinese page.',
    '# Query rules must come before their plain counterparts.',
    '/ ?lang=zh /zh/ 301',
    '/ /en/ 301',
];
for (const key of ['about', 'privacy', 'terms', ...migratedTools]) {
    redirectLines.push(`/${key} ?lang=zh /zh/${key}/ 301`);
    redirectLines.push(`/${key} /en/${key}/ 301`);
}
writeFileSync(resolve(DIST, '_redirects'), redirectLines.join('\n') + '\n');
console.log('_redirects');

// ---------- 404 (redirect to home) ----------
const notFound = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="refresh" content="0; url=/en/">
    <title>Page not found | ${t('site/title')}</title>
</head>
<body>
    <p>Page not found. 页面不存在。</p>
    <p><a href="/en/">Go to homepage / 返回首页</a></p>
</body>
</html>
`;
writeFileSync(resolve(DIST, '404.html'), notFound);
console.log('404.html');

// ---------- root-level well-known files ----------
for (const file of ['robots.txt', 'site.webmanifest', 'favicon.ico']) {
    const src = resolve(DIST, 'static', file);
    if (existsSync(src)) {
        copyFileSync(src, resolve(DIST, file));
        console.log(file);
    }
}

console.log(`pages generated for ${migratedTools.length} tools x ${LOCALES.length} locales`);

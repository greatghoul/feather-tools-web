// Build-time generation of sitemap.xml and _redirects into the Astro output
// directory (via the astro:build:done hook). Both must byte-match the legacy
// generate-pages.tsx output so search engines and the legacy 301s keep
// working. 404.html ships as a static file in public/.
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { SITE } from '../data/site';
import { MIGRATED_TOOLS } from '../data/migrated-tools';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(scriptDir, '..');

const LOCALES = SITE.locales as readonly string[];
const TODAY = new Date().toISOString().slice(0, 10);

const STATIC_PAGES = ['about', 'privacy', 'terms'];

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

function buildSitemap(): string {
    const entries = [
        sitemapUrl('', 'weekly', '1.0'),
        ...STATIC_PAGES.map((page) => sitemapUrl(`${page}/`, 'monthly', '0.8')),
        ...MIGRATED_TOOLS.map((slug) => sitemapUrl(`${slug}/`, 'weekly', '0.9')),
    ];
    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
        ...entries,
        '</urlset>',
        '',
    ].join('\n');
}

function buildRedirects(): string {
    const lines = [
        '# Legacy URLs: default to English, ?lang=zh goes to the Chinese page.',
        '# Query rules must come before their plain counterparts.',
        '/ ?lang=zh /zh/ 301',
        '/ /en/ 301',
    ];
    for (const key of [...STATIC_PAGES, ...MIGRATED_TOOLS]) {
        lines.push(`/${key} ?lang=zh /zh/${key}/ 301`);
        lines.push(`/${key} /en/${key}/ 301`);
    }
    return lines.join('\n') + '\n';
}

export default function siteFiles(): AstroIntegration {
    return {
        name: 'site-files',
        hooks: {
            'astro:build:done': ({ dir }) => {
                const outDir = fileURLToPath(dir);
                writeFileSync(resolve(outDir, 'sitemap.xml'), buildSitemap());
                writeFileSync(resolve(outDir, '_redirects'), buildRedirects());
                console.log('[site-files] wrote sitemap.xml and _redirects');
            },
        },
    };
}

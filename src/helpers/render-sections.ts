import type { ReactElement } from 'react';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { initMessages } from './i18n';
import enFull from '../i18n/en.json';
import zhFull from '../i18n/zh.json';
import type { Locale } from '../data/site';

// Per-tool static sections (how-to-use / features cards) live in
// src/tools/<slug>/PageSections.tsx as React components that call t() from the
// shared client store. The legacy generator rendered them to static HTML with
// renderToStaticMarkup; we do the same, injecting the full catalog for the
// page's locale before rendering.
//
// initMessages + renderToStaticMarkup stay inside one synchronous block so a
// concurrently rendered page (different locale) cannot overwrite the shared
// message store between the two calls.
const catalogs: Record<Locale, Record<string, string>> = { en: enFull, zh: zhFull };

const sectionModules = import.meta.glob('../tools/*/PageSections.tsx');

export interface SectionsHtml {
    before: string;
    after: string;
}

export async function renderSections(slug: string, locale: Locale): Promise<SectionsHtml> {
    const loader = sectionModules[`../tools/${slug}/PageSections.tsx`];
    if (!loader) return { before: '', after: '' };

    const mod = (await loader()) as {
        SectionsBefore?: () => ReactElement;
        SectionsAfter?: () => ReactElement;
    };

    initMessages(catalogs[locale]);
    const before = mod.SectionsBefore
        ? renderToStaticMarkup(createElement(mod.SectionsBefore, { locale }))
        : '';
    const after = mod.SectionsAfter
        ? renderToStaticMarkup(createElement(mod.SectionsAfter, { locale }))
        : '';
    return { before, after };
}

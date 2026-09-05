// Server-side i18n for the Astro page shells. Unlike the legacy helpers/i18n.ts
// (which mutates a module-level message store), each call to createT() loads the
// locale's full catalog and returns a bound t() with no shared state — Astro
// renders every page in one process, so a shared store would leak between
// locales. Client islands keep using helpers/i18n.ts (each island is its own
// bundle, no cross-contamination).
import en from '../i18n/en.json';
import zh from '../i18n/zh.json';
import type { Locale } from '../data/site';

const CATALOGS: Record<Locale, Record<string, string>> = { en, zh };

export type Translate = (key: string) => string;

export function createT(locale: Locale): Translate {
    const messages = CATALOGS[locale];
    return (key: string) => messages[key] ?? key;
}

/** Mirrors the legacy buildKeywords(): page tags first, then site keywords. */
export function buildKeywords(t: Translate, tagKey?: string): string {
    const siteKeywords = t('site/keywords')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    const pageTags = tagKey
        ? t(tagKey)
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
        : [];
    return [...new Set([...pageTags, ...siteKeywords])].join(', ');
}

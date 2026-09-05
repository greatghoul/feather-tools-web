// Site-level constants shared by page generation and the link-meta function.
export const SITE = {
    name: 'Feather Tools',
    baseUrl: 'https://feather-tools.com',
    locales: ['en', 'zh'],
    defaultLocale: 'en',
} as const;

export type Locale = (typeof SITE.locales)[number];

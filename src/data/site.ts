// Site-level constants shared by page generation and the link-meta function.
export const SITE = {
    name: 'Feather Tools',
    baseUrl: 'https://feather-tools.com',
    locales: ['en', 'zh'],
    defaultLocale: 'en',
} as const;

// Source repository; linked from the navbar, footer and the home tagline.
export const REPO_URL = 'https://github.com/greatghoul/feather-tools-web';

export type Locale = (typeof SITE.locales)[number];

// Optional Google Analytics (GA4). Set GA_MEASUREMENT_ID as a build
// environment variable (e.g. in the Cloudflare Pages dashboard) to include
// the gtag snippet on generated pages; leave unset for zero tracking.
// Read at page-generation time (generate-pages runs under node/tsx).
export const GA_MEASUREMENT_ID: string | undefined =
    process.env.GA_MEASUREMENT_ID;

// Optional Disqus comments. Set DISQUS_SHORTNAME as a build environment
// variable to append the comment embed to generated pages; leave unset to
// disable comments entirely.
export const DISQUS_SHORTNAME: string | undefined =
    process.env.DISQUS_SHORTNAME;

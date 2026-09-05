import type { ReactNode } from 'react';
import { t } from '~/helpers/i18n';
import { SITE, GA_MEASUREMENT_ID, type Locale } from '~/data/site';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

// Google tag (gtag.js), included only when a measurement id is configured.
const GA_SCRIPT = GA_MEASUREMENT_ID
    ? [
          <script async key="ga-src" src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />,
          <script
              key="ga-init"
              dangerouslySetInnerHTML={{
                  __html: `window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', '${GA_MEASUREMENT_ID}');`,
              }}
          />,
      ]
    : null;

export interface LayoutProps {
    locale: Locale;
    /** Canonical path of this page, e.g. "/zh/image-compress/" (with trailing slash). */
    path: string;
    /** Page path per locale, used for hreflang alternates and the language switcher. */
    alternates: Record<Locale, string>;
    title: string;
    description: string;
    keywords: string;
    /** Extra tags rendered at the end of <body> (e.g. the tool bundle script). */
    scripts?: ReactNode;
    /** CSS files required by the tool's bundle graph (from the vite manifest). */
    cssLinks?: string[];
    children: ReactNode;
}

// Bump when public/static/styles.css changes.
const STYLES_VERSION = '20260807';

// Vanilla replacements for the two Bootstrap JS behaviors used by the layout:
// the navbar collapse toggle and the language dropdown. Bootstrap ships no JS.
const NAV_SCRIPT = `
(function () {
    var toggler = document.querySelector('.navbar-toggler');
    var collapse = document.getElementById('navbarNav');
    if (toggler && collapse) {
        toggler.addEventListener('click', function () {
            collapse.classList.toggle('show');
        });
    }
    document.querySelectorAll('.dropdown-toggle').forEach(function (toggle) {
        toggle.addEventListener('click', function (e) {
            e.preventDefault();
            var menu = toggle.nextElementSibling;
            if (menu) menu.classList.toggle('show');
        });
    });
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-menu.show').forEach(function (menu) {
                menu.classList.remove('show');
            });
        }
    });
})();
`;

const BACK_TO_TOP_SCRIPT = `
(function () {
    var btn = document.getElementById('backToTop');
    if (!btn) return;
    var onScroll = function () {
        btn.classList.toggle('d-none', window.scrollY <= 200);
    };
    btn.addEventListener('click', function () {
        if (window.location.hash) {
            history.replaceState(null, '', window.location.pathname + window.location.search);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', onScroll);
    onScroll();
})();
`;

export const Layout = ({
    locale,
    path,
    alternates,
    title,
    description,
    keywords,
    scripts,
    cssLinks,
    children,
}: LayoutProps) => {
    const url = SITE.baseUrl + path;
    return (
        <html lang={locale === 'zh' ? 'zh-CN' : 'en'}>
            <head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta name="keywords" content={keywords} />
                <meta name="author" content="Feather Tools" />

                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={url} />
                <meta property="og:site_name" content={t('site/title')} />

                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={description} />

                <link rel="canonical" href={url} />
                <meta name="robots" content="index, follow" />
                {SITE.locales.map((loc) => (
                    <link
                        key={loc}
                        rel="alternate"
                        hrefLang={loc === 'zh' ? 'zh-CN' : loc}
                        href={SITE.baseUrl + alternates[loc]}
                    />
                ))}
                <link
                    rel="alternate"
                    hrefLang="x-default"
                    href={SITE.baseUrl + alternates[SITE.defaultLocale as Locale]}
                />

                <link rel="apple-touch-icon" sizes="180x180" href="/static/apple-touch-icon.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/static/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/static/favicon-16x16.png" />
                <link rel="manifest" href="/site.webmanifest" />
                <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />

                <link
                    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css"
                    integrity="sha384-4Q6Gf2aSP4eDXB8Miphtr37CMZZQ5oXLH2yaXMJ2w8e2ZtHTl7GptT4jmndRuHDT"
                    crossOrigin="anonymous"
                    rel="stylesheet"
                />
                <link
                    rel="stylesheet"
                    href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css"
                />
                <link
                    rel="stylesheet"
                    href="https://cdn.jsdelivr.net/npm/simple-notify@1.0.6/dist/simple-notify.min.css"
                />
                <link rel="stylesheet" href={`/static/styles.css?v=${STYLES_VERSION}`} />
                {GA_SCRIPT}
                {(cssLinks ?? []).map((href) => (
                    <link key={href} rel="stylesheet" href={`/${href}`} />
                ))}
            </head>
            <body>
                <Navbar locale={locale} alternates={alternates} />
                <main className="container py-4">
                    <div className="row">
                        <div className="col-12">{children}</div>
                    </div>
                </main>
                <Footer locale={locale} alternates={alternates} />
                {scripts}
                <button
                    type="button"
                    id="backToTop"
                    className="btn btn-primary position-fixed bottom-0 end-0 m-3 rounded-circle shadow d-none"
                    aria-label="Back to top"
                >
                    <i className="bi bi-arrow-up" />
                </button>
                <script dangerouslySetInnerHTML={{ __html: NAV_SCRIPT }} />
                <script dangerouslySetInnerHTML={{ __html: BACK_TO_TOP_SCRIPT }} />
            </body>
        </html>
    );
};

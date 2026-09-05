import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import siteFiles from './src/integrations/site-files';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    site: 'https://feather-tools.com',
    // Transition phase: build into dist-astro so the legacy Vite pipeline's
    // dist/ is never clobbered. Pointed back at dist/ at cutover.
    outDir: 'dist-astro',
    build: {
        // Emit tool CSS as separate <link> stylesheets (like the legacy build)
        // instead of inlining every island's CSS into each page.
        inlineStylesheets: 'never',
    },
    i18n: {
        locales: ['en', 'zh'],
        defaultLocale: 'en',
        routing: { prefixDefaultLocale: true },
    },
    integrations: [react(), siteFiles()],
    vite: {
        resolve: {
            alias: {
                '~': resolve(rootDir, 'src'),
            },
        },
        build: {
            // Legacy pipeline minified CSS with esbuild, which tolerates the
            // loose nesting/declaration syntax some tool CSS uses. Astro's
            // default lightningcss minifier rejects those files.
            cssMinify: 'esbuild',
        },
    },
});

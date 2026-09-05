import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import siteFiles from './src/integrations/site-files';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    site: 'https://feather-tools.com',
    // Cutover: Astro owns dist/ (wrangler pages_build_output_dir = "dist").
    // During the migration this was dist-astro so the legacy Vite pipeline's
    // dist/ was never clobbered; the legacy pipeline is gone now.
    outDir: 'dist',
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

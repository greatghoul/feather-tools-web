import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import siteFiles from './src/integrations/site-files';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    site: 'https://feather-tools.com',
    // Astro owns dist/ (wrangler pages_build_output_dir = "dist").
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
        optimizeDeps: {
            // Pre-bundle every runtime dependency at dev server start. Without
            // this, Vite optimizes heavy/tool-specific deps (simple-notify,
            // @ffmpeg/ffmpeg, konva, ...) on first request, which can abort
            // with "504 Outdated Optimize Dep" and break the tool at runtime.
            include: [
                'react',
                'react-dom',
                'simple-notify',
                '@ffmpeg/ffmpeg',
                '@codemirror/commands',
                '@codemirror/state',
                '@codemirror/view',
                '@faker-js/faker',
                'axios',
                'figlet',
                'gifuct-js',
                'html2canvas',
                'jsqr',
                'jszip',
                'konva',
                'qrcode',
                'upng-js',
            ],
        },
        build: {
            // Legacy pipeline minified CSS with esbuild, which tolerates the
            // loose nesting/declaration syntax some tool CSS uses. Astro's
            // default lightningcss minifier rejects those files.
            cssMinify: 'esbuild',
        },
    },
});

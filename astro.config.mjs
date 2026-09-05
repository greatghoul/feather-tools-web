import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    site: 'https://feather-tools.com',
    // Transition phase: build into dist-astro so the legacy Vite pipeline's
    // dist/ is never clobbered. Pointed back at dist/ at cutover.
    outDir: 'dist-astro',
    i18n: {
        locales: ['en', 'zh'],
        defaultLocale: 'en',
        routing: { prefixDefaultLocale: true },
    },
    integrations: [react()],
    vite: {
        resolve: {
            alias: {
                '~': resolve(rootDir, 'src'),
            },
        },
    },
});

// Production build: a single Vite build over all tool entries with code
// splitting. Shared modules are extracted into cacheable chunks:
//   assets/vendor.<hash>.js             react + react-dom
//   assets/shared.<hash>.js             shared components/helpers + gober deps
//   assets/messages-en/zh.<hash>.js     common client translations per locale
//   assets/tools/<slug>/<locale>.<hash>.js  tool logic + its locale translations
// Tool-specific npm libs (jszip, upng-js, ...) land in chunks shared only by
// the tools importing them. Pages reference the entry chunk only; the browser
// resolves and caches the shared chunks across pages.
import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { cpSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanToolEntries } from '../vite.entries.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const PROJECT = resolve(scriptDir, '..');
const DIST = resolve(PROJECT, 'dist');

rmSync(DIST, { recursive: true, force: true });

const { entries } = scanToolEntries();
const count = Object.keys(entries).length;
if (count === 0) {
    console.warn('No tool entries found under src/tools/*/entries - nothing to bundle.');
}

await build({
    configFile: false,
    root: PROJECT,
    logLevel: 'error',
    plugins: [react()],
    resolve: { alias: { '~': resolve(PROJECT, 'src') } },
    publicDir: false,
    build: {
        outDir: DIST,
        emptyOutDir: true,
        minify: true,
        manifest: true,
        rollupOptions: {
            input: entries,
            output: {
                entryFileNames: 'assets/[name].[hash].js',
                chunkFileNames: 'assets/[name].[hash].js',
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
                            return 'vendor';
                        }
                        if (/[\\/]node_modules[\\/]simple-notify[\\/]/.test(id)) {
                            return 'shared';
                        }
                        return undefined;
                    }
                    if (/[\\/]src[\\/](components|helpers)[\\/]/.test(id)) {
                        return 'shared';
                    }
                    const locale = id.match(/[\\/]src[\\/]i18n[\\/]client[\\/](en|zh)\.json/);
                    if (locale) {
                        return `messages-${locale[1]}`;
                    }
                    // Per-tool chunks named after the tool; entry modules stay
                    // separate per locale (they carry that locale's translations).
                    const tool = id.match(/[\\/]src[\\/]tools[\\/]([^\\/]+)[\\/](.+)$/);
                    if (tool && !tool[2].startsWith('entries/')) {
                        return `tools/${tool[1]}`;
                    }
                    return undefined;
                },
            },
        },
    },
});

cpSync(resolve(PROJECT, 'public'), DIST, { recursive: true });
console.log(`done: ${count} tool entries built with shared chunks, public/ copied`);

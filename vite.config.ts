import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanToolEntries } from './vite.entries.mjs';

const rootDir = dirname(fileURLToPath(import.meta.url));
const { entries } = scanToolEntries();

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '~': resolve(rootDir, 'src'),
        },
    },
    build: {
        manifest: true,
        rollupOptions: {
            input: entries,
        },
    },
});

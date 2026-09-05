// Shared entry scanner used by vite.config.ts and scripts/generate-pages.ts.
// A tool is considered migrated when src/tools/<slug>/entries/{en,zh}.tsx exist.
import { readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
export const LOCALES = ['en', 'zh'];

export function scanToolEntries() {
    const toolsDir = resolve(ROOT, 'src/tools');
    const entries = {};
    const migratedTools = [];
    if (!existsSync(toolsDir)) {
        return { entries, migratedTools };
    }
    for (const slug of readdirSync(toolsDir).sort()) {
        const found = [];
        for (const locale of LOCALES) {
            const entryPath = resolve(toolsDir, slug, 'entries', `${locale}.tsx`);
            if (existsSync(entryPath)) {
                entries[`tools/${slug}/${locale}`] = entryPath;
                found.push(locale);
            }
        }
        if (found.length === LOCALES.length) {
            migratedTools.push(slug);
        }
    }
    return { entries, migratedTools };
}

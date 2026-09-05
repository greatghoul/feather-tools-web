// Tool slugs that have generated pages. The legacy pipeline derived this from
// the Vite bundle manifest; here we check directly for the per-tool entry
// files, so a tool registered in data/tools.ts without an entries/ directory
// is skipped (same behavior, no build step required).
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { TOOLS } from './tools';

// Astro bundles page modules for SSR and rewrites import.meta.url, so resolve
// against process.cwd() (astro dev/build always run from the project root).
const rootDir = process.cwd();

// The legacy generate-pages.tsx sorted migrated tool slugs alphabetically
// (from the manifest key order), which determines card order within each
// category on the home page — keep the same ordering.
export const MIGRATED_TOOLS: string[] = TOOLS.filter((tool) =>
    existsSync(resolve(rootDir, 'src/tools', tool.slug, 'entries/en.tsx'))
)
    .map((tool) => tool.slug)
    .sort();

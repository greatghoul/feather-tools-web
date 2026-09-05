# Feather Tools (Static)

Pure static rebuild of [Feather Tools](https://feather-tools.com) for Cloudflare Pages.
React + Vite + TypeScript, per-locale static paths (`/en/<tool>/`, `/zh/<tool>/`),
pre-rendered HTML shells and per-tool code-split bundles.

## Commands

```bash
npm install            # install dependencies
npm run typecheck      # tsc --noEmit
npm run build          # typecheck + bundles + static pages -> dist/
npx wrangler pages deploy dist   # deploy to Cloudflare Pages
```

Translations live in `src/i18n/` (full catalogs and client-common slices) and
`src/tools/<slug>/i18n/` (per-tool slices); edit the JSON files directly.

## Build pipeline

1. **`npm run build:bundles`** (`scripts/build-bundles.ts`) — a single Vite build over
   all tool entries (`src/tools/<slug>/entries/{en,zh}.tsx`) with code splitting.
   Shared modules land in cacheable chunks: `vendor` (react/react-dom),
   `shared` (common components/helpers, simple-notify),
   `messages-en`/`messages-zh` (common client translations), and per-tool chunks
   holding the tool logic + that locale's translations. Tool-specific npm libs
   (jszip, konva, ...) are only downloaded by the pages using them. The build
   writes `dist/.vite/manifest.json` and copies `public/`.
2. **`npm run build:pages`** (`scripts/generate-pages.tsx`) — pre-renders per-locale HTML
   shells (home, about/privacy/terms, tool pages) with full SEO markup (title, meta,
   hreflang, canonical) referencing each tool's entry chunk, plus `sitemap.xml`,
   `_redirects` (legacy URL redirects) and `404.html` into `dist/`.

No Bootstrap JS: the layout's collapse/dropdown behaviors are ~25 lines of vanilla
script generated in `Layout.tsx`; only Bootstrap CSS is used.

## Adding a tool

1. Create `src/tools/<slug>/` with an `App.tsx` plus components/services, and
   `i18n/en.json` / `i18n/zh.json` holding its translation keys.
2. Add `entries/en.tsx` and `entries/zh.tsx` (see `src/tools/text-sort/entries/`):
   they load the translations (client common + tool slice) and mount the App
   into `#app`.
3. Register the slug in `src/data/tools.ts`.
4. `npm run build` — bundles and pages are generated automatically.

## Layout

```
src/
  components/      shared components (ImageUploadZone, ImageList, ...)
  helpers/         i18n runtime, files, messages, mount
  data/            tools registry, site constants, static page definitions
  i18n/            en.json / zh.json (full) + client/ (common slices)
  pages/           pre-rendered shells (Layout, Navbar, Footer, HomePage, ...)
  tools/<slug>/    tools (App, components/, services/, i18n/, entries/)
scripts/           build scripts
functions/         Cloudflare Pages Functions (api/link-meta)
public/            static assets (icons, tool css, gif.js/sudoku.js libs, ...)
```

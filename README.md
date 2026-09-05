# Feather Tools (Static)

Pure static rebuild of [Feather Tools](https://feather-tools.com) for Cloudflare Pages.
Astro + React + TypeScript, per-locale routes (`/en/<tool>/`, `/zh/<tool>/`),
server-rendered HTML shells and per-tool code-split islands.

## Commands

```bash
npm install            # install dependencies
npm run typecheck      # tsc --noEmit
npm run dev            # astro dev (localhost:4321)
npm run build          # astro build -> dist/
npm run preview        # astro preview (serves dist/)
npx wrangler pages deploy dist   # deploy to Cloudflare Pages
```

Translations live in `src/i18n/` (full catalogs and client-common slices) and
`src/tools/<slug>/i18n/` (per-tool slices); edit the JSON files directly.

### Optional environment variables

| Variable | Purpose |
|---|---|
| `GA_MEASUREMENT_ID` | GA4 id (e.g. `G-XXXXXXX`); set as a build env var (Cloudflare Pages dashboard) to include the gtag snippet on generated pages. Unset = no analytics. |
| `DISQUS_SHORTNAME` | Disqus shortname; set to append the comment embed to generated pages. Unset = no comments. |

## Build pipeline

`npm run build` runs a single `astro build`:

1. **Pages** — `src/pages/[lang]/` holds the home and static pages; each tool has
   a generated `[lang]/<slug>.astro` that mounts its tool through the shared
   `ToolShell` layout (SEO head, security badge, h1, PageSections, suggestions,
   tool-extras tags).
2. **Per-tool islands** — `scripts/gen-tool-pages.mjs` generates each tool's
   `src/tools/<slug>/ToolIsland.tsx` (a `createToolIsland` wrapper that sets
   `window.LOCALE`, merges common + tool translations, and renders the App).
   Each tool page statically imports only its own island, so Astro bundles and
   links just that tool's CSS — the same per-tool chunk model as the old Vite
   pipeline. Tool-specific npm libs (jszip, konva, ...) are only downloaded by
   the pages using them.
3. **Site files** — the `site-files` Astro integration (`astro:build:done`)
   writes `sitemap.xml` and `_redirects` (legacy URL redirects) into `dist/`;
   `404.html` ships from `public/`.

No Bootstrap JS: the layout's collapse/dropdown behaviors are ~25 lines of vanilla
script in `src/layouts/Layout.astro`; only Bootstrap CSS is used.

## Adding a tool

1. Create `src/tools/<slug>/` with an `App.tsx` plus components/services, and
   `i18n/en.json` / `i18n/zh.json` holding its translation keys.
2. Register the slug in `src/data/tools.ts`.
3. Run `node scripts/gen-tool-pages.mjs` — it generates the tool's
   `ToolIsland.tsx` and `src/pages/[lang]/<slug>.astro`.
4. `npm run build` — pages are generated automatically.

## Layout

```
src/
  components/      shared components (ImageUploadZone, ImageList, ...)
                   + Astro shells (Navbar, Footer, ToolCard, ToolShell, ...)
  helpers/         i18n runtimes (client + server), files, messages
  integrations/    site-files (sitemap.xml, _redirects on build)
  data/            tools registry, site constants, static page definitions
  i18n/            en.json / zh.json (full) + client/ (common slices)
  layouts/         Layout.astro (HTML shell + SEO head)
  pages/           [lang]/index|about|privacy|terms|<slug>.astro
  tools/<slug>/    tools (App, components/, services/, i18n/, ToolIsland.tsx)
scripts/           gen-tool-pages, i18n conversion, HTML parity checks
functions/         Cloudflare Pages Functions (api/link-meta)
public/            static assets (icons, tool css, gif.js/sudoku.js libs, 404.html)
```

## Verification

`npm run compare` and `npm run compare:tools` diff the built pages against the
`.astro-baseline/` snapshot (the old build's output) for HTML parity.

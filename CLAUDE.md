# LAS UNISON website

Nuxt 4 site for the London Ambulance Service UNISON branch.

## Stack
- Nuxt 4 + `@nuxt/content` v3 (SQLite via `better-sqlite3`)
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- pnpm

## Plan: build first, connect Nuxt Studio later
The intention is to **build the site first**, then connect it to [Nuxt Studio](https://nuxt.studio) afterwards as a hosted visual CMS for non-technical editors. Studio connects to the Git repo — nothing needs to be pre-installed for it.

To keep Studio useful when we connect it, separate **content** from **structure** as we build:
- **Content** (news posts, page copy, branch updates — anything an editor would change) should live as `@nuxt/content` files in `content/`, backed by a schema in `content.config.ts`. This is what Studio edits.
- **Structure** (layout, components, styling) stays in `.vue` components.

When adding a feature, flag content-vs-structure decisions so editable copy ends up in Content collections rather than hardcoded in components.

Note: the homepage is currently a hardcoded Vue port of an external design (see memory `unison-design-source`); its editable copy can be migrated to Content collections before connecting Studio.

## Content migration & URLs (preserve old slugs)
The WordPress site (https://lasunison.com) has been migrated into this project. The one-time audit (`docs/migration/`) and migration scripts (`scripts/wp-audit`, `scripts/wp-migrate`, and the various `fetch-*`/`wire-*`/`enrich-*` helpers) have been **removed now the migration is complete** — the full WP export still lives at `../old` if anything ever needs re-deriving.

**We MUST respect the old page slugs for every migrated article and page.** The old permalink structure is `/%postname%` — posts lived at `https://lasunison.com/<slug>` (flat) and pages were hierarchical (`/<parent>/<slug>`). When adding or moving any post or page:
- Reuse its **original slug** so its existing URL keeps working.
- If the information architecture changes a path (e.g. posts moved under `/news/<slug>`), add a **redirect** from the old URL to the new one — the redirect map is `app/redirects.json` (bulk, post-level) + `app/redirects.manual.mjs` (curated page/IA changes), compiled to `public/.htaccess` by `scripts/build-htaccess.mjs` (runs on `pnpm generate`). Never silently drop or rename a URL.
- Preserve these slugs/redirects right through to launch so inbound links, bookmarks, and search rankings survive the move.

## Design context
Before any UI/design work, read **`PRODUCT.md`** (strategic: register, users, brand voice, anti-references, principles) and **`DESIGN.md`** (visual: the heritage purple/green palette, Archivo/Public Sans/IBM Plex Mono type, components). The impeccable skill reads both automatically.

- **Register:** brand (a campaigning union site — design *is* the product; "Join the union" is the primary conversion).
- **North Star:** "The Branch Banner" — proud heritage purple-and-green, banner-bold Archivo headlines, solidarity made visible.
- **Guardrails:** not corporate/SaaS-slick, not a dated gov template, not loud/agitprop. Earn the red (999 emergency register only); hi-vis yellow is battenburg-motif-only. WCAG 2.2 AA is the floor.
- Tokens live in `app/assets/css/main.css`; reference the semantic aliases (`--brand-primary`, `--text-muted`, …), not raw ramps.

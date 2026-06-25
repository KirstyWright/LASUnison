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
We are cloning the old WordPress site (https://lasunison.com) into this project — the full export is at `../old` and the content audit lives in `docs/migration/` (see memory `unison-old-site-audit`).

**We MUST respect the old page slugs for every migrated article and page.** The old permalink structure is `/%postname%` — posts live at `https://lasunison.com/<slug>` (flat) and pages are hierarchical (`/<parent>/<slug>`). When migrating any post or page:
- Reuse its **original slug** so its existing URL keeps working (the `Old URL` column in `docs/migration/pages.csv` / `posts.csv` is the source of truth).
- If the new information architecture changes a path (e.g. posts move under `/news/<slug>`), add a **redirect** from the old URL to the new one in `nuxt.config.ts` `routeRules` — never silently drop or rename a URL.
- Preserve these slugs/redirects right through to launch so inbound links, bookmarks, and search rankings survive the move.

## Design context
Before any UI/design work, read **`PRODUCT.md`** (strategic: register, users, brand voice, anti-references, principles) and **`DESIGN.md`** (visual: the heritage purple/green palette, Archivo/Public Sans/IBM Plex Mono type, components). The impeccable skill reads both automatically.

- **Register:** brand (a campaigning union site — design *is* the product; "Join the union" is the primary conversion).
- **North Star:** "The Branch Banner" — proud heritage purple-and-green, banner-bold Archivo headlines, solidarity made visible.
- **Guardrails:** not corporate/SaaS-slick, not a dated gov template, not loud/agitprop. Earn the red (999 emergency register only); hi-vis yellow is battenburg-motif-only. WCAG 2.2 AA is the floor.
- Tokens live in `app/assets/css/main.css`; reference the semantic aliases (`--brand-primary`, `--text-muted`, …), not raw ramps.

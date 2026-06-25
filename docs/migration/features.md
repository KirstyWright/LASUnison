# Feature feasibility — keep vs. can't

The old site is WordPress + ~40 plugins. The new site is a **static-first Nuxt 4 +
`@nuxt/content`** build (with optional Nuxt server routes for the few things that
truly need a backend). This is the per-feature call on what survives that move —
the "ideally everything, but work out what we can keep" question.

Verdict key: **Keep** (content moves as-is) · **Rebuild** (re-implement in Nuxt) ·
**Static** (was dynamic, becomes build-time/static) · **Defer** (possible later) ·
**Drop** (not migrated).

## Content (the bulk of the site)

| Feature | Old plugin / type | Count | Verdict | New approach |
|---|---|---:|---|---|
| News posts | core `post` | 298 pub | **Keep** | `content/news/*.md`, `news` collection |
| Pages | core `page` | 65 pub | **Keep** | `content/**.md`, `pages` collection |
| Categories | `category` | 28 | **Keep (consolidate)** | frontmatter `section` + `/news?section=` filters |
| Tags | `post_tag` | 84 | **Review** | many are station tags — consolidate, see `categories.csv` |
| Featured images / media | uploads | 558 | **Keep** | `public/images`, see `media.md` |
| SEO metadata | Yoast | ~100 | **Keep** | map title/description/og into frontmatter |

## Dynamic features

| Feature | Old plugin / type | Count | Verdict | New approach & effort |
|---|---|---:|---|---|
| Document library | Memphis Documents Library (`mdocs-posts`) | 190 | **Rebuild (static)** | PDFs in `public/documents/` + a `documents` collection driving a filterable index page. *Medium.* |
| Officers/Reps/Stewards directory | PTA Member Directory (`member`) | 137 | **Keep as data** | `team` collection (name, role, station, public email/phone). Privacy-review each entry (see `people.csv`). *Medium.* |
| Contact form | Contact Form 7 (`wpcf7_contact_form`) | 3 defs | **Rebuild** | Nuxt form → Nuxt server route → email (Resend/SMTP) or a form service. *Small.* |
| Form submissions (stored) | Jetpack/CF7 (`feedback`) | 28 | **Drop** | Personal messages — do not migrate (privacy). |
| Newsletter signup | MailChimp (`mc4wp-form`) | 1 | **Rebuild** | Embed/POST to current provider. *Small.* |
| Homepage sliders / galleries | ML Slider + 6 other slider plugins (`ml-slide`, `slick_slider`, `orange-slider`, `soliloquy`, `ocw_carousel`, `slide`, `twoj_slideshow_post`) | ~25 | **Rebuild** | One component using existing `ui/Photo`; pick best images. Drop the 7 redundant plugins. *Small.* |
| Q&A forum | AnsPress (`question`/`answer`) | 4Q/3A | **Static or Drop** | Only 7 items — fold the useful ones into a static FAQ page; drop the engine. *Small.* |
| FAQ | `faq` CPT + FAQ pages | 1 + pages | **Keep (static)** | FAQ pages already exist under `/questions` (see `pages.csv`). |
| Events / calendar | `calendar_*` taxonomies, 2 events | 2 | **Static (light)** | Small `events` collection or fold into news. *Small.* |
| Site search | AJAX Search Lite | — | **Replace** | `@nuxt/content` built-in search / `queryCollection`. *Small.* |
| Mega menu | Max Mega Menu (24 menus) | 24 | **Rebuild** | Simplify to one nav from `navigation.md`. *Medium.* |
| News ticker | Ditty News Ticker | 1 | **Drop / optional** | Optional banner component. |
| Twitter feed | Custom Twitter Feeds | — | **Drop** | X API no longer viable → static link-out. |
| RSS aggregation | Feedzy | — | **Defer** | Optional build-time fetch later. |
| Store locator (stations) | `store_locator`, `sl-uploads` | — | **Defer / Drop** | Could become a stations page; low priority. |
| Member accounts | WP users | ~10,000* | **Drop** | Mostly spam registrations; no member login in scope. Privacy: do not migrate. |
| Social login, comments, sharing | Jetpack/WSL/AddThis | — | **Drop** | Out of scope. |
| Security/backup/cache | Wordfence, VaultPress, UpdraftPlus, WP Super Cache, etc. | — | **Drop** | Not relevant to a static Nuxt host. |

\* The `users` table parsed to ~10,000 rows — almost certainly years of spam
sign-ups (the site had open registration). Worth confirming, but none of it
migrates.

## Summary

- **Moves cleanly:** posts, pages, categories, media, SEO — the core site.
- **Rebuild (worth it):** document library, people directory, contact + newsletter forms, one slider, simplified nav, search.
- **Becomes static:** Q&A → FAQ, events.
- **Drops:** stored form submissions, member accounts, Twitter, social login, comments, and the security/backup/cache/SEO-plumbing plugins.

Nothing essential is blocked by the move to Nuxt. The only items needing a small
backend are the **contact form** and **newsletter signup** (a single Nuxt server
route covers both).

# Templates needed for the migrated content

Derived from the audit: every old page/post falls into one of a small set of
render shapes. This is the list of templates to build so all migrated content has
a home. Each maps to a `@nuxt/content` collection and reuses the existing
`app/components/ui/*` kit.

The 65 pages split cleanly by word count: the near-empty ones (1–7 words) were
**dynamic listing containers** (the "Bulletins"/"Documents"/directory pages pulled
content in via widgets); the rest are **prose**, with a few **hub** and
**long-form** variants.

## A. Page / route templates (Vue components in `app/pages/`)

| # | Template | Route | Content source | Renders | Replaces (old pages) |
|---|----------|-------|----------------|---------|----------------------|
| 1 | **Home** | `/` | bespoke | Hero, news, help, campaign, join (exists) | front page |
| 2 | **News article** | `/news/[slug]` | `news` item | title, date, section badge, featured image, prose body, tags, back-to-news | the 298 posts |
| 3 | **News index** | `/news` | `news` list | paginated cards (old `posts_per_page`=8), section filter chips | "Posts" |
| 4 | **Section archive** | `/news/[section]` | `news` filtered | same cards, scoped to one section | the 13 *Bulletins* pages + category archives |
| 5 | **Content page (article)** | `/[...slug]` | `pages` (default) | prose from markdown, optional sidebar | About, Welfare, Legal Services, NHS Pension, Education, Membership/Join, Linc, Subscription Rates, etc. |
| 6 | **Hub / landing** | `/[...slug]` | `pages` (`template: hub`) | intro + auto-listed child pages/links as cards | Stewards Zone, Pay Rates, About Us, Bulletins, Book Grants |
| 7 | **Long-form / legal** | `/[...slug]` | `pages` (`template: legal`) | full-width long prose + anchored section nav | Privacy Policy, Cookie Policy, Branch Rules |
| 8 | **Documents library** | `/documents` | `documents` | filterable list (category + year), each row = PDF download | Documents, Document Database, Forms |
| 9 | **People directory** | `/your-branch` | `team` | person cards grouped by role / station | Branch Officers, Branch Representatives, Stewards Directory |
| 10 | **Contact** | `/contact` | bespoke + server route | form → email; office address | Contact Us, H&S Feedback Form |
| 11 | **FAQ** | `/faq` | `pages`/`faq` | accordion of Q&A | FAQ pages + the 7 AnsPress Q&As |
| 12 | **Search results** | `/search` | `@nuxt/content` search | query box + results | AJAX Search Lite |
| 13 | **Error / 404** | `error.vue` | — | friendly not-found + search/links | WP 404 |

**Optional / low priority**

| # | Template | Route | Source | Notes |
|---|----------|-------|--------|-------|
| 14 | **Events** | `/events` | `events` | only 2 events — could fold into News instead |
| 15 | **Links page** | `/links` | `pages` (hub variant) | external link list; or just a hub page |

Templates 5–7 and 14–15 are **one Vue route** (`[...slug].vue`, already present) that
switches presentation on a frontmatter `template` field — not separate routes.

## B. Content collections & schemas (`content.config.ts`)

| Collection | Feeds templates | Key frontmatter fields |
|------------|-----------------|------------------------|
| `news` | 2, 3, 4 | `title`, `slug`, `date`, `section`, `tags[]`, `excerpt`, `image`, `description` (SEO) |
| `pages` | 5, 6, 7, 11, 15 | `title`, `slug`, `template` (`article`\|`hub`\|`legal`), `parent`, `sidebar` (bool), `description` |
| `documents` | 8 | `title`, `slug`, `file` (`/documents/…pdf`), `category`, `date` |
| `team` | 9 | `name`, `role`, `station`, `email?`, `phone?`, `photo?`, `order` |
| `events` | 14 | `title`, `date`, `location`, `body` |

> Slugs come straight from `pages.csv` / `posts.csv` (`Old URL` column) — see the
> slug-preservation rule in `CLAUDE.md`. Where template 4 moves posts under
> `/news/<slug>`, add a redirect from the old flat `/<slug>`.

## C. Reusable sub-components (mostly already exist in `app/components/ui/`)

- **NewsCard** — uses `ui/Card` + `ui/Photo` + `ui/Badge` (date, section, excerpt). Already prototyped in `home/News.vue`.
- **PersonCard** — name, role, station, contact (template 9).
- **DocumentRow** — title, type/size, download button (template 8).
- **ChildCardGrid** — lists child pages on hub template 6.
- **FilterChips** — section/category/year filters (templates 3, 4, 8).
- **Pagination**, **Prose** (ContentRenderer wrapper), **SectionNav** (anchors for template 7).

## Summary — minimum set to cover all content

**7 distinct render templates** carry everything:
1. News article · 2. News/section listing · 3. Content page (article) ·
4. Hub/landing · 5. Long-form/legal · 6. Documents library · 7. People directory.

Plus the utility routes (Home exists; Contact, FAQ, Search, 404) and 5 content
collections. Events/Links are optional thin variants.

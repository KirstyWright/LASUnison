# LAS UNISON — site content audit & migration

This folder is the **audit** of the LAS UNISON WordPress site. The goal is to
**clone nearly the whole site** into this Nuxt 4 + `@nuxt/content` project — but
first decide, per item, what's worth keeping, what gets merged or rewritten, and
what's dropped.

> **Source (regenerated 2026-06-25):** the **live** site
> **https://lasunison.co.uk** — database `db821367137` (table prefix
> `l19465s5l3`), pulled to `../old/pull-2026-06-25/`. This **supersedes** the
> earlier audit, which was built from `db600515692` (the old `clickandbuilds/
> LASUNISON` install) and **stopped at March 2020**. The live DB is a strict
> superset spanning **2008 → 2026**. See memory `unison-live-site-pull`.

Work through the **CSVs** in a spreadsheet (Excel / Numbers / Google Sheets):
each row has a pre-filled **`Suggested`** disposition and empty **`Decision` /
`Notes`** columns for you to confirm. Once the CSVs are marked up, the migration
step (below) turns the "keep" rows into content files.

## The documents

| File | What it covers | You do |
|------|----------------|--------|
| **`pages.csv`** | All 83 pages (title, URL, hierarchy, word count, template) | Mark Decision + new route |
| **`posts.csv`** | All 490 news posts, 2008–2026 (date, categories, tags, word count) | Mark Decision + target collection |
| **`categories.csv`** | All 328 taxonomy terms (categories, tags, member stations/roles) | Mark Keep / Merge-into |
| **`documents.csv`** | 266 document files — PDF/Office in the media library (title, date, file URL) | Mark Keep / Drop |
| **`people.csv`** | 137 officers/reps/stewards (role, station, contact) | Privacy-review; mark still-active |
| **`navigation.md`** | All 25 menus reconstructed = the live IA | Reference for new nav |
| **`templates.md`** ⚠ | Render templates/collections needed | Reference — **authored from 2020 export, pending refresh** |
| **`features.md`** ⚠ | Every dynamic feature: keep / rebuild / drop | Reference — **authored from 2020 export, pending refresh** |
| **`media.md`** ⚠ | Uploaded-files migration plan | Reference — **authored from 2020 export, pending refresh** |

⚠ The three analysis notes (`templates.md`, `features.md`, `media.md`) were
written by hand against the 2020 export and have **not** been regenerated — their
counts and plugin lists are stale (the live plugin stack differs; see below).
The five **CSVs** and **`navigation.md`** are script-generated and current.

## What the live site actually contains (verified against `db821367137`)

Real counts from the parsed `posts` table:

| Type | Total | Published | Disposition |
|------|------:|----------:|-------------|
| `post` (news) | 490 | 482 | → `news` collection (audit per item) |
| `page` | 83 | 75 | → `pages`/site (audit per item) |
| `attachment` (media) | 870 | — | → `public/images`; **266 are PDF/Office docs** → `documents.csv` |
| `member` (officers/reps) | 137 | 137 | → `team` (privacy review) |
| `nav_menu_item` | 259 | — | informs new nav (`navigation.md`) |
| `ml-slide` (slider) | 115 | 115 | rebuild **one** slider, or drop |
| `question`/`answer` (AnsPress Q&A) | ~8 | — | → static FAQ or drop |
| misc plugin CPTs (WPForms, downloads, ticker, RSS feeds, galleries) | ~40 | — | mostly drop / rebuild (see `features.md`) |
| `revision` | 952 | — | **discard** |

- **Content dates:** 2008-04 → 2026-06 (the site is active — newest post 2026-06-12).
- **Permalinks:** `/%postname%` → post URLs are `https://lasunison.co.uk/<slug>`
  (flat). Pages are hierarchical (`/parent/child`). Captured in the CSV `Old URL`
  columns for redirects.
- **42 news categories**, top: UNISON News (252), Branch News (186), Pay (171),
  Agenda for Change (57), Branch Secretary (48), Pensions (32), Unsocial Hours (25).
- **Documents moved plugins:** the 2020 site used the `mdocs-posts` CPT; the live
  site dropped it, so documents are now **PDF/Office files in the media library**
  (`documents.csv` lists them with their `/wp-content/uploads/...` URLs).

## Decision vocabulary (for the `Decision` column)

- **Keep** — migrate largely as-is.
- **Merge** — fold into another page/section (note the target).
- **Rewrite** — keep the topic, but the copy needs refreshing before launch.
- **Archive** — migrate but de-emphasise (old news kept for history/SEO, not featured).
- **Drop** — do not migrate.

### How `Suggested` was pre-filled (heuristics — override freely)
- **Pages:** `publish` → Keep · `draft`/`private` → Review · trashed → Drop.
- **Posts:** non-published → Drop · under 15 words → Drop (stub) · 2019+ → Keep (recent) · evergreen category (pensions, welfare, education, benefits, membership, stewards, H&S) → Keep · 2017–2018 → Review · older → Archive.
- **Categories:** ≥10 posts → Keep · fewer → Review/merge · `uncategorized` → Drop.
- **Documents:** title looks like a form/application/template/grant/AGM/policy → Keep · 2019+ → Keep · else → Review by date.
- **People:** all → Review (confirm the person is still in that role).

## Proposed new-site information architecture

Old → new mapping the audit decisions should aim at. Final taxonomy is set when
`categories.csv` is filled in.

| New section | New content collection / route | Fed by |
|-------------|-------------------------------|--------|
| **News** | `content/news/*.md` → `/news`, `/news/[slug]` | `post` (kept rows) |
| **Pay & conditions** | `news` section + `pages` | Pay, Agenda for Change, Unsocial Hours |
| **Pensions** | `pages` + `news` section | Pensions cat + NHS Pension page |
| **Help & support** | `content/*.md` (`pages`) | Welfare, Legal, Education, Book Grants, Linc |
| **Documents** | `content/documents/*` + `public/documents` | document attachments |
| **Your branch (people)** | `content/team/*` (`team`) | `member` |
| **About / Contact / Legal** | `content/*.md` | About, Contact, Privacy, Cookies pages |

Categories consolidate from 42 → a handful of sections (e.g. *Branch news*,
*Pay & conditions*, *Pensions*, *Health & safety*, *Membership*). Record each
old→new mapping in `categories.csv`'s "New section / merge into" column.

## Migration workflow (after the CSVs are marked up)

1. Fill in `Decision` columns across the CSVs.
2. Add typed collections to `content.config.ts` (`news`, `pages`, `team`, `documents`, `events`).
3. Run the migration script (to be built): re-reads "keep" rows from the DB,
   converts `post_content` HTML → Markdown, writes `content/<collection>/<slug>.md`
   with frontmatter (title, date, section, tags, excerpt, SEO, featured image).
4. Copy media; rewrite `/wp-content/uploads/...` URLs.
5. Emit an old→new **redirect map** from the `Old URL` columns → `nuxt.config.ts` `routeRules` (preserve SEO).
6. Wire `app/components/home/News.vue` to `queryCollection('news')` (replaces the hardcoded `NEWS` array).
7. Rebuild dynamic features per `features.md` (contact form, document index, people directory, one slider, search).

## Regenerating this audit

Reproducible from a dump via `scripts/wp-audit/` (Python 3, no DB server needed —
it parses the MySQL/MariaDB dump into local SQLite). The scripts take the table
**prefix** and **site URL** as arguments, so they work for either dump.

```bash
# --- live lasunison.co.uk site (current) -------------------------------------
GZ=../old/pull-2026-06-25/databases/db821367137_lasunison.co.uk_LIVE.sql.gz
PFX=l19465s5l3
SUB=/tmp/audit-subset.sql      # sliced subset (see scripts/wp-audit/slice.sh)
DB=/tmp/audit.db

gzip -dc "$GZ" > /tmp/live.sql
bash   scripts/wp-audit/slice.sh         /tmp/live.sql "$SUB" "$PFX"
python3 scripts/wp-audit/parse_to_sqlite.py "$SUB" "$DB" "$PFX"
python3 scripts/wp-audit/generate_audit.py  "$DB" docs/migration https://lasunison.co.uk
python3 scripts/wp-audit/generate_nav.py    "$DB" docs/migration/navigation.md

# --- old 2020 lasunison.com dump (defaults: prefix gEYLYEmF, url lasunison.com)
#     bash scripts/wp-audit/slice.sh ../old/db600515692.sql "$SUB"
```

Notes for anyone re-running:
- `parse_to_sqlite.py` handles **both** dump dialects — phpMyAdmin (explicit
  column lists) and `mysqldump` (column-less INSERTs; columns recovered from the
  `CREATE TABLE`). `wp db export` produces the latter.
- `slice.sh` runs awk under `LC_ALL=C` so binary blobs (Wordfence IP logs) don't
  abort the slice.

The throwaway subset and SQLite DB are scratch — only the CSVs / `*.md` here are
committed.

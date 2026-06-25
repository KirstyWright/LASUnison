# wp-migrate — WordPress → @nuxt/content importer

Turns the live WordPress export into Markdown content files. It reads the SQLite DB built
by [`../wp-audit`](../wp-audit) and writes:

- `content/news/<slug>.md` — every **published post** (482), at its original WP slug.
- `content/<parent>/<slug>.md` — every **published page** (hierarchical path preserved).
- `public/images/<YYYY>/<MM>/…` — referenced images copied from the uploads pull.
- `app/redirects.json` — old flat post URL (`/<slug>`) → `/news/<slug>` (wired into
  `nuxt.config.ts` `routeRules` as 301s).

## Run

```bash
# 1. Build the audit DB (once) — see ../../docs/migration/README.md
gzip -dc ../old/pull-2026-06-25/databases/db821367137_lasunison.co.uk_LIVE.sql.gz > /tmp/live.sql
bash    scripts/wp-audit/slice.sh /tmp/live.sql /tmp/audit-subset.sql l19465s5l3
python3 scripts/wp-audit/parse_to_sqlite.py /tmp/audit-subset.sql /tmp/audit.db l19465s5l3

# 2. Preview, then migrate
pnpm migrate:dry      # report only, writes nothing
pnpm migrate          # writes content/, public/images, app/redirects.json
```

Flags: `--dry-run`, `--no-media`, `--posts-only`, `--pages-only`, `--db <path>`.

## Notes

- **Existing news files are backed up** to `.backup/<timestamp>/` then replaced — the
  WordPress versions win (the original 8 hand-written articles are preserved in the backup).
- The uploads pull is **incomplete** (2019 & 2021 folders + many sized variants are
  missing). Missing files are listed in `.backup/last-report.json`; the Markdown still
  references `/images/...` so they resolve once a fuller backup is dropped in.
- Empty/dynamic WP pages (bulletins lists, directories, calendar) are written as
  **title-only stubs** (`stub: true`) so their URLs resolve; the AnsPress Q&A subtree,
  the WP `/news` archive, and the old front page are skipped (see `config.mjs`).
- Re-runnable: output paths are deterministic; re-running overwrites generated files.

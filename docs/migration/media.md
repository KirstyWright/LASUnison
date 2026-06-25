# Media inventory & migration plan

Source: `../old/wp-content/uploads` — **2,556 files, 1.3 GB**.

## What's there

| Type | Count | Notes |
|------|------:|-------|
| Images (jpg/png/gif/jpeg/bmp) | ~2,192 | Mostly **WordPress-generated resize variants** of the 558 media-library attachments |
| PDFs | 248 | 186 in `mdocs/` (document library) + 62 in year folders |
| Translations (.po/.mo) | 40 | Plugin/theme i18n — **skip** |
| .php / .htaccess / logs | ~19 | **Never copy** (security / server cruft) |
| Office docs (dotx/xlsx) | 4 | Templates — keep with documents |

### By year (`uploads/YYYY/`)
| Year | Files | Size |  | Year | Files | Size |
|------|------:|-----:|--|------|------:|-----:|
| 2010 | 19 | 1.4M | | 2016 | 400 | 30M |
| 2011 | 96 | 21M  | | 2017 | 276 | 52M |
| 2012 | 59 | 4.4M | | 2018 | 478 | 129M |
| 2013 | 105 | 13M | | 2019 | 368 | 32M |
| 2014 | 43 | 9.7M | | 2020 | 53 | 19M |
| 2015 | 274 | 51M | | 2021–23 | 0 | — |

### Notable non-year folders
| Folder | Files | Size | What it is | Plan |
|--------|------:|-----:|------------|------|
| `mdocs/` | 230 | 286M | **Document library** PDFs/forms | → `public/documents/` |
| `profiles/` | 14 | 284K | Member/officer profile photos | → `public/images/people/` (if people kept) |
| `sl-uploads/` | 97 | 1.0M | Store-locator (stations) images | Review — likely drop |
| `wp-links-page/` | 12 | 228K | Links-page thumbnails | Drop |
| `bfi_thumb/`, `connections-images/` | 22 | <300K | Plugin thumbnail caches | Drop (regenerable) |

## Migration plan

1. **Copy, excluding cruft.** Copy `uploads/YYYY/**` (images) and `uploads/mdocs/**` (documents) into the new project. Exclude: `*.php`, `.htaccess`, `*.po`, `*.mo`, `*.log`, `bfi_thumb/`, plus the separate backup dirs that live outside `uploads/` (`ai1wm-backups`, `wpvivid…`, `updraft`, `cache`).
2. **Split by purpose:**
   - Images referenced in post/page bodies → `public/images/` (preserve the `YYYY/MM` sub-paths so URL rewrites are mechanical).
   - The 248 PDFs → `public/documents/` (flatten or keep `mdocs/` grouping).
3. **Thumbnails:** the ~2,192 image files are largely `-150x150`, `-300x200`, etc. resize variants. Two options — (a) copy everything as-is (simplest, ~1 GB), or (b) copy only originals and let `@nuxt/image` re-derive sizes (cleaner, smaller repo). Decide during migration; **(b) recommended** to avoid committing 1 GB of derivatives.
4. **URL rewrite:** in the migration step, rewrite `https://lasunison.com/wp-content/uploads/...` (and `/wp-content/uploads/...`) references inside migrated markdown to the new `/images/...` or `/documents/...` paths.
5. **Large repo caveat:** 1.3 GB is heavy for git. Consider Git LFS for PDFs, or host media on object storage / the eventual Nuxt host and reference by URL. Flag before committing media.

> Counts here are from `find`/`du` over the export and reconcile with the 558
> `attachment` rows + 190 `mdocs-posts` records in the database audit.

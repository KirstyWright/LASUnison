#!/usr/bin/env node
// WordPress → @nuxt/content migration orchestrator.
//
// Reads the SQLite DB built by scripts/wp-audit/, converts every published post and page
// to Markdown, copies referenced images, and emits app/redirects.json (old flat post URLs
// -> /news/<slug>). See docs/migration/README.md and scripts/wp-migrate/README.md.
//
// Usage:
//   node scripts/wp-migrate/migrate.mjs [--dry-run] [--no-media]
//        [--posts-only] [--pages-only] [--db <path>]
import {
  existsSync, mkdirSync, readdirSync, copyFileSync, writeFileSync, rmSync,
} from 'node:fs'
import { join, dirname } from 'node:path'
import {
  AUDIT_DB, NEWS_DIR, CONTENT_DIR, REDIRECTS_FILE, BACKUP_DIR, SKIP_PAGE_IDS,
} from './config.mjs'
import {
  openDb, getPublishedPosts, getPublishedPages, getTerms, getFeaturedImages, buildPagePaths,
} from './db.mjs'
import { htmlToMarkdown, plainText } from './html-to-md.mjs'
import { postFrontmatter, pageFrontmatter, toFile } from './frontmatter.mjs'
import { MediaCollector } from './media.mjs'

const args = process.argv.slice(2)
const has = (f) => args.includes(f)
const dbPath = (() => {
  const i = args.indexOf('--db')
  return i >= 0 ? args[i + 1] : AUDIT_DB
})()
const DRY = has('--dry-run')
const NO_MEDIA = has('--no-media')
const POSTS_ONLY = has('--posts-only')
const PAGES_ONLY = has('--pages-only')

if (!existsSync(dbPath)) {
  console.error(`\n✗ Audit DB not found at ${dbPath}\n`)
  console.error('Build it first (see docs/migration/README.md):')
  console.error('  gzip -dc ../old/pull-2026-06-25/databases/db821367137_lasunison.co.uk_LIVE.sql.gz > /tmp/live.sql')
  console.error('  bash    scripts/wp-audit/slice.sh /tmp/live.sql /tmp/audit-subset.sql l19465s5l3')
  console.error('  python3 scripts/wp-audit/parse_to_sqlite.py /tmp/audit-subset.sql /tmp/audit.db l19465s5l3\n')
  process.exit(1)
}

const write = (file, contents) => {
  if (DRY) return
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, contents)
}

console.log(`\nWP → content migration${DRY ? ' (DRY RUN — no files written)' : ''}`)
console.log(`DB: ${dbPath}\n`)

const db = openDb(dbPath)
const media = new MediaCollector()
const summary = { postsWritten: 0, pagesWritten: 0, pageStubs: 0, pagesSkipped: [], dupSlugs: [], collisions: [] }

// Resolve page rows + their hierarchical paths once; reused for writing and for the
// redirect-collision check below.
const allPages = getPublishedPages(db)
const allPagePaths = buildPagePaths(db)

// ---- back up + clear the existing hand-written news files -------------------
// User decision: WordPress versions win. Back up the current content/news/*.md, then
// remove them so the WP import lands at the original WP slugs with no duplicates.
if (!PAGES_ONLY) {
  const existing = existsSync(NEWS_DIR)
    ? readdirSync(NEWS_DIR).filter((f) => f.endsWith('.md'))
    : []
  if (existing.length) {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-')
    const dest = join(BACKUP_DIR, stamp, 'news')
    console.log(`Backing up ${existing.length} existing news file(s) → ${dest}`)
    for (const f of existing) {
      if (!DRY) {
        mkdirSync(dest, { recursive: true })
        copyFileSync(join(NEWS_DIR, f), join(dest, f))
        rmSync(join(NEWS_DIR, f))
      }
    }
  }
}

// ---- posts ------------------------------------------------------------------
const redirects = {}
if (!PAGES_ONLY) {
  const posts = getPublishedPosts(db)
  const terms = getTerms(db)
  const featured = getFeaturedImages(db)
  const seenSlugs = new Set()
  for (const post of posts) {
    let slug = post.slug || ''
    if (!slug) {
      console.warn(`  ! post ${post.id} has no slug — skipped`)
      continue
    }
    if (seenSlugs.has(slug)) {
      summary.dupSlugs.push(slug)
      console.warn(`  ! duplicate slug "${slug}" (post ${post.id}) — appending id`)
      slug = `${slug}-${post.id}`
    }
    seenSlugs.add(slug)

    const featuredRel = featured.get(post.id)
    const featuredUrl = featuredRel ? media.featured(featuredRel, `post ${post.id}`) : null
    const fm = postFrontmatter(post, terms.get(post.id), featuredUrl)
    const body = htmlToMarkdown(post.content, media)
    write(join(NEWS_DIR, `${slug}.md`), toFile(fm, body))
    redirects[`/${slug}`] = `/news/${slug}`
    summary.postsWritten++
  }
  console.log(`Posts: ${summary.postsWritten} written`)
}

// ---- pages ------------------------------------------------------------------
if (!POSTS_ONLY) {
  const writtenPaths = new Set()
  for (const page of allPages) {
    if (SKIP_PAGE_IDS.has(page.id)) {
      summary.pagesSkipped.push(`${page.slug || page.id} (skip list)`)
      continue
    }
    const rel = allPagePaths.get(page.id)
    if (!rel) {
      summary.pagesSkipped.push(`${page.id} (no slug path)`)
      continue
    }
    if (writtenPaths.has(rel)) {
      summary.collisions.push(rel)
      console.warn(`  ! page path collision "${rel}" (page ${page.id}) — skipped`)
      continue
    }
    writtenPaths.add(rel)

    const legacyUrl = `https://lasunison.co.uk/${rel}`
    const isEmpty = plainText(page.content).split(' ').filter(Boolean).length < 3
    const fm = pageFrontmatter(page, legacyUrl, { stub: isEmpty })
    const body = isEmpty ? `# ${fm.title}` : htmlToMarkdown(page.content, media)
    write(join(CONTENT_DIR, `${rel}.md`), toFile(fm, body))
    summary.pagesWritten++
    if (isEmpty) summary.pageStubs++
  }
  console.log(`Pages: ${summary.pagesWritten} written (${summary.pageStubs} empty stubs)`)
}

// ---- redirects --------------------------------------------------------------
// Assert no flat post redirect would shadow a real page or reserved route.
const pagePaths = new Set(
  allPages
    .filter((p) => !SKIP_PAGE_IDS.has(p.id))
    .map((p) => allPagePaths.get(p.id))
    .filter(Boolean),
)
const reserved = new Set(['news', '']) // / and /news are Vue routes
const redirectCollisions = Object.keys(redirects).filter((from) => {
  const slug = from.slice(1)
  return reserved.has(slug) || pagePaths.has(slug)
})
for (const from of redirectCollisions) {
  console.warn(`  ! redirect ${from} collides with a page/route — dropping`)
  delete redirects[from]
}
if (!PAGES_ONLY) {
  write(REDIRECTS_FILE, JSON.stringify(redirects, null, 2) + '\n')
  console.log(`Redirects: ${Object.keys(redirects).length} → ${DRY ? '(dry run)' : 'app/redirects.json'}`)
}

// ---- media ------------------------------------------------------------------
if (!NO_MEDIA) {
  media.copyAll({ dryRun: DRY })
}
const m = media.report()

// ---- report -----------------------------------------------------------------
console.log('\n── Summary ────────────────────────────────')
console.log(`posts written          ${summary.postsWritten}`)
console.log(`pages written          ${summary.pagesWritten}  (stubs: ${summary.pageStubs})`)
console.log(`pages skipped          ${summary.pagesSkipped.length}`)
console.log(`duplicate slugs        ${summary.dupSlugs.length}`)
console.log(`path collisions        ${summary.collisions.length}`)
console.log(`images referenced      ${m.referenced}`)
console.log(`images copied          ${m.copied}`)
console.log(`images already present  ${m.alreadyPresent}`)
console.log(`images MISSING on disk  ${m.missing.length}`)
console.log(`external image links    ${m.external}`)
console.log(`document links (live)   ${m.docLinks}`)

const reportFile = join(BACKUP_DIR, 'last-report.json')
const fullReport = { summary, media: { ...m, missing: m.missing } }
if (!DRY) {
  mkdirSync(BACKUP_DIR, { recursive: true })
  writeFileSync(reportFile, JSON.stringify(fullReport, null, 2))
  console.log(`\nFull report (incl. missing-image list): ${reportFile}`)
}
if (summary.pagesSkipped.length) {
  console.log('\nPages skipped:')
  for (const p of summary.pagesSkipped) console.log(`  - ${p}`)
}
console.log('')
db.close()

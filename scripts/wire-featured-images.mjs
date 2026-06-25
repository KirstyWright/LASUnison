#!/usr/bin/env node
// Wire WordPress featured images into migrated news articles.
//
// At migration time, a post's featured image was only written to `image:` frontmatter if
// the file already existed in the local uploads pull. ~200 featured images were missing on
// disk then, so they were omitted — and the later fetch-media pass only re-fetches images
// *referenced* in content, so these never came back. This script closes that gap: for every
// published post that has a WP featured image, it downloads the file from the live host (if
// not already on disk) and inserts `image:` into the article's frontmatter. It does NOT
// touch article bodies (preserving the doc-link rewrites).
//
// Usage: node scripts/wire-featured-images.mjs [--dry-run]
import Database from 'better-sqlite3'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const DRY = process.argv.includes('--dry-run')
const DB = '/tmp/audit.db'
const NEWS = 'content/news'
const IMG = 'public/images'
const HOST = 'https://lasunison.com/wp-content/uploads/' // live uploads are served from .com
const CONCURRENCY = 8

// Encode a path for the URL, including ( ) which a bare markdown/URL would mishandle.
const enc = (rel) => rel.split('/').map((s) => encodeURIComponent(s)).join('/')

const db = new Database(DB, { readonly: true })
const posts = db
  .prepare('SELECT ID id, post_name slug FROM posts WHERE post_type=? AND post_status=?')
  .all('post', 'publish')
const feat = new Map()
for (const r of db
  .prepare(
    'SELECT DISTINCT tm.post_id pid, af.meta_value rel FROM postmeta tm ' +
      'JOIN postmeta af ON af.post_id=tm.meta_value AND af.meta_key=? WHERE tm.meta_key=?',
  )
  .all('_wp_attached_file', '_thumbnail_id'))
  if (r.rel) feat.set(r.pid, r.rel)

// Build the work list: posts whose article exists and lacks an image: line.
const jobs = []
for (const p of posts) {
  const rel = feat.get(p.id)
  if (!rel) continue
  const md = join(NEWS, p.slug + '.md')
  if (!existsSync(md)) continue
  const text = readFileSync(md, 'utf8')
  if (/^image:\s*\S/m.test(text)) continue // already wired
  jobs.push({ md, rel, text })
}

let fetched = 0, wired = 0
const failed = []

async function ensureFile(rel) {
  const dest = join(IMG, rel)
  if (existsSync(dest)) return true
  const res = await fetch(HOST + enc(rel))
  if (!res.ok) { failed.push(`${res.status} ${rel}`); return false }
  if (!DRY) {
    mkdirSync(dirname(dest), { recursive: true })
    writeFileSync(dest, Buffer.from(await res.arrayBuffer()))
  }
  fetched++
  return true
}

function wire(md, rel, text) {
  const line = `image: /images/${rel}\n`
  // insert before wpId: (present in every migrated article), else before closing ---
  const next = /^wpId:/m.test(text)
    ? text.replace(/^wpId:/m, line + 'wpId:')
    : text.replace(/\n---\s*\n/, `\n${line}---\n`)
  if (!DRY) writeFileSync(md, next)
  wired++
}

// Simple concurrency pool.
let i = 0
async function worker() {
  while (i < jobs.length) {
    const job = jobs[i++]
    const ok = await ensureFile(job.rel)
    if (ok) wire(job.md, job.rel, job.text)
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker))

console.log(`${DRY ? '[dry-run] ' : ''}candidates: ${jobs.length}`)
console.log(`  images fetched: ${fetched}`)
console.log(`  articles wired: ${wired}`)
console.log(`  failed downloads: ${failed.length}`)
failed.slice(0, 20).forEach((f) => console.log('    - ' + f))

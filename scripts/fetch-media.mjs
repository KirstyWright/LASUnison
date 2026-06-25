#!/usr/bin/env node
/**
 * fetch-media.mjs — make every WordPress upload the site references available
 * locally. Images land in public/images/<rel>, documents in public/docs/<rel>.
 *
 * Sources, in priority order:
 *   1. the two local uploads pulls (live 2026 pull, then the ≤2023 .com export)
 *   2. the live web server https://lasunison.com (the .co.uk host now 404s;
 *      .com still serves the full /wp-content/uploads/ tree, including the
 *      generated thumbnail sizes the disk pulls omit)
 *
 * Idempotent: skips anything already on disk. Modifies no content files — it
 * only fills public/images and public/docs. Run rewrite-doclinks.mjs and
 * build-documents.mjs afterwards to point the markdown/links at the local copies.
 */
import { readdirSync, readFileSync, existsSync, mkdirSync, copyFileSync, writeFileSync, statSync } from 'node:fs'
import { dirname, join, resolve, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ROOTS = [
  resolve(ROOT, '../old/pull-2026-06-25/site/app82853866/wp-content/uploads'),
  resolve(ROOT, '../old/wp-content/uploads'),
]
const PUB_IMG = resolve(ROOT, 'public/images')
const PUB_DOCS = resolve(ROOT, 'public/docs')
const LIVE = 'https://lasunison.com/wp-content/uploads/'
const IMG_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif', '.bmp', '.ico'])
const LOCAL_HOSTS = new Set([
  'lasunison.co.uk', 'www.lasunison.co.uk', 'lasunison.com', 'www.lasunison.com',
  'las-unison.co.uk', 'www.las-unison.co.uk',
])

function walk(d, out = []) {
  if (!existsSync(d)) return out
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name)
    if (e.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

// Every uploads-relative path the site references, tagged image|doc.
const need = new Map() // rel -> 'img' | 'doc'
function add(rel, kind) {
  rel = rel.replace(/^\/+/, '')
  if (!rel || rel.includes('..')) return
  if (!need.has(rel)) need.set(rel, kind)
}

const md = walk(join(ROOT, 'content')).filter((f) => f.endsWith('.md'))

// 1. /images/<rel> references → images
const reImg = /\/images\/([^\s)"'\]>]+)/g
// 2. uploads links in content bodies (bare, or <…> wrapping paths with spaces)
const reAngle = /<(https?:\/\/[^>]+)>/g
const reBare = /https?:\/\/[^\s)"'<>\]]+/g
for (const f of md) {
  const t = readFileSync(f, 'utf8')
  let m
  while ((m = reImg.exec(t))) add(decodeURIComponent(m[1].split('#')[0].split('?')[0]), 'img')
  const urls = []
  while ((m = reAngle.exec(t))) urls.push(m[1])
  while ((m = reBare.exec(t))) urls.push(m[0])
  for (const u of urls) {
    let host, path
    try { const x = new URL(u); host = x.host.toLowerCase(); path = x.pathname } catch { continue }
    if (!LOCAL_HOSTS.has(host)) continue
    const um = /\/wp-content\/uploads\/(.+)$/i.exec(path)
    if (!um) continue
    const rel = decodeURIComponent(um[1])
    add(rel, IMG_EXT.has(extname(rel).toLowerCase()) ? 'img' : 'doc')
  }
}

// 3. documents.csv — every library file (so documents.ts can host them all locally)
const csv = readFileSync(resolve(ROOT, 'docs/migration/documents.csv'), 'utf8')
for (const m of csv.matchAll(/\/wp-content\/uploads\/([^",\s]+)/gi)) {
  const rel = decodeURIComponent(m[1])
  add(rel, IMG_EXT.has(extname(rel).toLowerCase()) ? 'img' : 'doc')
}

console.log(`Referenced uploads: ${need.size} (images + docs)`)

function localSource(rel) {
  for (const r of ROOTS) { const p = join(r, rel); if (existsSync(p)) return p }
  return null
}

const stats = { present: 0, copied: 0, downloaded: 0, failed: [] }
const queue = [...need.entries()]
let active = 0, i = 0

async function fetchTo(rel, dest) {
  const url = LIVE + rel.split('/').map(encodeURIComponent).join('/')
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  // Guard against soft-404 HTML error pages served as 200.
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('text/html') && !IMG_EXT.has(extname(rel).toLowerCase())) throw new Error('got HTML (soft 404)')
  mkdirSync(dirname(dest), { recursive: true })
  writeFileSync(dest, buf)
}

async function one(rel, kind) {
  const dest = join(kind === 'img' ? PUB_IMG : PUB_DOCS, rel)
  if (existsSync(dest) && statSync(dest).size > 0) { stats.present++; return }
  const src = localSource(rel)
  if (src) {
    mkdirSync(dirname(dest), { recursive: true })
    copyFileSync(src, dest)
    stats.copied++
    return
  }
  try { await fetchTo(rel, dest); stats.downloaded++ }
  catch (e) { stats.failed.push(`${rel}  (${e.message})`) }
}

await new Promise((done) => {
  const CONC = 8
  function pump() {
    while (active < CONC && i < queue.length) {
      const [rel, kind] = queue[i++]
      active++
      one(rel, kind).finally(() => { active--; (i % 25 === 0) && process.stdout.write(`  …${i}/${queue.length}\n`); i >= queue.length && active === 0 ? done() : pump() })
    }
  }
  pump()
})

console.log(`\nAlready present: ${stats.present}`)
console.log(`Copied from local pulls: ${stats.copied}`)
console.log(`Downloaded from lasunison.com: ${stats.downloaded}`)
console.log(`Failed (${stats.failed.length}):`)
for (const f of stats.failed) console.log('  ✗', f)
writeFileSync('/private/tmp/claude-501/-Users-kirsty-Documents-Dev-Sites-Unison-New/bf2434f0-3fc5-46f7-ab3c-ec5adbb4ecd5/scratchpad/media-failed.txt', stats.failed.join('\n'))

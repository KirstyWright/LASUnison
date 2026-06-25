#!/usr/bin/env node
/**
 * heal-media.mjs — guarantee every local media link in content resolves.
 *
 * Scans content/**.md for /docs/<rel> and /images/<rel> links and makes sure
 * each target exists under public/docs or public/images. For any that don't:
 *   1. copy from a local WordPress export (exact path, then basename search)
 *   2. else download from lasunison.com
 * Anything still unrecoverable is listed for manual handling. Idempotent.
 *
 * Run:  node scripts/heal-media.mjs
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, statSync } from 'node:fs'
import { dirname, join, resolve, extname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ROOTS = [
  resolve(ROOT, '../old/pull-2026-06-25/site/app82853866/wp-content/uploads'),
  resolve(ROOT, '../old/wp-content/uploads'),
]
const PUB = { '/images/': resolve(ROOT, 'public/images'), '/docs/': resolve(ROOT, 'public/docs') }
const LIVE = 'https://lasunison.com/wp-content/uploads/'
const enc = (rel) => rel.split('/').map((s) => encodeURIComponent(s).replace(/\(/g, '%28').replace(/\)/g, '%29')).join('/')

function walk(d, o = []) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name)
    if (e.isDirectory()) walk(p, o)
    else if (p.endsWith('.md')) o.push(p)
  }
  return o
}
// Build a basename → absolute-path index of both exports, for fuzzy recovery.
const byName = new Map()
function index(d) {
  if (!existsSync(d)) return
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name)
    if (e.isDirectory()) index(p)
    else if (!byName.has(e.name)) byName.set(e.name, p)
  }
}
ROOTS.forEach(index)

// Collect distinct (prefix, rel) media links from content.
const links = new Map() // `${prefix}${rel}` -> {prefix, rel}
for (const f of walk(resolve(ROOT, 'content'))) {
  const t = readFileSync(f, 'utf8')
  for (const m of t.matchAll(/(\/(?:images|docs)\/)([^\s)"'>\]]+)/g)) {
    const prefix = m[1]
    const rel = decodeURIComponent(m[2].split('#')[0].split('?')[0])
    if (rel) links.set(prefix + rel, { prefix, rel })
  }
}

const present = []
const missing = [...links.values()].filter(({ prefix, rel }) => {
  const dest = join(PUB[prefix], rel)
  return !(existsSync(dest) && statSync(dest).size > 0)
})
console.log(`Distinct local media links: ${links.size} · already on disk: ${links.size - missing.length} · to heal: ${missing.length}\n`)

const copied = [], downloaded = [], unrecoverable = []
async function heal({ prefix, rel }) {
  const dest = join(PUB[prefix], rel)
  // 1. exact path in a local export
  for (const r of ROOTS) {
    const p = join(r, rel)
    if (existsSync(p)) { mkdirSync(dirname(dest), { recursive: true }); copyFileSync(p, dest); copied.push(rel); return }
  }
  // 2. basename match anywhere in the exports
  const hit = byName.get(basename(rel))
  if (hit) { mkdirSync(dirname(dest), { recursive: true }); copyFileSync(hit, dest); copied.push(`${rel}  (from ${hit.replace(ROOT + '/', '')})`); return }
  // 3. live download
  try {
    const res = await fetch(LIVE + enc(rel), { redirect: 'follow' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    if ((res.headers.get('content-type') || '').includes('text/html')) throw new Error('HTML (soft 404)')
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 100) throw new Error(`tiny (${buf.length}B)`)
    mkdirSync(dirname(dest), { recursive: true }); writeFileSync(dest, buf); downloaded.push(rel); return
  } catch (e) { unrecoverable.push(`${prefix}${rel}  (${e.message})`) }
}

for (const m of missing) await heal(m) // sequential: small set, keeps output readable

console.log(`Copied from exports: ${copied.length}`)
copied.forEach((x) => console.log('  ⊕', x))
console.log(`Downloaded from .com: ${downloaded.length}`)
downloaded.forEach((x) => console.log('  ↓', x))
console.log(`Unrecoverable: ${unrecoverable.length}`)
unrecoverable.forEach((x) => console.log('  ✗', x))

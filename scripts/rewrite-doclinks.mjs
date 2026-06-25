#!/usr/bin/env node
/**
 * rewrite-doclinks.mjs — point inline document links in the migrated markdown at
 * the local copies. Bodies still link to https://lasunison.co.uk/wp-content/
 * uploads/… (now dead); the files are hosted under public/docs (and images under
 * public/images). For every link whose host is one of ours:
 *   • image upload  → /images/<rel>
 *   • document      → /docs/<rel>   (file ensured local first; from a pull or .com)
 * If a file genuinely can't be hosted, the link's host is swapped to the working
 * lasunison.com so it at least resolves. Third-party links (medconfidential.org,
 * cognitoforms.com, …) are left untouched.
 *
 * Run:  node scripts/rewrite-doclinks.mjs
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, statSync } from 'node:fs'
import { dirname, join, resolve, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CONTENT = resolve(ROOT, 'content')
const PUB_IMG = resolve(ROOT, 'public/images')
const PUB_DOCS = resolve(ROOT, 'public/docs')
const ROOTS = [
  resolve(ROOT, '../old/pull-2026-06-25/site/app82853866/wp-content/uploads'),
  resolve(ROOT, '../old/wp-content/uploads'),
]
const LIVE = 'https://lasunison.com/wp-content/uploads/'
const IMG_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif', '.bmp', '.ico'])
const LOCAL_HOSTS = new Set([
  'lasunison.co.uk', 'www.lasunison.co.uk', 'lasunison.com', 'www.lasunison.com',
  'las-unison.co.uk', 'www.las-unison.co.uk',
])

function walk(d, out = []) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (p.endsWith('.md')) out.push(p)
  }
  return out
}
// Encode each segment, including ( ) which encodeURIComponent leaves literal —
// a bare ) closes a markdown [text](url) destination early and breaks the link.
const enc = (rel) =>
  rel.split('/').map((s) => encodeURIComponent(s).replace(/\(/g, '%28').replace(/\)/g, '%29')).join('/')
function localSource(rel) { for (const r of ROOTS) { const p = join(r, rel); if (existsSync(p)) return p } return null }

async function ensureHosted(rel, isImg) {
  const dest = join(isImg ? PUB_IMG : PUB_DOCS, rel)
  if (existsSync(dest) && statSync(dest).size > 0) return true
  const src = localSource(rel)
  if (src) { mkdirSync(dirname(dest), { recursive: true }); copyFileSync(src, dest); return true }
  try {
    const res = await fetch(LIVE + enc(rel), { redirect: 'follow' })
    if (!res.ok) return false
    if ((res.headers.get('content-type') || '').includes('text/html') && !isImg) return false
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 100) return false
    mkdirSync(dirname(dest), { recursive: true }); writeFileSync(dest, buf); return true
  } catch { return false }
}

const files = walk(CONTENT)
let changedFiles = 0, rewritten = 0, hostSwapped = 0, fetchedNow = 0
const stillExternal = []

for (const f of files) {
  let text = readFileSync(f, 'utf8')
  const orig = text
  // Collect URL tokens: angle-bracketed <…> (allows spaces) and bare.
  const tokens = []
  for (const m of text.matchAll(/<(https?:\/\/[^>]+)>/g)) tokens.push({ whole: m[0], url: m[1] })
  for (const m of text.matchAll(/https?:\/\/[^\s)"'<>\]]+/g)) tokens.push({ whole: m[0], url: m[0] })

  for (const { whole, url } of tokens) {
    let host, path
    try { const u = new URL(url); host = u.host.toLowerCase(); path = u.pathname } catch { continue }
    if (!LOCAL_HOSTS.has(host)) continue
    const um = /\/wp-content\/uploads\/(.+)$/i.exec(path)
    if (!um) continue
    const rel = decodeURIComponent(um[1].replace(/\+/g, '%20'))
    const isImg = IMG_EXT.has(extname(rel).toLowerCase())
    const hosted = await ensureHosted(rel, isImg)
    let replacement
    if (hosted) {
      replacement = (isImg ? '/images/' : '/docs/') + enc(rel)
      if (!localSource(rel) && existsSync(join(isImg ? PUB_IMG : PUB_DOCS, rel))) fetchedNow++
    } else {
      replacement = LIVE + enc(rel) // at least resolves on the working host
      hostSwapped++
      stillExternal.push(rel)
    }
    if (text.includes(whole)) { text = text.split(whole).join(replacement); rewritten++ }
  }
  if (text !== orig) { writeFileSync(f, text); changedFiles++ }
}

console.log(`Rewrote ${rewritten} link(s) across ${changedFiles} file(s).`)
console.log(`Fetched-on-demand this run: ${fetchedNow} · host-swapped (still external): ${hostSwapped}`)
if (stillExternal.length) { console.log('Could not host:'); for (const r of [...new Set(stillExternal)]) console.log('  ·', r) }

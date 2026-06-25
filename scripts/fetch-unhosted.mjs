#!/usr/bin/env node
/**
 * fetch-unhosted.mjs — pull every document-library file that isn't yet hosted
 * locally straight from the live site, so build-documents.mjs can mark them
 * self-hosted instead of dropping them.
 *
 * Works from docs/migration/documents.csv (the audit, source of truth) rather
 * than documents.ts, because build-documents.mjs drops un-hosted rows from the
 * generated module — they're invisible there. Fetches from lasunison.com (the
 * .co.uk host now 404s/403s; .com still serves the full uploads tree, including
 * mdocs paths with spaces/parens once URL-encoded), validates real file magic
 * bytes, and writes public/docs/<rel>.
 *
 * Run:  node scripts/fetch-unhosted.mjs   (then re-run build-documents.mjs)
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs'
import { dirname, join, resolve, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC_DOCS = resolve(ROOT, 'public/docs')
const ROOTS = [
  resolve(ROOT, '../old/pull-2026-06-25/site/app82853866/wp-content/uploads'),
  resolve(ROOT, '../old/wp-content/uploads'),
]
const LIVE = 'https://lasunison.com/wp-content/uploads/'

function parseCsv(text) {
  const rows = []; let row = [], field = '', q = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (q) { if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++ } else q = false } else field += c }
    else if (c === '"') q = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = '' }
    else if (c !== '\r') field += c
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  return rows
}

const raw = readFileSync(resolve(ROOT, 'docs/migration/documents.csv'), 'utf8')
const [header, ...rows] = parseCsv(raw)
const urlCol = header.findIndex((h) => /url/i.test(h))

// Distinct uploads-relative paths from the audit.
const rels = new Set()
for (const r of rows) {
  const url = (r[urlCol] || '').trim()
  const m = url.match(/\/wp-content\/uploads\/(.+)$/)
  if (m) rels.add(decodeURIComponent(m[1]))
}

function localSource(rel) { for (const r of ROOTS) { const p = join(r, rel); if (existsSync(p)) return p } return null }
function isFile(buf) {
  if (buf.length < 4) return false
  if (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) return true // %PDF
  if (buf[0] === 0x50 && buf[1] === 0x4b) return true // zip (docx/xlsx/pptx)
  if (buf[0] === 0xd0 && buf[1] === 0xcf && buf[2] === 0x11 && buf[3] === 0xe0) return true // OLE (doc/xls)
  return true // images / other binaries: accept (HTML guarded by content-type below)
}

const need = [...rels].filter((rel) => {
  const dest = join(PUBLIC_DOCS, rel)
  return !(existsSync(dest) && statSync(dest).size > 0) && !localSource(rel)
})
console.log(`Library files: ${rels.size} · already hosted/local: ${rels.size - need.length} · to fetch: ${need.length}\n`)

const ok = [], fail = []
let i = 0, active = 0
async function one(rel) {
  const dest = join(PUBLIC_DOCS, rel)
  const url = LIVE + rel.split('/').map(encodeURIComponent).join('/')
  try {
    const res = await fetch(url, { redirect: 'follow' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const ct = res.headers.get('content-type') || ''
    if (ct.includes('text/html')) throw new Error('HTML (soft 404)')
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 512 || !isFile(buf.subarray(0, 8))) throw new Error(`tiny/invalid (${buf.length}B)`)
    mkdirSync(dirname(dest), { recursive: true })
    writeFileSync(dest, buf)
    ok.push(rel)
    process.stdout.write(`  ✓ ${rel} (${(buf.length / 1024).toFixed(0)} KB)\n`)
  } catch (e) { fail.push(`${rel}  (${e.message})`) }
}
await new Promise((done) => {
  const CONC = 8
  ;(function pump() {
    while (active < CONC && i < need.length) {
      active++
      one(need[i++]).finally(() => { active--; i >= need.length && active === 0 ? done() : pump() })
    }
  })()
})

console.log(`\nFetched: ${ok.length} · still unavailable: ${fail.length}`)
for (const f of fail) console.log('  ✗', f)

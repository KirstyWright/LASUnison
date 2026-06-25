#!/usr/bin/env node
/**
 * fetch-missing-docs.mjs — self-host as many documents as possible.
 *
 * The local WordPress exports in ../old don't have every file (recent uploads
 * are absent). This pulls the still-external documents directly from their live
 * lasunison.co.uk URL, validates the response is a real file (not a 404 page or
 * the mdocs plugin landing page), and saves it into public/docs/<path> so the
 * next `node scripts/build-documents.mjs` run marks it as self-hosted.
 *
 * Anything it can't fetch is written to docs/migration/unhosted-documents.csv
 * and printed here, for manual follow-up.
 *
 * Run:  node scripts/fetch-missing-docs.mjs   (then re-run build-documents.mjs)
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const PUBLIC_DOCS = resolve(ROOT, 'public/docs')
const REPORT = resolve(ROOT, 'docs/migration/unhosted-documents.csv')
const TMP = resolve(ROOT, 'node_modules/.cache/doc-fetch.tmp')

// The to-do list is the unhosted report written by build-documents.mjs.
if (!existsSync(REPORT)) {
  console.error('No docs/migration/unhosted-documents.csv — run `node scripts/build-documents.mjs` first.')
  process.exit(1)
}
const todo = readFileSync(REPORT, 'utf8').trim().split('\n').slice(1).map((line) => {
  const m = line.match(/^(\d+),(\d{4}-\d{2}-\d{2}),(.*),(\S+)$/)
  return m ? { id: m[1], date: m[2], title: m[3].replace(/^"|"$/g, '').replace(/""/g, '"'), url: m[4] } : null
}).filter(Boolean)

const encodePath = rel => rel.split('/').map(encodeURIComponent).join('/')

// Real office/PDF magic bytes — rejects HTML 404/landing pages served as 200.
function fileKind(buf) {
  if (buf.length < 8) return null
  if (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) return 'pdf' // %PDF
  if (buf[0] === 0x50 && buf[1] === 0x4b && (buf[2] === 0x03 || buf[2] === 0x05)) return 'zip' // docx/xlsx/pptx
  if (buf[0] === 0xd0 && buf[1] === 0xcf && buf[2] === 0x11 && buf[3] === 0xe0) return 'ole' // legacy doc/xls
  return null
}

mkdirSync(dirname(TMP), { recursive: true })
const fetched = []
const failed = []

console.log(`Trying to fetch ${todo.length} still-external documents from live…\n`)
for (const d of todo) {
  const m = d.url.match(/\/wp-content\/uploads\/(.+)$/)
  if (!m) { failed.push([d, 'no upload path']); continue }
  const rel = decodeURIComponent(m[1])
  const dest = join(PUBLIC_DOCS, rel)
  if (existsSync(dest)) { fetched.push(d); continue }

  let status = ''
  try {
    status = execFileSync('curl', [
      '-sL', '--connect-timeout', '10', '--max-time', '40',
      '-o', TMP, '-w', '%{http_code}', encodeURI(d.url),
    ], { encoding: 'utf8' }).trim()
  } catch (e) {
    failed.push([d, `curl error (${e.message.split('\n')[0]})`]); continue
  }
  if (status !== '200') { failed.push([d, `HTTP ${status}`]); continue }
  const buf = existsSync(TMP) ? readFileSync(TMP) : Buffer.alloc(0)
  const kind = fileKind(buf.subarray(0, 8))
  if (!kind || buf.length < 1024) {
    failed.push([d, `not a file (${buf.length}B${kind ? '' : ', looks like HTML'})`]); continue
  }
  mkdirSync(dirname(dest), { recursive: true })
  writeFileSync(dest, buf)
  fetched.push(d)
  process.stdout.write(`  ✓ ${rel} (${(buf.length / 1024).toFixed(0)} KB)\n`)
}

// Report
const csv = ['ID,Date,Title,URL,Reason']
for (const [d, reason] of failed) {
  csv.push([d.id, d.date, `"${d.title.replace(/"/g, '""')}"`, d.url, reason].join(','))
}
writeFileSync(REPORT, csv.join('\n') + '\n')

console.log(`\nFetched ${fetched.length} new file(s); ${failed.length} could not be hosted.`)
if (failed.length) {
  console.log(`\nUnhostable (written to docs/migration/unhosted-documents.csv):`)
  const byReason = {}
  for (const [, r] of failed) {
    const key = r.replace(/\(.*\)/, '').replace(/\d+B.*/, 'not a file').trim()
    byReason[key] = (byReason[key] ?? 0) + 1
  }
  for (const [r, n] of Object.entries(byReason).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${n.toString().padStart(3)} × ${r}`)
  }
}
console.log(`\nNow re-run:  node scripts/build-documents.mjs`)

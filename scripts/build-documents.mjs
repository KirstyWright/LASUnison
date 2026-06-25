#!/usr/bin/env node
/**
 * build-documents.mjs — seed the `documents` Nuxt Content collection from the
 * WordPress document-library audit (docs/migration/documents.csv).
 *
 * Writes one YAML file per document to content/documents/, copies the actual
 * files into public/docs/, and records anything it can't host to
 * docs/migration/unhosted-documents.csv. The CSV is the migration source of
 * truth (see CLAUDE.md); after this seeding the collection is owned by editors
 * in Nuxt Studio, so existing content/documents/*.yml are NEVER overwritten —
 * a re-run only adds files that don't exist yet.
 *
 *   node scripts/build-documents.mjs            # seed new docs + copy files
 *   node scripts/build-documents.mjs --prune    # also delete orphan public/docs files
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, readdirSync, statSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const SRC = resolve(ROOT, 'docs/migration/documents.csv')
const DOCS_DIR = resolve(ROOT, 'content/documents')

// Where to find the actual files, in priority order, to host them locally.
// The fresh live pull is missing 2024–2026 uploads (only on the server), so the
// ≤2023 .com export carries most files; recent ones stay as external fallbacks.
const UPLOAD_ROOTS = [
  resolve(ROOT, '../old/pull-2026-06-25/site/app82853866/wp-content/uploads'),
  resolve(ROOT, '../old/wp-content/uploads'),
]
const PUBLIC_DOCS = resolve(ROOT, 'public/docs')

/** Minimal RFC-4180 CSV parser — handles quoted fields with embedded commas. */
function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ }
        else inQuotes = false
      } else field += c
    } else if (c === '"') inQuotes = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field); rows.push(row); row = []; field = ''
    } else field += c
  }
  if (field.length || row.length) { row.push(field); rows.push(row) }
  return rows.filter(r => r.length > 1 || (r.length === 1 && r[0] !== ''))
}

/** WordPress upload titles arrive URL-mangled — make them human again. */
function cleanTitle(raw) {
  let t = raw.replace(/[+_]+/g, ' ')        // url/space artefacts
  // De-slug filename-style titles ("England-pay-deal" → "England pay deal").
  // Only when there are no spaces, so spaced titles keep hyphens (COVID-19 …).
  if (!/\s/.test(t)) t = t.replace(/-+/g, ' ')
  t = t.replace(/\s+\(\d+\)\s*$/, '')       // trailing " (1)" dedupe suffix
    .replace(/\.(pdf|docx?|xlsx?|pptx?|dotx|potx)$/i, '') // stray extension
    .replace(/\s{2,}/g, ' ')
    .trim()
  // Title-case ALL-CAPS shouting (keep short acronyms intact).
  if (t === t.toUpperCase() && /[A-Z]{4,}/.test(t)) {
    t = t.toLowerCase().replace(/\b([a-z])/g, (_, ch) => ch.toUpperCase())
      .replace(/\b(Nhs|Las|Hs|Afc|Ppe|Eoc|Iuc|Lgbt|Agm|Rspf|Spf|Tfl|Errbo|Rta)\b/gi,
        m => m.toUpperCase())
  }
  return t
}

const TYPE_MAP = [
  [/wordprocessingml\.template|\.dotx/i, 'Word template'],
  [/wordprocessingml\.document|^docx?$/i, 'Word'],
  [/spreadsheetml|^xlsx?$/i, 'Excel'],
  [/presentationml|\.potx/i, 'PowerPoint'],
  [/^pdf$/i, 'PDF'],
]
function normaliseType(raw) {
  for (const [re, label] of TYPE_MAP) if (re.test(raw)) return label
  return 'File'
}

/** A safe, kebab filename slug for a content/documents/<slug>.yml. */
function slugify(s) {
  return String(s).toLowerCase().normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-')
    .replace(/^-|-$/g, '').slice(0, 72) || 'document'
}

/** Double-quoted YAML scalar (escapes \ and ") — safe for any title/path. */
function yaml(s) {
  return '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'
}

/** Topic inference — first matching rule wins. Editors retag in Studio. */
const TOPIC_RULES = [
  ['Retired members', /\bretired\b|retirement (grant|function|expenses)|\brm[\s-]|12june\d+-retire/i],
  ['Pensions', /pension|errbo|\bnhsbsa\b|injury benefit/i],
  ['Pay & conditions', /\bpay\b|agenda for change|\bafc\b|unsocial|wage|salary|annual leave|flexible working|terms and conditions|\bband|emt[\s-]?\d?|\bhr\d|\bop\d{2,}|managing attendance|maternity|disciplinary|capability|sickness|uniform|rest break|\bpolicy\b|\bannex\b|staff council|framework agreement|pay circular|high cost area|fast track/i],
  ['Health & safety', /health (and|&) safety|\bh&s\b|\bhands\b|\bppe\b|covid|coronavirus|\brisk\b|violence|manual handling|wellbeing|safe side|safety (poster|rep)|ramadan|workforce guidance/i],
  ['Education & learning', /education|\bcourse|functional skills|\blearning\b|training|book grant|grant template|steward training/i],
  ['Equality', /\blgbt\b|equalit|\brace\b|disabilit|\bwomen\b|out in london|young member|12june\d+-eq/i],
  ['Welfare', /welfare|there for you|financial assistance|hardship|school clothing|charity|mind leaflet|mental health|lottery|pin badge|12june\d+-wel/i],
  ['Labour Link', /labour link|political fund|labour party/i],
  ['Stewards’ resources', /steward|trade union (leaflet|rep)|grievance|\bkyr\b|know your rights|pocket guide|workplace rep|expenses template/i],
  ['Legal & forms', /\bform\b|claim|\blegal\b|\bcase\b|application|notification of workplace/i],
  ['Membership', /membership|recruit|subscription|join unison|why join|update your details|join poster|essential cover|how does las unison/i],
  ['Environment', /environment|green passport|climate|ambulance network/i],
  ['Branch & governance', /branch|\bagm\b|annual report|meeting|minutes|\brules\b|bulletin|newsletter|constitution|^b[cs][\s-]|blog|comms[\s-]|12june\d+-(bc|bs|comms|gen|edu|hs|mem)|map \d{4}|poster|leaflet|template/i],
]
function inferTopic(title) {
  for (const [topic, re] of TOPIC_RULES) if (re.test(title)) return topic
  return 'General'
}

// Exact (cleaned, lower-cased) titles that are migration noise, not documents.
const DENY = /^(green|attachment|draft|final|test|copy|untitled|image\d*|img\d*|6 ?pack|new)$/i

const raw = readFileSync(SRC, 'utf8')
const [header, ...rows] = parseCsv(raw)
const col = Object.fromEntries(header.map((h, i) => [h.trim().toLowerCase(), i]))

const seenUrl = new Set()
let docs = []
let skipped = 0
for (const r of rows) {
  const title = cleanTitle(r[col['title']] ?? '')
  const url = (r[col['file / url']] ?? '').trim()
  const date = (r[col['date']] ?? '').trim().slice(0, 10)
  // Drop junk: empty/numeric-only/denylisted titles, bad URLs or dates.
  if (!title || /^[\d\s]+$/.test(title) || title.length < 3 || DENY.test(title)) { skipped++; continue }
  if (!/^https?:\/\//.test(url)) { skipped++; continue }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { skipped++; continue }
  if (seenUrl.has(url)) { skipped++; continue }
  seenUrl.add(url)
  docs.push({
    id: Number(r[col['id']]) || 0,
    slug: (r[col['slug']] ?? '').trim(),
    title,
    date,
    type: normaliseType((r[col['type']] ?? '').trim()),
    topic: inferTopic(title),
    url,
  })
}

docs.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))

// Collapse exact title duplicates (e.g. three "Green" posters) — keep newest.
const seenTitle = new Set()
docs = docs.filter(d => {
  const key = d.title.toLowerCase().replace(/\s+/g, ' ').trim()
  if (seenTitle.has(key)) { skipped++; return false }
  seenTitle.add(key)
  return true
})

// Host the files on this site: copy each available file from the local export
// into public/docs/<year>/<month>/<file> and rewrite its URL to a same-site
// path. Files we don't have locally keep their live-site URL (local: false).
const encodePath = rel => rel.split('/').map(encodeURIComponent).join('/')
let localised = 0
let external = 0
for (const d of docs) {
  const m = d.url.match(/\/wp-content\/uploads\/(.+)$/)
  if (!m) { d.local = false; external++; continue }
  const rel = decodeURIComponent(m[1])
  const dest = join(PUBLIC_DOCS, rel)
  // Already self-hosted? (copied here before, or fetched from live by
  // scripts/fetch-missing-docs.mjs). Treat public/docs as the source of truth.
  if (existsSync(dest)) {
    d.url = '/docs/' + encodePath(rel)
    d.local = true
    localised++
    continue
  }
  // Otherwise copy it out of a local WordPress export if we have it.
  let src = null
  for (const root of UPLOAD_ROOTS) {
    const p = join(root, rel)
    if (existsSync(p)) { src = p; break }
  }
  if (!src) { d.local = false; external++; continue }
  mkdirSync(dirname(dest), { recursive: true })
  copyFileSync(src, dest)
  d.url = '/docs/' + encodePath(rel)
  d.local = true
  localised++
}

// Only list documents we actually host. Record the ones we can't get (no file
// in public/docs or the local exports) to docs/migration/unhosted-documents.csv
// for manual retrieval — drop the file into public/docs and re-run to add it back.
const unhosted = docs.filter(d => !d.local)
const report = ['ID,Date,Title,URL']
for (const d of unhosted) {
  report.push([d.id, d.date, `"${d.title.replace(/"/g, '""')}"`, d.url].join(','))
}
writeFileSync(resolve(ROOT, 'docs/migration/unhosted-documents.csv'), report.join('\n') + '\n')
docs = docs.filter(d => d.local)

// Seed the Content collection: one YAML file per hosted document. Existing
// files are NEVER overwritten — Studio owns them after the first seed.
mkdirSync(DOCS_DIR, { recursive: true })
const usedNames = new Set()
let written = 0
let kept = 0
for (const d of docs) {
  let base = slugify(d.slug || d.title || String(d.id))
  let name = base
  for (let n = 2; usedNames.has(name); n++) name = `${base}-${n}`
  usedNames.add(name)
  const out = join(DOCS_DIR, `${name}.yml`)
  if (existsSync(out)) { kept++; continue }
  const lines = [
    `title: ${yaml(d.title)}`,
    `date: ${yaml(d.date)}`,
    `topic: ${yaml(d.topic)}`,
    `type: ${yaml(d.type)}`,
    `file: ${yaml(d.url)}`,
  ]
  if (d.id) lines.push(`wpId: ${d.id}`)
  writeFileSync(out, lines.join('\n') + '\n')
  written++
}

// --prune: delete any file in public/docs not referenced by a kept document
// (leftovers from denylisted/deduped entries), then remove emptied folders.
if (process.argv.includes('--prune') && existsSync(PUBLIC_DOCS)) {
  const walk = (dir) => readdirSync(dir).flatMap((n) => {
    const p = join(dir, n)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
  const kept = new Set(docs.map(d => join(PUBLIC_DOCS, decodeURIComponent(d.url.replace('/docs/', '')))))
  let pruned = 0
  for (const f of walk(PUBLIC_DOCS)) {
    if (!kept.has(f)) { rmSync(f); pruned++; console.log(`  pruned ${f.slice(PUBLIC_DOCS.length + 1)}`) }
  }
  const pruneEmpty = (dir) => {
    for (const n of readdirSync(dir)) {
      const p = join(dir, n)
      if (statSync(p).isDirectory()) pruneEmpty(p)
    }
    if (dir !== PUBLIC_DOCS && readdirSync(dir).length === 0) rmSync(dir, { recursive: true })
  }
  pruneEmpty(PUBLIC_DOCS)
  console.log(`Pruned ${pruned} orphan file(s) from public/docs.`)
}

const byTopic = {}
const byType = {}
for (const d of docs) {
  byTopic[d.topic] = (byTopic[d.topic] ?? 0) + 1
  byType[d.type] = (byType[d.type] ?? 0) + 1
}
console.log(`content/documents: wrote ${written} new YAML file(s), kept ${kept} existing (Studio-owned).`)
console.log(`${docs.length} documents hosted · ${external} unavailable (see docs/migration/unhosted-documents.csv) · cleaned/skipped ${skipped}.`)
console.log('By topic:', byTopic)
console.log('By type:', byType)

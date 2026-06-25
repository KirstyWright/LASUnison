/**
 * GET /api/search?q=…  — site-wide full-text search.
 *
 * Searches every published page (the `content`, `news` and `legal` Content
 * collections — titles, descriptions AND body copy via the Content search
 * sections), plus the curated documents and links from the Resources hub.
 * Returns grouped, ranked, capped results so the header search overlay and the
 * /search page can render the same shape.
 *
 * The heavy part — pulling and flattening section text for 500+ pages — is
 * memoised in module scope so typing in the overlay doesn't re-read SQLite on
 * every keystroke.
 */
import { staffTools, quickLinks, relatedLinks } from '../../app/data/links'

// ------------------------------------------------------------------ types
interface PageHit { path: string; title: string; snippet: string }
interface NewsHit { path: string; title: string; snippet: string; date?: string; category?: string }
interface DocHit { id: number; title: string; url: string; type: string; topic: string; date: string }
interface LinkHit { label: string; url: string; note?: string; group: string }

interface IndexEntry {
  path: string
  title: string
  /** Lowercased title + description + body, joined — the searchable haystack. */
  haystack: string
  /** Original-case body text, for building snippets. */
  body: string
  date?: string
  category?: string
}

// ------------------------------------------------------------------ helpers
function tokenize(q: string): string[] {
  return q.toLowerCase().split(/\s+/).filter(Boolean).slice(0, 8)
}

function hostLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/** Pull a ~160-char window around the first matched term, with ellipses. */
function makeSnippet(body: string, terms: string[], len = 160): string {
  const text = body.replace(/\s+/g, ' ').trim()
  if (!text) return ''
  const lower = text.toLowerCase()
  let at = -1
  for (const t of terms) {
    const i = lower.indexOf(t)
    if (i !== -1 && (at === -1 || i < at)) at = i
  }
  if (at <= 0) return text.length > len ? text.slice(0, len).trim() + ' …' : text
  const start = Math.max(0, at - 60)
  let snip = text.slice(start, start + len).trim()
  if (start > 0) snip = '… ' + snip
  if (start + len < text.length) snip = snip + ' …'
  return snip
}

/** Score a haystack/title against the terms. Returns 0 when not every term hits. */
function score(terms: string[], title: string, haystack: string, phrase: string): number {
  const t = title.toLowerCase()
  let s = 0
  for (const term of terms) {
    if (!haystack.includes(term)) return 0 // AND semantics: every term must appear
    if (t.includes(term)) s += 10
    else s += 1
  }
  if (phrase && t.includes(phrase)) s += 25 // exact phrase in the title — best match
  else if (phrase && haystack.includes(phrase)) s += 5
  return s
}

// ------------------------------------------------------------------ content index (memoised)
const PER_GROUP_CAP = 40
const TTL = 1000 * 60 * 5

let cache: { at: number; content: IndexEntry[]; news: IndexEntry[]; legal: IndexEntry[]; documents: any[] } | null = null

async function buildIndex(event: any) {
  if (cache && Date.now() - cache.at < TTL) return cache

  // Body text per page, flattened from the heading-split search sections.
  async function bodyByPath(coll: 'content' | 'news' | 'legal') {
    const sections = await queryCollectionSearchSections(event, coll)
    const map = new Map<string, string>()
    for (const sec of sections) {
      const base = (sec.id || '').split('#')[0]
      if (!base) continue
      const chunk = `${(sec.titles || []).join(' ')} ${sec.content || ''}`
      map.set(base, (map.get(base) ? map.get(base) + ' ' : '') + chunk)
    }
    return map
  }

  const [contentBodies, newsBodies, legalBodies] = await Promise.all([
    bodyByPath('content'),
    bodyByPath('news'),
    bodyByPath('legal'),
  ])

  // Page metadata (scalar fields only — never pull the body AST).
  const [contentMeta, newsMeta, legalMeta] = await Promise.all([
    queryCollection(event, 'content').select('path', 'title', 'description', 'stub').all(),
    queryCollection(event, 'news').select('path', 'title', 'excerpt', 'date', 'category').all(),
    queryCollection(event, 'legal').select('path', 'title', 'description').all(),
  ])

  const toEntry = (
    m: any,
    bodies: Map<string, string>,
    extra?: { date?: string; category?: string; lead?: string },
  ): IndexEntry => {
    const body = bodies.get(m.path) || ''
    const title = m.title || ''
    const lead = extra?.lead || m.description || ''
    return {
      path: m.path,
      title,
      body,
      haystack: `${title} ${lead} ${body}`.toLowerCase(),
      date: extra?.date,
      category: extra?.category,
    }
  }

  // Branch document library — the `documents` collection (content/documents/*.yml).
  const documents = await queryCollection(event, 'documents').order('date', 'DESC').all()

  cache = {
    at: Date.now(),
    // Skip empty placeholder pages — they'd be dead-ends in the results.
    content: contentMeta
      .filter((m: any) => m.path && m.stub !== true)
      .map((m: any) => toEntry(m, contentBodies)),
    news: newsMeta
      .filter((m: any) => m.path)
      .map((m: any) => toEntry(m, newsBodies, { date: m.date, category: m.category, lead: m.excerpt })),
    legal: legalMeta
      .filter((m: any) => m.path)
      .map((m: any) => toEntry(m, legalBodies)),
    documents,
  }
  return cache
}

// ------------------------------------------------------------------ documents + links (static)
const LINK_INDEX: LinkHit[] = [staffTools, ...quickLinks, ...relatedLinks].flatMap(g =>
  g.links.map(l => ({ label: l.label, url: l.url, note: l.note, group: g.title })),
)

// ------------------------------------------------------------------ handler
export default defineEventHandler(async (event) => {
  const q = (getQuery(event).q as string | undefined)?.trim() || ''
  const terms = tokenize(q)
  const empty = { query: q, pages: [], news: [], documents: [], links: [], total: 0, counts: { pages: 0, news: 0, documents: 0, links: 0 } }
  if (!terms.length) return empty

  const phrase = q.toLowerCase()
  const idx = await buildIndex(event)

  const rank = (entries: IndexEntry[]) =>
    entries
      .map(e => ({ e, s: score(terms, e.title, e.haystack, phrase) }))
      .filter(r => r.s > 0)
      // Higher score first; for ties prefer the more recent (news) then title.
      .sort((a, b) => b.s - a.s || (b.e.date || '').localeCompare(a.e.date || ''))

  const pagesRanked = rank([...idx.content, ...idx.legal])
  const newsRanked = rank(idx.news)

  const pages: PageHit[] = pagesRanked.slice(0, PER_GROUP_CAP).map(({ e }) => ({
    path: e.path,
    title: e.title,
    snippet: makeSnippet(e.body, terms),
  }))

  const news: NewsHit[] = newsRanked.slice(0, PER_GROUP_CAP).map(({ e }) => ({
    path: e.path,
    title: e.title,
    snippet: makeSnippet(e.body, terms),
    date: e.date,
    category: e.category,
  }))

  // Documents — match title + topic (files are self-hosted, so no host to match).
  const documentsRanked = idx.documents
    .map((d: any) => ({ d, s: score(terms, d.title, `${d.title} ${d.topic}`.toLowerCase(), phrase) }))
    .filter((r: any) => r.s > 0)
    .sort((a: any, b: any) => b.s - a.s || String(b.d.date).localeCompare(String(a.d.date)))
  const docs: DocHit[] = documentsRanked.slice(0, PER_GROUP_CAP).map(({ d }: any) => ({
    id: d.wpId ?? 0, title: d.title, url: d.file, type: d.type, topic: d.topic, date: d.date,
  }))

  // Links — match label, note, group and host.
  const linksRanked = LINK_INDEX
    .map(l => ({ l, s: score(terms, l.label, `${l.label} ${l.note || ''} ${l.group} ${hostLabel(l.url)}`.toLowerCase(), phrase) }))
    .filter(r => r.s > 0)
    .sort((a, b) => b.s - a.s)
  const links: LinkHit[] = linksRanked.slice(0, PER_GROUP_CAP).map(({ l }) => l)

  return {
    query: q,
    pages,
    news,
    documents: docs,
    links,
    total: pagesRanked.length + newsRanked.length + documentsRanked.length + linksRanked.length,
    counts: {
      pages: pagesRanked.length,
      news: newsRanked.length,
      documents: documentsRanked.length,
      links: linksRanked.length,
    },
  }
})

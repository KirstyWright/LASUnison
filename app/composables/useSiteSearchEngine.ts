/**
 * Client-side site search — the static-host replacement for the old
 * server/api/search.get.ts endpoint.
 *
 * The production host (IONOS) is static with no Node runtime, so an API route
 * can't run at request time. Instead we search in the browser: @nuxt/content v3
 * ships the content database to the client as WASM SQLite, so queryCollection /
 * queryCollectionSearchSections run fully client-side over the same data the
 * server endpoint used.
 *
 * The index — section text + metadata for every page, the document library, and
 * the curated links — is built once on demand (memoised by useAsyncData), then
 * every keystroke ranks it in memory. The ranking, snippets, grouping, caps and
 * counts are a faithful port of the old endpoint, so the overlay and /search
 * page render identically; only the data source changed.
 */
import { staffTools, quickLinks, relatedLinks } from '~/data/links'
import {
  EMPTY_RESULTS, searchTerms, searchHostLabel,
  type SearchResponse, type PageHit, type NewsHit, type DocHit, type LinkResult,
} from '~/utils/search'

// ------------------------------------------------------------------ types
interface IndexEntry {
  path: string
  title: string
  /** Lowercased title + description + body — the searchable haystack. */
  haystack: string
  /** Original-case body text, for building snippets. */
  body: string
  date?: string
  category?: string
}

interface SearchIndex {
  content: IndexEntry[]
  news: IndexEntry[]
  legal: IndexEntry[]
  documents: any[]
}

const EMPTY_INDEX: SearchIndex = { content: [], news: [], legal: [], documents: [] }

// How many of each group to return (the overlay/page apply their own display caps).
const PER_GROUP_CAP = 40

// ------------------------------------------------------------------ helpers
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
  if (at <= 0) return text.length > len ? `${text.slice(0, len).trim()} …` : text
  const start = Math.max(0, at - 60)
  let snip = text.slice(start, start + len).trim()
  if (start > 0) snip = `… ${snip}`
  if (start + len < text.length) snip = `${snip} …`
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

// Curated links are static — flatten once at module scope (matches the old
// endpoint: staff tools + secondary quick links + the reference directory).
const LINK_INDEX: LinkResult[] = [staffTools, ...quickLinks, ...relatedLinks].flatMap(g =>
  g.links.map(l => ({ label: l.label, url: l.url, note: l.note, group: g.title })),
)

// ------------------------------------------------------------------ index build
async function buildIndex(): Promise<SearchIndex> {
  // Body text per page, flattened from the heading-split search sections.
  async function bodyByPath(coll: 'content' | 'news' | 'legal') {
    const sections = await queryCollectionSearchSections(coll)
    const map = new Map<string, string>()
    for (const sec of sections as any[]) {
      const base = (sec.id || '').split('#')[0]
      if (!base) continue
      const chunk = `${(sec.titles || []).join(' ')} ${sec.content || ''}`
      map.set(base, (map.get(base) ? `${map.get(base)} ` : '') + chunk)
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
    queryCollection('content').select('path', 'title', 'description', 'stub').all(),
    queryCollection('news').select('path', 'title', 'description', 'date', 'category').all(),
    queryCollection('legal').select('path', 'title', 'description').all(),
  ])

  const toEntry = (
    m: any,
    bodies: Map<string, string>,
    extra?: { date?: string, category?: string, lead?: string },
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
  const documents = await queryCollection('documents').order('date', 'DESC').all()

  return {
    // Skip empty placeholder pages — they'd be dead-ends in the results.
    content: (contentMeta as any[])
      .filter(m => m.path && m.stub !== true)
      .map(m => toEntry(m, contentBodies)),
    news: (newsMeta as any[])
      .filter(m => m.path)
      .map(m => toEntry(m, newsBodies, { date: m.date, category: m.category, lead: m.description })),
    legal: (legalMeta as any[])
      .filter(m => m.path)
      .map(m => toEntry(m, legalBodies)),
    documents,
  }
}

// ------------------------------------------------------------------ ranking
function rank(idx: SearchIndex, query: string): SearchResponse {
  const terms = searchTerms(query)
  const phrase = query.toLowerCase()

  const rankEntries = (entries: IndexEntry[]) =>
    entries
      .map(e => ({ e, s: score(terms, e.title, e.haystack, phrase) }))
      .filter(r => r.s > 0)
      // Higher score first; for ties prefer the more recent (news) then title order.
      .sort((a, b) => b.s - a.s || (b.e.date || '').localeCompare(a.e.date || ''))

  const pagesRanked = rankEntries([...idx.content, ...idx.legal])
  const newsRanked = rankEntries(idx.news)

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
  const documents: DocHit[] = documentsRanked.slice(0, PER_GROUP_CAP).map(({ d }: any) => ({
    id: d.wpId ?? 0, title: d.title, url: d.file, type: d.type, topic: d.topic, date: d.date,
  }))

  // Links — match label, note, group and host.
  const linksRanked = LINK_INDEX
    .map(l => ({ l, s: score(terms, l.label, `${l.label} ${l.note || ''} ${l.group} ${searchHostLabel(l.url)}`.toLowerCase(), phrase) }))
    .filter(r => r.s > 0)
    .sort((a, b) => b.s - a.s)
  const links: LinkResult[] = linksRanked.slice(0, PER_GROUP_CAP).map(({ l }) => l)

  return {
    query,
    pages,
    news,
    documents,
    links,
    total: pagesRanked.length + newsRanked.length + documentsRanked.length + linksRanked.length,
    counts: {
      pages: pagesRanked.length,
      news: newsRanked.length,
      documents: documentsRanked.length,
      links: linksRanked.length,
    },
  }
}

// ------------------------------------------------------------------ composable
export function useSiteSearchEngine() {
  // The index is shared across consumers (overlay + /search page) by its key, so
  // it is built at most once per session. Client-only + lazy: it never runs at
  // prerender, and not until the first search.
  const { data, status, execute } = useAsyncData<SearchIndex>(
    'site-search-index',
    () => buildIndex(),
    { server: false, immediate: false, default: () => EMPTY_INDEX },
  )

  /** Build the index if it isn't ready yet (idempotent; awaits an in-flight build). */
  async function ensureLoaded() {
    // `defer` so a keystroke arriving mid-build reuses the in-flight build
    // instead of cancelling and restarting it (the default 'cancel').
    if (status.value !== 'success') await execute({ dedupe: 'defer' })
  }

  /** Run a query, returning the same shape the old /api/search endpoint did. */
  async function search(query: string): Promise<SearchResponse> {
    const q = query.trim()
    if (!searchTerms(q).length) return { ...EMPTY_RESULTS, query: q }
    await ensureLoaded()
    return rank(data.value ?? EMPTY_INDEX, q)
  }

  return { search, ensureLoaded, status }
}

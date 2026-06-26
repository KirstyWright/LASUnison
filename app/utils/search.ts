/**
 * Shared types + helpers for site search. The response shape is produced by the
 * client search engine (useSiteSearchEngine); these helpers are shared by the
 * search overlay and the /search page.
 */

export interface PageHit { path: string, title: string, snippet: string }
export interface NewsHit { path: string, title: string, snippet: string, date?: string, category?: string }
export interface DocHit { id: number, title: string, url: string, type: string, topic: string, date: string }
export interface LinkResult { label: string, url: string, note?: string, group: string }

export interface SearchResponse {
  query: string
  pages: PageHit[]
  news: NewsHit[]
  documents: DocHit[]
  links: LinkResult[]
  total: number
  counts: { pages: number, news: number, documents: number, links: number }
}

export const EMPTY_RESULTS: SearchResponse = {
  query: '', pages: [], news: [], documents: [], links: [], total: 0,
  counts: { pages: 0, news: 0, documents: 0, links: 0 },
}

/** Split a query into lowercased terms (same rule as the server). */
export function searchTerms(query: string): string[] {
  return query.toLowerCase().split(/\s+/).filter(Boolean).slice(0, 8)
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export interface TextPart { text: string, hit: boolean }

/**
 * Split text into parts, flagging the spans that match any search term, so the
 * UI can wrap them in <mark> without using v-html. Empty terms → one plain part.
 */
export function highlightParts(text: string, query: string): TextPart[] {
  const terms = searchTerms(query)
  if (!text || !terms.length) return [{ text, hit: false }]
  const re = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi')
  // String.split with a capturing group keeps the matched spans as their own
  // array entries; each such span equals one of the terms (case-insensitively).
  return text
    .split(re)
    .filter(s => s.length > 0)
    .map(s => ({ text: s, hit: terms.includes(s.toLowerCase()) }))
}

/** A short, friendly host for display: "https://www.tfl.gov.uk/x" → "tfl.gov.uk". */
export function searchHostLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  }
  catch {
    return url
  }
}

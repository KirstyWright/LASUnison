/**
 * Resources helpers — shared by the Resources hub (the links directory +
 * document search). Topic drives the accent colour and icon so a document's
 * subject reads consistently across the library and the search results.
 * Mirrors the shape of app/utils/news.ts.
 */
import {
  benefits, staffTools, quickLinks, relatedLinks, resourcePages,
  type SiteLink, type ResourcePage,
} from '~/data/links'

/** A document from the `documents` Content collection (content/documents/*.yml). */
export interface SiteDocument {
  /** Stable key assigned by Nuxt Content. */
  id?: string
  title: string
  /** ISO date (yyyy-mm-dd). */
  date: string
  /** Subject — drives the colour, icon and topic filter. */
  topic: string
  /** File kind: PDF | Word | Excel | PowerPoint | Word template | File. */
  type: string
  /** Same-site path to the file, e.g. /docs/2026/05/foo.pdf */
  file: string
  /** Original WordPress attachment ID (provenance). */
  wpId?: number
}

export type { SiteLink, ResourcePage }

export interface TopicMeta {
  /** Full CSS var for the tile glyph + accent. */
  accent: string
  /** Soft tint surface behind the glyph. */
  soft: string
  /** UiIcon name. */
  icon: string
}

/* Heritage purple + green carry identity; blue is the functional/clinical
   accent; muted ink is the neutral fallback. (Respects the One Heritage Rule.) */
const PURPLE: Omit<TopicMeta, 'icon'> = { accent: 'var(--brand-primary)', soft: 'var(--brand-primary-soft)' }
const GREEN: Omit<TopicMeta, 'icon'> = { accent: 'var(--green-700)', soft: 'var(--brand-secondary-soft)' }
const BLUE: Omit<TopicMeta, 'icon'> = { accent: 'var(--blue-700)', soft: 'var(--brand-accent-soft)' }
const MUTED: Omit<TopicMeta, 'icon'> = { accent: 'var(--text-muted)', soft: 'var(--surface-sunken)' }

const TOPIC_MAP: Record<string, TopicMeta> = {
  'Pay & conditions': { ...PURPLE, icon: 'banknote' },
  'Branch & governance': { ...PURPLE, icon: 'building' },
  'Stewards’ resources': { ...PURPLE, icon: 'briefcase' },
  'Labour Link': { ...PURPLE, icon: 'flag' },
  'Education & learning': { ...GREEN, icon: 'graduationCap' },
  'Membership': { ...GREEN, icon: 'userPlus' },
  'Welfare': { ...GREEN, icon: 'heart' },
  'Equality': { ...GREEN, icon: 'users' },
  'Environment': { ...GREEN, icon: 'flag' },
  'Health & safety': { ...BLUE, icon: 'shield' },
  'Pensions': { ...BLUE, icon: 'clock' },
  'Legal & forms': { ...BLUE, icon: 'scale' },
  'Retired members': { ...MUTED, icon: 'award' },
  'General': { ...MUTED, icon: 'file' },
}

const TOPIC_FALLBACK: TopicMeta = { ...MUTED, icon: 'file' }

export function docTopicMeta(topic: string): TopicMeta {
  return TOPIC_MAP[topic] ?? TOPIC_FALLBACK
}

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

/** ISO date (yyyy-mm-dd) → "12 Jun 2024". Parsed by parts to dodge TZ drift. */
export function formatDocDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  if (!y || !m || !d) return iso
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`
}

export function docYear(iso: string): number {
  return Number(iso.slice(0, 4))
}

/** A short, friendly host for display: "https://www.tfl.gov.uk/x" → "tfl.gov.uk". */
export function hostLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  }
  catch {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] ?? url
  }
}

/* ------------------------------------------------------------------ *
 * Unified hub search — documents + links + on-site pages
 * ------------------------------------------------------------------ */

export interface LinkHit extends SiteLink { group: string }
export interface SearchResults {
  documents: SiteDocument[]
  links: LinkHit[]
  pages: ResourcePage[]
  total: number
}

/** Flattened quick-link + related-link index (label, note, host all searchable). */
const ALL_LINK_GROUPS = [benefits, staffTools, ...quickLinks, ...relatedLinks]
const LINK_INDEX: LinkHit[] = ALL_LINK_GROUPS.flatMap(g =>
  g.links.map(l => ({ ...l, group: g.title })),
)

function matches(terms: string[], ...fields: (string | undefined)[]): boolean {
  const hay = fields.filter(Boolean).join(' ').toLowerCase()
  return terms.every(t => hay.includes(t))
}

/**
 * Tokenised AND search across the three sources. Documents come from the
 * `documents` collection (fetched in the page); links/pages are module data.
 * Empty query → empty results.
 */
export function searchResources(query: string, documents: SiteDocument[]): SearchResults {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (!terms.length) return { documents: [], links: [], pages: [], total: 0 }

  const docs = documents.filter(d => matches(terms, d.title, d.topic))
  const links = LINK_INDEX.filter(l => matches(terms, l.label, l.note, l.group, hostLabel(l.url)))
  const pages = resourcePages.filter(p => matches(terms, p.label, p.note))

  return { documents: docs, links, pages, total: docs.length + links.length + pages.length }
}

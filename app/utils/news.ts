/**
 * News helpers — shared by the news index, article pages and the
 * homepage teaser. Category drives the accent colour, the placeholder
 * tone and the icon, so the visual language stays consistent everywhere.
 */

export interface NewsItem {
  path: string
  title: string
  date: string
  category: string
  topic?: string
  excerpt: string
  author?: string
  readTime?: number
  urgent?: boolean
  source?: string
  sourceLabel?: string
  /** Featured image, e.g. /images/2016/04/foo.jpg. Absent → branded banner. */
  image?: string
}

export type PhotoTone = 'purple' | 'green' | 'blue' | 'ink'

export interface NewsCategoryMeta {
  /** Full CSS var for the top strip + category eyebrow. */
  accent: string
  /** UiPhoto tone for the placeholder media. */
  tone: PhotoTone
  /** UiIcon name used on the media tile. */
  icon: string
}

const CATEGORY_MAP: Record<string, NewsCategoryMeta> = {
  Statement: { accent: 'var(--brand-primary)', tone: 'purple', icon: 'file' },
  Negotiations: { accent: 'var(--brand-accent)', tone: 'blue', icon: 'scale' },
  Report: { accent: 'var(--brand-secondary)', tone: 'green', icon: 'bookOpen' },
  Campaign: { accent: 'var(--brand-secondary)', tone: 'green', icon: 'megaphone' },
  News: { accent: 'var(--brand-primary)', tone: 'purple', icon: 'file' },
}

const FALLBACK: NewsCategoryMeta = { accent: 'var(--brand-primary)', tone: 'purple', icon: 'file' }

/** Resolve the colour/tone/icon for a category. Urgent items take the 999 red. */
export function newsCategoryMeta(category: string, urgent = false): NewsCategoryMeta {
  if (urgent) return { accent: 'var(--emergency)', tone: 'purple', icon: 'alert' }
  return CATEGORY_MAP[category] ?? FALLBACK
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/** ISO date (yyyy-mm-dd) → "12 June 2026". Parsed by parts to avoid timezone drift. */
export function formatNewsDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  if (!y || !m || !d) return iso
  return `${d} ${MONTHS[m - 1]} ${y}`
}

/** Machine-readable date for the <time> element. */
export function isoDate(iso: string): string {
  return iso.slice(0, 10)
}

/** "3 min read", or null when no reading time is set. */
export function readTimeLabel(minutes?: number): string | null {
  if (!minutes) return null
  return `${minutes} min read`
}

/**
 * Deep brand gradient for the branded "branch banner" placeholder shown when a
 * post has no featured image. Keyed by the category tone so the banner colour
 * tracks the rest of the card's visual language (purple/green/blue/ink).
 */
const BANNER_BG: Record<PhotoTone, string> = {
  purple: 'linear-gradient(135deg, var(--purple-800) 0%, var(--purple-600) 100%)',
  green: 'linear-gradient(135deg, var(--green-800) 0%, var(--green-600) 100%)',
  blue: 'linear-gradient(135deg, var(--blue-800) 0%, var(--blue-600) 100%)',
  ink: 'linear-gradient(135deg, var(--ink-900) 0%, var(--ink-700) 100%)',
}

export function newsBannerBg(tone: PhotoTone): string {
  return BANNER_BG[tone]
}

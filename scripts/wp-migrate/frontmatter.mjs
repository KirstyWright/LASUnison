// Map a WordPress post/page row to news/page frontmatter, and serialise the file.
import { dump as yamlDump } from 'js-yaml'
import he from 'he'
import { plainText } from './html-to-md.mjs'
import {
  AUTHOR_DENYLIST,
  CATEGORY_TYPE_MAP,
  TOPIC_PRIORITY,
  SITE,
} from './config.mjs'

const decode = (s) => he.decode((s || '').trim())

export function isoDate(wpDate) {
  return (wpDate || '').slice(0, 10) // "2026-06-12 17:01:03" -> "2026-06-12"
}

export function deriveExcerpt(html, words = 30) {
  const text = plainText(html)
  if (!text) return ''
  const parts = text.split(' ')
  if (parts.length <= words) return text
  let out = parts.slice(0, words).join(' ')
  // prefer to end on a sentence boundary if one is nearby
  const stop = out.lastIndexOf('. ')
  if (stop > out.length * 0.5) out = out.slice(0, stop + 1)
  else out = out.replace(/[,;:.\s]+$/, '') + '…'
  return out
}

function readTime(html) {
  const n = plainText(html).split(' ').filter(Boolean).length
  return Math.max(1, Math.ceil(n / 200))
}

function pickCategory(categories) {
  for (const c of categories) {
    const t = CATEGORY_TYPE_MAP[c.slug]
    if (t) return t
  }
  return 'News'
}

function pickTopic(categories) {
  const slugs = new Set(categories.map((c) => c.slug))
  for (const [slug, label] of TOPIC_PRIORITY) if (slugs.has(slug)) return label
  return undefined
}

// Build the ordered news frontmatter object for a post.
export function postFrontmatter(post, terms, featuredUrl) {
  const cats = terms?.categories ?? []
  const tags = [...new Set((terms?.tags ?? []).map((t) => decode(t).toLowerCase()))]
  const fm = {}
  fm.title = decode(post.title) || post.slug
  fm.date = isoDate(post.date)
  fm.category = pickCategory(cats)
  const topic = pickTopic(cats)
  if (topic) fm.topic = topic
  const author = decode(post.author)
  if (author && !AUTHOR_DENYLIST.has(author.toLowerCase())) fm.author = author
  fm.readTime = readTime(post.content)
  fm.excerpt = deriveExcerpt(post.content) || fm.title
  if (tags.length) fm.tags = tags
  if (featuredUrl) fm.image = featuredUrl
  if (cats.length) fm.wpCategories = cats.map((c) => decode(c.name))
  fm.wpId = Number(post.id)
  fm.legacyUrl = `${SITE}/${post.slug}`
  return fm
}

// Build frontmatter for a content page.
export function pageFrontmatter(page, legacyUrl, { stub = false } = {}) {
  const fm = {}
  fm.title = decode(page.title) || page.slug
  fm.description = deriveExcerpt(page.content) || fm.title
  fm.date = isoDate(page.modified || page.date)
  if (stub) fm.stub = true
  fm.wpId = Number(page.id)
  fm.legacyUrl = legacyUrl
  return fm
}

// Serialise frontmatter + body into a Markdown file string.
export function toFile(frontmatter, body) {
  const yml = yamlDump(frontmatter, { lineWidth: -1, noRefs: true }).trimEnd()
  return `---\n${yml}\n---\n\n${body.trim()}\n`
}

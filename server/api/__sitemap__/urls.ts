/**
 * Dynamic sitemap entries for Content-backed pages, with lastmod.
 *
 * Wired via nuxt.config `sitemap.sources`. Runs at prerender/build time. The
 * static Vue routes (/, /news, /support, …) are auto-discovered by @nuxtjs/sitemap;
 * this adds the news articles, migrated pages and legal pages that live in Content,
 * stamps each with its last-modified date, and drops stubs + anything flagged
 * `seo.noindex` so they never enter the index.
 */
import type { SitemapUrlInput } from '#sitemap/types'

export default defineSitemapEventHandler(async (event) => {
  const [news, pages, legal] = await Promise.all([
    queryCollection(event, 'news').select('path', 'date', 'seo').all(),
    queryCollection(event, 'content').select('path', 'date', 'stub', 'seo').all(),
    queryCollection(event, 'legal').select('path', 'lastUpdated', 'seo').all(),
  ])

  const urls: SitemapUrlInput[] = []

  for (const a of news) {
    if (!a.path || (a as any).seo?.noindex) continue
    urls.push({ loc: a.path, lastmod: (a as any).date })
  }
  for (const p of pages) {
    if (!p.path || (p as any).stub === true || (p as any).seo?.noindex) continue
    urls.push({ loc: p.path, lastmod: (p as any).date })
  }
  for (const l of legal) {
    if (!l.path || (l as any).seo?.noindex) continue
    urls.push({ loc: l.path, lastmod: (l as any).lastUpdated })
  }

  return urls
})

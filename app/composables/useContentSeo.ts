/**
 * Resolve a Content page's SEO into <head>, with a consistent fallback chain so
 * editors only fill what they want to override in Nuxt Studio:
 *
 *   title       seo.title → "<page title> — LAS UNISON"   (seo.title is used verbatim)
 *   description seo.description → page description → site default
 *   og:image    seo.image → page featured image → branded /og-default.png (absolute)
 *   robots      seo.noindex → "noindex, follow"
 *
 * og:title/description and twitter tags are set explicitly (not left to module
 * inference) and the description always resolves to a concrete string, so every page
 * deterministically overrides the global <head> defaults. Canonical + og:url are
 * added by nuxt-seo-utils from site.url. og:image is absolutised here so social
 * scrapers always receive a full URL.
 */
const SITE_TITLE = 'LAS UNISON — London Ambulance Service UNISON Branch'
const SITE_DESC =
  'The UK’s biggest ambulance branch. We represent, protect and stand up for London Ambulance Service staff.'

interface ContentSeoInput {
  title: () => string | undefined
  description: () => string | undefined
  seo?: () => { title?: string; description?: string; image?: string; noindex?: boolean } | undefined
  image?: () => string | undefined
  type?: 'website' | 'article'
}

export function useContentSeo(opts: ContentSeoInput) {
  const site = useSiteConfig()
  const abs = (p?: string) => (p ? new URL(p, site.url).toString() : undefined)

  const fullTitle = computed(() => {
    const s = opts.seo?.()
    const t = opts.title()
    // @nuxt/content auto-fills seo.title with the page title, so only treat it as an
    // intentional (Studio/Yoast) override when it actually differs — otherwise append
    // the branch suffix to the plain title.
    if (s?.title && s.title !== t) return s.title
    return t ? `${t} — LAS UNISON` : SITE_TITLE
  })

  const description = computed(() => {
    const s = opts.seo?.()
    return s?.description || opts.description() || SITE_DESC
  })

  const ogImage = computed(() => abs(opts.seo?.()?.image || opts.image?.() || '/og-default.png'))
  const noindex = computed(() => opts.seo?.()?.noindex === true)

  useHead({ title: () => fullTitle.value })

  useSeoMeta({
    description: () => description.value,
    ogTitle: () => fullTitle.value,
    ogDescription: () => description.value,
    ogImage: () => ogImage.value,
    ogType: opts.type || 'website',
    twitterCard: 'summary_large_image',
    robots: () => (noindex.value ? 'noindex, follow' : undefined),
  })
}

import tailwindcss from '@tailwindcss/vite'
// All routes backed by Content files — seeded into the prerender list so every
// migrated page ships as a real .html (a static host can't render on demand).
import { contentRoutes } from './scripts/content-routes.mjs'

// Canonical site URL. Staging is the 2026 subdomain; production sets the env to
// https://lasunison.com. Drives canonical tags, sitemap, robots and schema.org.
const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://2026.lasunison.com'
// Index ONLY when explicitly opted in (production). Default false keeps the 2026
// staging clone out of search so it never duplicates/competes with the live site.
const indexable = process.env.NUXT_SITE_INDEXABLE === 'true'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/content', '@nuxtjs/sitemap', '@nuxtjs/robots', 'nuxt-schema-org', 'nuxt-seo-utils'],

  devtools: { enabled: true },
  app: {
    head: {
      htmlAttrs: { lang: 'en-GB' },
      title: 'LAS UNISON — London Ambulance Service UNISON Branch',
      // Pages set complete titles (their own "— LAS UNISON" suffix), so render the
      // title verbatim. This overrides nuxt-seo-utils' default "%s | %siteName"
      // template (which would otherwise append a second " | LAS UNISON").
      titleTemplate: '%s',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'The UK’s biggest ambulance branch. We represent, protect and stand up for London Ambulance Service staff.',
        },
        { name: 'theme-color', content: '#5E22A6' },
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: '48x48 32x32 16x16' },
        { rel: 'icon', type: 'image/png', href: '/favicon-32.png', sizes: '32x32' },
        { rel: 'icon', type: 'image/png', href: '/favicon-16.png', sizes: '16x16' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800;900&family=IBM+Plex+Mono:wght@400;500;600&family=Public+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap',
        },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  // Consumed by the SEO modules (canonical, og:url, sitemap host, robots, schema).
  site: {
    url: siteUrl,
    name: 'LAS UNISON',
    indexable,
  },
  compatibilityDate: '2024-04-03',

  nitro: {
    prerender: {
      crawlLinks: true,
      failOnError: false,
      routes: ['/'],
    },
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  hooks: {
    // Seed every Content-backed route so orphaned/older pages still prerender.
    'nitro:config'(nitroConfig) {
      nitroConfig.prerender ||= {}
      nitroConfig.prerender.routes = [
        ...(nitroConfig.prerender.routes || []),
        ...contentRoutes(),
      ]
    },
  },

  // Project-aware ESLint flat config. `stylistic` turns on formatting rules
  // (single quotes, no semicolons, 2-space indent) that match the existing code,
  // so ESLint also handles formatting — no separate Prettier needed. Custom rules
  // (Vue, Tailwind) are layered on in eslint.config.mjs via withNuxt().
  eslint: {
    config: {
      stylistic: true,
    },
  },

  // NOTE: the ~520 old-WordPress-URL → new-path 301s are served on the Nitro Node
  // server (dev / preview) by server/middleware/redirects.ts — NOT routeRules,
  // which compiled them into one giant matcher that overflowed V8's stack in the
  // browser. The production static host (IONOS/Apache) serves the SAME 301s from a
  // generated public/.htaccess (scripts/build-htaccess.mjs) — keep all three in sync.

  // robots.txt. /search is never indexed; when not `indexable` (staging) the module
  // forces Disallow: / and injects a site-wide noindex automatically (via site config).
  robots: {
    disallow: ['/search'],
  },

  // sitemap.xml. App routes (/, /news, /support, …) are auto-discovered; the dynamic
  // content routes + lastmod come from the source endpoint. /search is excluded.
  sitemap: {
    exclude: ['/search'],
    sources: ['/api/__sitemap__/urls'],
  },
})

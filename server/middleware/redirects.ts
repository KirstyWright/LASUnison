// Old WordPress URLs → new canonical paths, served as 301s on the Nitro Node
// server (`nuxt dev` / `nuxt preview`). This mirrors public/.htaccess, which
// serves the SAME 301s on the static production host (scripts/build-htaccess.mjs).
//
// WHY a middleware instead of routeRules: there are ~520 redirects. Expressing
// them all as routeRules compiles into a single ~170KB route-matcher function
// that overflows V8's stack while it is lazily compiled deep inside payload
// loading in the browser — "[nuxt] Error matching route rules. RangeError:
// Maximum call stack size exceeded". A plain Map lookup here is O(1) and keeps
// the generated route-rule matcher small.
//
// Single source of truth: app/redirects.json (seeded during the WP migration)
// + app/redirects.manual.mjs (curated). Keep in sync with build-htaccess.mjs.
import postRedirects from '~~/app/redirects.json'
import { manualRedirects } from '~~/app/redirects.manual.mjs'

// Manual page redirects win over the generated post redirects where they overlap.
const redirects: Record<string, string> = { ...postRedirects, ...manualRedirects }

export default defineEventHandler((event) => {
  // event.path carries the query string; match on the bare path with an
  // optional trailing slash (mirrors the .htaccess `/?$`).
  let path = event.path.split('?')[0]
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1)

  const to = redirects[path]
  if (to) return sendRedirect(event, to, 301)
})

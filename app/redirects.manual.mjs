// Hand-maintained 301 redirects: old WordPress URLs → new canonical paths.
//
// SINGLE SOURCE OF TRUTH for the page-level redirects. Consumed by:
//   • nuxt.config.ts  → routeRules (works in `nuxt dev`/`nuxt preview`, i.e. the Node server)
//   • scripts/build-htaccess.mjs → public/.htaccess (the *real* 301s on the static
//     IONOS/Apache host, where there is no Node server to honour routeRules)
//
// Keys are the old path (leading slash); values are the new path. All are 301.
// The 482 migrated news-post redirects live separately in app/redirects.json
// (seeded during the WP migration); these are the curated page/IA changes.
export const manualRedirects = {
  // Branch officers + reps were two separate WordPress pages; both now live on /branch.
  '/branch-officers': '/branch',
  '/branch-officers/branch-representatives': '/branch#representatives',
  '/branch-representatives': '/branch#representatives',

  // Legal pages now live under /legal/*.
  '/privacy-policy': '/legal/privacy-policy',
  '/about-us/privacy-policy': '/legal/privacy-policy',
  '/about-us/cookie-policy': '/legal/cookie-policy',
  '/legal-services': '/legal/legal-services',

  // Merged / pruned during the content review (URLs preserved as redirects).
  '/las-unison-branch-rules': '/branch-rules',
  '/stewards-directory': '/find-a-rep',
  '/application-for-course': '/education',

  // Stewards' zone rebuilt as a single rich hub: its two sub-pages are folded in.
  '/stewards-zone/free-software': '/stewards-zone#software',
  '/stewards-zone/stewards-hs-rep-resources': '/stewards-zone#downloads',

  // Contact is no longer a standalone page — the branch committee page carries
  // every officer's phone/email, so "contact the branch" now lands there.
  '/about-us/contact-us': '/branch',
  '/lasunison-net': '/branch',
  '/lasunison-com-e-mail': '/branch',

  // Subscription rates merged into the Join UNISON page (rates table + tax relief).
  '/subscription-rates': '/membership',

  // Old document-library + links pages are now folded into the Resources hub.
  '/documents': '/resources',
  '/document-database-new': '/resources',
  '/links-page': '/resources',
  '/links-page-2': '/resources',

  // Empty WordPress stubs that duplicate the new IA → their canonical home.
  '/home': '/',
  '/posts': '/news',
  '/about': '/about-us',

  // Bulletins are no longer a separate section — they live as documents in the
  // Resources library now, so the old hub + per-topic pages redirect there.
  '/bulletins': '/resources',
  '/bulletins-2': '/resources',
  '/general-bulletins': '/resources',
  '/education-bulletins': '/resources',
  '/equalities-bulletins': '/resources',
  '/health-safety-bulletins': '/resources',
  '/labour-link-bulletins': '/resources',
  '/membership-bulletins': '/resources',
  '/welfare-bulletins': '/resources',
  '/retired-members-bulletins': '/resources',
  '/sector-bulletins': '/resources',
  '/branch-chair-bulletins': '/resources',
  '/branch-secretary-bulletins': '/resources',
  '/other-bulletins': '/resources',
}

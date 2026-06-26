<script setup lang="ts">
// Site-wide SEO defaults. Per-page composables override these where needed.
const site = useSiteConfig()

useSeoMeta({
  // Branded fallback share image for any page that doesn't set its own.
  ogImage: new URL('/og-default.png', site.url).toString(),
  ogSiteName: 'LAS UNISON',
  twitterCard: 'summary_large_image',
})

// Organisation + website knowledge-graph for search engines. The branch is a
// trade-union organisation, not a LocalBusiness (the old Yoast LocalBusiness markup
// was a poor fit). Add the branch's social profiles to `sameAs` when confirmed.
useSchemaOrg([
  defineOrganization({
    name: 'London Ambulance Service UNISON Branch',
    alternateName: 'LAS UNISON',
    url: site.url,
    logo: '/favicon-512.png',
    // sameAs: ['https://twitter.com/…', 'https://facebook.com/…'], // TODO: confirm with branch
  }),
  defineWebSite({
    name: 'LAS UNISON',
    potentialAction: [defineSearchAction({ target: '/search?q={search_term_string}' })],
  }),
  defineWebPage(),
])
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtPage />
  <SiteSearchOverlay />
</template>

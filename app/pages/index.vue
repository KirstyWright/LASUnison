<script setup lang="ts">
// LAS UNISON — homepage. A branch hub composed from reusable kit components:
// help first, then news, current campaigns, why-join, the branch, and join.
useHead({
  title: 'LAS UNISON — London Ambulance Service UNISON Branch',
})
useSeoMeta({
  description:
    'The UK’s biggest ambulance branch. We represent, protect and stand up for London Ambulance Service staff — almost 7,000 members strong. Get help, read branch news and join UNISON.',
  ogTitle: 'LAS UNISON — London Ambulance Service UNISON Branch',
  ogDescription:
    'Stronger together for London’s ambulance staff. Representation, campaigns, member benefits and the UNISON Direct help line.',
  ogType: 'website',
})
</script>

<template>
  <div>
    <SiteHeader />

    <main id="main-content" tabindex="-1">
      <HomeHero />

      <!-- UNISON Direct — help first, overlapping the hero -->
      <div class="las-container relative z-[2] -mt-8">
        <UiEmergencyBar />
      </div>

      <HomeQuickHelp />
      <HomeNews />
      <HomeCampaigns />
      <HomeBenefits />
      <HomeBranch />
      <HomeJoin />
    </main>

    <SiteFooter />
  </div>
</template>

<script setup lang="ts">
// Final conversion. The branch's primary call to action.
const JOIN_URL = 'https://join.unison.org.uk'
</script>

<template>
  <section id="join" class="las-section">
    <div class="las-container">
      <div
        class="bg-[var(--brand-secondary)] rounded-[var(--radius-2xl)] relative overflow-hidden"
      >
        <!-- battenburg motif — the one place the hi-vis yellow is allowed -->
        <div
          class="h-4"
          :style="{
            backgroundImage: 'url(/battenburg-band.svg)',
            backgroundSize: 'auto 100%',
            backgroundRepeat: 'repeat-x',
          }"
          aria-hidden="true"
        />
        <div
          aria-hidden="true"
          class="absolute -right-16 -top-8 w-[280px] h-[280px] rounded-full bg-white/[0.07] pointer-events-none"
        />
        <div
          aria-hidden="true"
          class="absolute inset-0 opacity-[0.12] pointer-events-none"
          :style="{
            backgroundImage: 'url(/pattern-pulse.svg)',
            backgroundSize: '300px auto',
            backgroundRepeat: 'repeat-x',
            backgroundPosition: 'right bottom',
          }"
        />

        <div class="relative p-8 md:p-12 flex items-center justify-between gap-8 flex-wrap">
          <div class="max-w-[560px]">
            <h2
              class="font-[family-name:var(--font-display)] font-black text-[length:var(--text-4xl)] leading-[1.05] text-white m-0 tracking-[-0.02em]"
            >
              Add your voice. Join from
              <span class="font-[family-name:var(--font-mono)] font-semibold whitespace-nowrap">£1.30</span>
              a month.
            </h2>
            <p class="text-[length:var(--text-md)] leading-[1.55] text-white mt-3 mb-0">
              Strength in numbers isn't a slogan — it's how we win. The more of us there are, the louder
              our voice and the stronger your protection at work.
            </p>
          </div>
          <div class="flex flex-col items-start gap-3">
            <UiButton
              variant="highlight"
              size="lg"
              :href="JOIN_URL"
              icon-right="arrowRight"
            >Become a member</UiButton>
            <NuxtLink
              to="/update-your-details"
              class="text-white font-semibold text-[0.9375rem] underline decoration-white/40 hover:decoration-white underline-offset-4"
            >
              Already a member? Update your details →
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

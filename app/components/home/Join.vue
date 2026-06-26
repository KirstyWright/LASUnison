<script setup lang="ts">
// Final conversion. The branch's primary call to action.
const JOIN_URL = 'https://join.unison.org.uk'
</script>

<template>
  <section
    id="join"
    class="las-section"
  >
    <div class="las-container">
      <div
        class="relative overflow-hidden rounded-[var(--radius-2xl)] bg-[var(--brand-secondary)]"
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
          class="pointer-events-none absolute -top-8 -right-16 size-[280px] rounded-full bg-white/[0.07]"
        />
        <!-- Pulse, refined — sits quietly behind the CTA along the bottom hem -->
        <div
          aria-hidden="true"
          class="pointer-events-none absolute inset-x-0 bottom-0 text-white opacity-70"
        >
          <MotifPulse />
        </div>

        <div class="relative flex flex-wrap items-center justify-between gap-8 p-8 md:p-12">
          <div class="max-w-[560px]">
            <h2
              class="m-0 font-[family-name:var(--font-display)] text-[length:var(--text-4xl)] leading-[1.05] font-black tracking-[-0.02em] text-white"
            >
              Add your voice. Join from
              <span class="whitespace-nowrap">£1.30</span>
              a month.
            </h2>
            <p class="mt-3 mb-0 text-[length:var(--text-md)] leading-[1.55] text-white">
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
            >
              Become a member
            </UiButton>
            <NuxtLink
              to="/update-your-details"
              class="text-[0.9375rem] font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
            >
              Already a member? Update your details →
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Hero — "solidarity made visible". Editable copy lives here as plain data so
// it can migrate to a Content collection before connecting Studio.

// Hero slideshow — curated branch photographs. Editable content, kept as data so it
// can migrate to a Content collection before connecting Studio.
const SLIDES = [
  {
    src: '/images/hero/banners.jpg',
    alt: "London Ambulance Service UNISON members on the picket line holding the branch's purple-and-green banners aloft during the 2023 ambulance workers' strike.",
    caption: 'Ambulance strike, London · 2023',
    focus: 'center 40%',
  },
  {
    src: '/images/hero/picket.jpg',
    alt: "Ambulance workers on the picket line outside an LAS station holding ‘Fair Pay & Safe Staffing’ and ‘Support the Ambulance Workers’ placards, 2023.",
    caption: 'Fair pay picket line · 2023',
    focus: 'center 38%',
  },
  {
    src: '/images/hero/solidarity.jpg',
    alt: 'London Ambulance Service UNISON members standing together on the steps holding branch placards.',
    caption: 'London Ambulance UNISON members',
    focus: 'center 30%',
  },
]
</script>

<template>
  <section id="top" class="bg-[var(--surface-brand)] text-white relative overflow-hidden">
    <!-- Pulse, refined — live cardiac-monitor edge motif along the hero hem -->
    <div
      aria-hidden="true"
      class="absolute inset-x-0 bottom-0 text-[var(--brand-highlight)] pointer-events-none"
    >
      <MotifPulse />
    </div>
    <!-- top-edge highlight so the drenched hero doesn't read as a flat block -->
    <div
      aria-hidden="true"
      class="absolute inset-x-0 top-0 h-px bg-white/15"
    />

    <div
      class="las-container relative py-16 md:py-20 grid gap-12 lg:gap-14 items-center lg:grid-cols-[1.1fr_0.9fr]"
    >
      <div>
        <div class="mb-4 las-rise" style="animation-delay: 60ms">
          <UiEyebrow color="var(--brand-highlight)">UK's biggest ambulance branch</UiEyebrow>
        </div>
        <h1
          class="font-[family-name:var(--font-display)] font-black text-[length:var(--text-5xl)] leading-[1.04] tracking-[-0.02em] m-0 text-white las-rise"
          style="animation-delay: 120ms"
        >
          Stronger together for London's ambulance staff
        </h1>
        <p
          class="text-[length:var(--text-md)] leading-[1.6] text-[var(--purple-200)] mt-6 mb-8 max-w-[520px] las-rise"
          style="animation-delay: 200ms"
        >
          We represent, protect and stand up for the people who answer the
          call — every shift, day and night.
        </p>
        <div class="flex gap-3 flex-wrap las-rise" style="animation-delay: 280ms">
          <UiButton variant="highlight" size="lg" href="#join" icon-right="arrowRight">Join UNISON today</UiButton>
          <UiButton
            variant="outline-invert"
            size="lg"
            href="#campaigns"
          >Our campaigns</UiButton>
        </div>
        <p
          class="flex items-center gap-3 mt-11 m-0 las-rise"
          style="animation-delay: 360ms"
        >
          <span
            aria-hidden="true"
            class="grid place-items-center w-10 h-10 rounded-full bg-white/10 text-[var(--brand-highlight)] shrink-0"
          >
            <UiIcon name="shield" :size="22" :stroke="1.9" />
          </span>
          <span class="text-[length:var(--text-md)] font-semibold leading-snug text-white max-w-[360px]">
            The biggest union in the London Ambulance Service
          </span>
        </p>
      </div>

      <HomeHeroSlideshow
        :slides="SLIDES"
        class="las-rise"
        style="animation-delay: 220ms"
      />
    </div>
  </section>
</template>

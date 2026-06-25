<script setup lang="ts">
// Hero — "solidarity made visible". Editable copy lives here as plain data so
// it can migrate to a Content collection before connecting Studio.
const STATS = [
  { value: '7,000', label: 'LAS members' },
  { value: '£4M+', label: 'Won since 1999' },
  { value: '1.3M', label: 'UNISON members' },
] as const
</script>

<template>
  <section id="top" class="bg-[var(--surface-brand)] text-white relative overflow-hidden">
    <div
      aria-hidden="true"
      class="absolute inset-0 opacity-50 pointer-events-none"
      :style="{
        backgroundImage: 'url(/pattern-pulse.svg)',
        backgroundSize: '320px auto',
        backgroundRepeat: 'repeat-x',
        backgroundPosition: 'left bottom',
      }"
    />
    <!-- top-edge highlight so the drenched hero doesn't read as a flat block -->
    <div
      aria-hidden="true"
      class="absolute inset-x-0 top-0 h-px bg-white/15"
    />

    <div
      class="las-container relative py-16 md:py-20 grid gap-12 lg:gap-14 items-center lg:grid-cols-[1.1fr_0.9fr]"
    >
      <div>
        <div class="mb-[18px] las-rise" style="animation-delay: 60ms">
          <UiEyebrow color="var(--brand-highlight)">UK's biggest ambulance branch</UiEyebrow>
        </div>
        <h1
          class="font-[family-name:var(--font-display)] font-black text-[length:var(--text-6xl)] leading-none tracking-[-0.02em] m-0 text-white las-rise"
          style="animation-delay: 120ms"
        >
          Stronger together for London's ambulance staff
        </h1>
        <p
          class="text-[length:var(--text-md)] leading-[1.6] text-[var(--purple-200)] mt-[22px] mb-[30px] max-w-[520px] las-rise"
          style="animation-delay: 200ms"
        >
          Almost 7,000 members strong. We represent, protect and stand up for the people who answer the
          call — every shift, day and night.
        </p>
        <div class="flex gap-3 flex-wrap las-rise" style="animation-delay: 280ms">
          <UiButton variant="highlight" size="lg" href="#join" icon-right="arrowRight">Join UNISON today</UiButton>
          <UiButton
            variant="outline"
            size="lg"
            href="#campaigns"
            class="!text-white !border-white/40 hover:!bg-white/10"
          >Our campaigns</UiButton>
        </div>
        <dl class="flex gap-8 sm:gap-10 mt-11 flex-wrap las-rise" style="animation-delay: 360ms">
          <div v-for="s in STATS" :key="s.label" class="flex flex-col gap-1">
            <dt class="sr-only">{{ s.label }}</dt>
            <dd
              class="font-[family-name:var(--font-display)] font-black tracking-[-0.015em] leading-none text-[length:var(--text-5xl)] text-[var(--brand-highlight)] m-0"
            >{{ s.value }}</dd>
            <span class="text-[1rem] font-semibold text-white">{{ s.label }}</span>
          </div>
        </dl>
      </div>

      <figure class="relative m-0 las-rise" style="animation-delay: 220ms">
        <div
          class="rounded-[var(--radius-xl)] overflow-hidden shadow-[var(--shadow-xl)] border-4 border-white/[0.12] aspect-[4/5]"
        >
          <img
            src="/images/branch-solidarity.jpg"
            alt="London Ambulance Service UNISON members standing together with the branch's purple and green placards"
            width="1400"
            height="1200"
            class="w-full h-full object-cover object-[center_30%]"
            fetchpriority="high"
          >
          <!-- subtle purple wash anchors the photo to the drenched section -->
          <div
            aria-hidden="true"
            class="absolute inset-0 bg-gradient-to-t from-[var(--purple-950)]/45 via-transparent to-transparent"
          />
        </div>
        <figcaption
          class="absolute left-4 bottom-4 inline-flex items-center gap-2 bg-[var(--purple-950)]/70 backdrop-blur-sm text-white text-[0.75rem] font-bold tracking-[0.06em] uppercase rounded-[var(--radius-pill)] px-3 py-1.5"
        >
          <UiIcon name="mapPin" :size="13" :stroke="2.2" /> Members, London
        </figcaption>
      </figure>
    </div>
  </section>
</template>

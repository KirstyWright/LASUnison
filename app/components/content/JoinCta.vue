<script setup lang="ts">
/**
 * JoinCta — the page's primary conversion block (`::join-cta`). Three ways to
 * join, online first: a drenched-purple panel with a spark-green CTA, then phone
 * (number in IBM Plex Mono as a tel: link) and paper (PDF downloads + a pointer
 * to the member's local rep). Rooted in .las-embed; every visible label sits in a
 * child <span> so the `.las-prose a` reset can't recolour it. Values are props so
 * Studio can edit the join URL, phone number and form links.
 */
const props = withDefaults(
  defineProps<{
    joinUrl?: string
    phone?: string
    formUrl?: string
    leafletUrl?: string
    repUrl?: string
  }>(),
  {
    joinUrl: 'https://join.unison.org.uk/',
    phone: '0800 171 2193',
    formUrl: '/docs/mdocs/new%20unison%20join%20form%202018%20v2.pdf',
    leafletUrl: '/docs/2022/12/On-line-Catalogue221582.pdf',
    repUrl: '/find-a-rep',
  },
)

const NuxtLink = resolveComponent('NuxtLink')
const tel = computed(() => `tel:${props.phone.replace(/\s+/g, '')}`)
</script>

<template>
  <div class="las-embed flex flex-col gap-4">
    <!-- Online — the fastest path, given the most weight -->
    <div class="flex flex-col gap-4 rounded-[var(--radius-lg)] bg-[var(--surface-brand)] p-6 md:p-7">
      <div class="flex items-center gap-3">
        <span
          class="inline-flex h-6 flex-none items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--brand-highlight)] px-2.5"
        >
          <span class="font-[family-name:var(--font-sans)] text-[0.6875rem] font-bold tracking-[0.08em] text-[var(--ink-900)] uppercase">Fastest</span>
        </span>
        <span class="font-[family-name:var(--font-display)] text-[length:var(--text-xl)] leading-tight font-extrabold tracking-[-0.01em] text-white">Join online</span>
      </div>

      <p class="m-0 text-[0.9375rem] leading-[1.6] text-[var(--purple-100)]">
        It takes under 10 minutes. Have your bank sort code, account number and account-holder
        details ready before you start.
      </p>

      <UiButton
        variant="highlight"
        size="lg"
        :href="joinUrl"
        target="_blank"
        rel="noopener noreferrer"
        icon-right="arrowRight"
        class="w-fit"
      >
        Join online now<span class="sr-only"> (opens in a new tab)</span>
      </UiButton>
    </div>

    <!-- Phone and paper — the two alternatives, side by side -->
    <div class="grid gap-4 sm:grid-cols-2">
      <!-- By phone -->
      <div class="flex flex-col gap-2.5 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-sm)]">
        <span
          class="inline-flex size-10 flex-none items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]"
          aria-hidden="true"
        >
          <UiIcon
            name="phone"
            :size="20"
            :stroke="1.9"
          />
        </span>
        <span class="font-[family-name:var(--font-display)] text-[length:var(--text-md)] leading-tight font-extrabold text-[var(--text-strong)]">Join by phone</span>
        <a
          :href="tel"
          class="group inline-flex w-fit items-baseline gap-2"
        >
          <span class="font-[family-name:var(--font-mono)] text-[length:var(--text-xl)] font-semibold tracking-[-0.01em] text-[var(--text-strong)] transition-colors group-hover:text-[var(--brand-primary)]">{{ phone }}</span>
        </a>
        <span class="block text-[0.875rem] leading-[1.5] text-[var(--text-muted)]">Freephone, and you're a member straight away.</span>
      </div>

      <!-- On paper -->
      <div class="flex flex-col gap-2.5 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-sm)]">
        <span
          class="inline-flex size-10 flex-none items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand-secondary-soft)] text-[var(--brand-secondary)]"
          aria-hidden="true"
        >
          <UiIcon
            name="file"
            :size="20"
            :stroke="1.9"
          />
        </span>
        <span class="font-[family-name:var(--font-display)] text-[length:var(--text-md)] leading-tight font-extrabold text-[var(--text-strong)]">Prefer paper?</span>
        <span class="block text-[0.875rem] leading-[1.5] text-[var(--text-muted)]">Pay straight from your salary. Download a form, or ask your local rep for one.</span>
        <div class="mt-0.5 flex flex-col gap-1.5">
          <a
            :href="formUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="group inline-flex w-fit items-center gap-1.5"
          >
            <UiIcon
              name="download"
              :size="16"
              :stroke="2"
              class="flex-none text-[var(--brand-primary)]"
            />
            <span class="text-[0.875rem] font-semibold text-[var(--brand-primary)] transition-colors group-hover:text-[var(--brand-primary-strong)]">Application form (PDF)</span>
            <span class="sr-only"> (opens in a new tab)</span>
          </a>
          <a
            :href="leafletUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="group inline-flex w-fit items-center gap-1.5"
          >
            <UiIcon
              name="download"
              :size="16"
              :stroke="2"
              class="flex-none text-[var(--brand-primary)]"
            />
            <span class="text-[0.875rem] font-semibold text-[var(--brand-primary)] transition-colors group-hover:text-[var(--brand-primary-strong)]">Recruitment leaflet (PDF)</span>
            <span class="sr-only"> (opens in a new tab)</span>
          </a>
          <component
            :is="NuxtLink"
            :to="repUrl"
            class="group inline-flex w-fit items-center gap-1.5"
          >
            <UiIcon
              name="mapPin"
              :size="16"
              :stroke="2"
              class="flex-none text-[var(--brand-primary)]"
            />
            <span class="text-[0.875rem] font-semibold text-[var(--brand-primary)] transition-colors group-hover:text-[var(--brand-primary-strong)]">Find your local rep</span>
          </component>
        </div>
      </div>
    </div>
  </div>
</template>

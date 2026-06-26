<script setup lang="ts">
// A foot-of-page byline: the branch officer responsible for this area, credited
// as the page's "author" with a way to reach them. A horizontal band (photo +
// identity + contact) on the soft brand wash — deliberately distinct from the
// portrait grid cards on /branch, so it reads as attribution, not a directory.
// Driven by the page's `officer` frontmatter (see [...slug].vue); contact fields
// are optional, so it copes with email-only or phone-only officers.
const props = withDefaults(
  defineProps<{
    name: string
    role: string
    workplace?: string
    phone?: string
    email?: string
    photo?: string
    // The small label above the name. Defaults to a generic officer byline.
    eyebrow?: string
  }>(),
  { eyebrow: 'Your branch officer' },
)

const initials = computed(() =>
  props.name
    .split(/\s+/)
    .map(n => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase(),
)

const firstName = computed(() => props.name.split(/\s+/)[0])
const tel = computed(() => props.phone?.replace(/\s+/g, '') ?? '')
</script>

<template>
  <aside
    :aria-label="`${eyebrow}: ${name}, ${role}`"
    class="flex flex-col sm:flex-row gap-5 sm:gap-6 p-5 sm:p-6 rounded-[var(--radius-xl)] bg-[var(--surface-brand-soft)] border border-[var(--purple-100)] shadow-[var(--shadow-sm)]"
  >
    <!-- Portrait -->
    <div class="flex-none">
      <div
        class="relative w-20 h-20 sm:w-[104px] sm:h-[104px] rounded-[var(--radius-lg)] overflow-hidden bg-[var(--surface-sunken)] shadow-[var(--shadow-sm)]"
      >
        <img
          v-if="photo"
          :src="photo"
          :alt="`${name} — ${role}`"
          width="208"
          height="208"
          loading="lazy"
          decoding="async"
          class="w-full h-full object-cover object-[center_top]"
        >
        <div
          v-else
          class="w-full h-full flex items-center justify-center"
          style="background: linear-gradient(150deg, var(--purple-600), var(--purple-800))"
          aria-hidden="true"
        >
          <span class="font-[family-name:var(--font-display)] font-black text-[1.75rem] leading-none text-white/90">
            {{ initials }}
          </span>
        </div>
        <!-- accent keyline -->
        <span class="absolute inset-x-0 bottom-0 h-1 bg-[var(--brand-primary)]" aria-hidden="true" />
      </div>
    </div>

    <!-- Identity + contact -->
    <div class="flex flex-col min-w-0">
      <UiEyebrow>{{ eyebrow }}</UiEyebrow>
      <p
        class="font-[family-name:var(--font-display)] font-extrabold text-[length:var(--text-xl)] leading-[1.15] tracking-[-0.015em] text-[var(--text-strong)] mt-1.5 mb-0"
      >
        {{ name }}
      </p>
      <p class="font-bold text-[length:var(--text-base)] text-[var(--brand-primary)] mt-0.5 mb-0">
        {{ role }}
      </p>

      <p
        v-if="workplace"
        class="flex items-center gap-1.5 text-[0.875rem] leading-[1.35] text-[var(--text-muted)] mt-2 mb-0"
      >
        <UiIcon name="mapPin" :size="15" :stroke="2" class="text-[var(--text-subtle)] flex-none" />
        {{ workplace }}
      </p>

      <!-- Contact — officers may carry a phone, an email, or both. -->
      <div v-if="phone || email" class="flex flex-wrap gap-2.5 mt-4">
        <UiButton v-if="phone" :href="`tel:${tel}`" variant="primary" size="sm" icon-left="phone">
          {{ phone }}
        </UiButton>
        <UiButton v-if="email" :href="`mailto:${email}`" variant="outline" size="sm" icon-left="mail">
          Email {{ firstName }}
        </UiButton>
      </div>
    </div>
  </aside>
</template>

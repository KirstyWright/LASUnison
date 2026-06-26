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
    class="flex flex-col gap-5 rounded-[var(--radius-xl)] border border-[var(--purple-100)] bg-[var(--surface-brand-soft)] p-5 shadow-[var(--shadow-sm)] sm:flex-row sm:gap-6 sm:p-6"
  >
    <!-- Portrait -->
    <div class="flex-none">
      <div
        class="relative size-20 overflow-hidden rounded-[var(--radius-lg)] bg-[var(--surface-sunken)] shadow-[var(--shadow-sm)] sm:size-[104px]"
      >
        <img
          v-if="photo"
          :src="photo"
          :alt="`${name} — ${role}`"
          width="208"
          height="208"
          loading="lazy"
          decoding="async"
          class="size-full object-cover object-[center_top]"
        >
        <div
          v-else
          class="flex size-full items-center justify-center"
          style="background: linear-gradient(150deg, var(--purple-600), var(--purple-800))"
          aria-hidden="true"
        >
          <span class="font-[family-name:var(--font-display)] text-[1.75rem] leading-none font-black text-white/90">
            {{ initials }}
          </span>
        </div>
        <!-- accent keyline -->
        <span
          class="absolute inset-x-0 bottom-0 h-1 bg-[var(--brand-primary)]"
          aria-hidden="true"
        />
      </div>
    </div>

    <!-- Identity + contact -->
    <div class="flex min-w-0 flex-col">
      <UiEyebrow>{{ eyebrow }}</UiEyebrow>
      <p
        class="mt-1.5 mb-0 font-[family-name:var(--font-display)] text-[length:var(--text-xl)] leading-[1.15] font-extrabold tracking-[-0.015em] text-[var(--text-strong)]"
      >
        {{ name }}
      </p>
      <p class="mt-0.5 mb-0 text-[length:var(--text-base)] font-bold text-[var(--brand-primary)]">
        {{ role }}
      </p>

      <p
        v-if="workplace"
        class="mt-2 mb-0 flex items-center gap-1.5 text-[0.875rem] leading-[1.35] text-[var(--text-muted)]"
      >
        <UiIcon
          name="mapPin"
          :size="15"
          :stroke="2"
          class="flex-none text-[var(--text-subtle)]"
        />
        {{ workplace }}
      </p>

      <!-- Contact — officers may carry a phone, an email, or both. -->
      <div
        v-if="phone || email"
        class="mt-4 flex flex-wrap gap-2.5"
      >
        <UiButton
          v-if="phone"
          :href="`tel:${tel}`"
          variant="primary"
          size="sm"
          icon-left="phone"
        >
          <span class="font-[family-name:var(--font-mono)]">{{ phone }}</span>
        </UiButton>
        <UiButton
          v-if="email"
          :href="`mailto:${email}`"
          variant="outline"
          size="sm"
          icon-left="mail"
        >
          Email {{ firstName }}
        </UiButton>
      </div>
    </div>
  </aside>
</template>

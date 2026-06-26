<script setup lang="ts">
// One committee member: photo (or initials), name, role and — for officers —
// the ways to reach them. Used on /branch for both officers and branch reps.
const props = withDefaults(
  defineProps<{
    name: string
    role: string
    workplace?: string
    phone?: string
    email?: string
    photo?: string
    accent?: 'purple' | 'green'
  }>(),
  { accent: 'purple' },
)

const initials = computed(() =>
  props.name
    .replace(/\([^)]*\)/g, ' ')
    .split(/\s+/)
    .map(n => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase(),
)

const tel = computed(() => props.phone?.replace(/\s+/g, '') ?? '')

const accentVar = computed(() =>
  props.accent === 'green' ? 'var(--brand-secondary)' : 'var(--brand-primary)',
)
const fallbackBg = computed(() =>
  props.accent === 'green'
    ? 'linear-gradient(150deg, var(--green-600), var(--green-800))'
    : 'linear-gradient(150deg, var(--purple-600), var(--purple-800))',
)
</script>

<template>
  <article
    class="group/card flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[var(--shadow-sm)] transition-[box-shadow,transform,border-color] duration-200 ease-out hover:translate-y-[-3px] hover:border-[var(--border-default)] hover:shadow-[var(--shadow-lg)]"
  >
    <!-- Portrait -->
    <div class="relative aspect-[4/5] overflow-hidden bg-[var(--surface-sunken)]">
      <img
        v-if="photo"
        :src="photo"
        :alt="`${name} — ${role}`"
        width="560"
        height="700"
        loading="lazy"
        decoding="async"
        class="size-full object-cover object-[center_top] transition-transform duration-150 ease-out group-hover/card:scale-[1.03]"
      >
      <div
        v-else
        class="flex size-full items-center justify-center"
        :style="{ background: fallbackBg }"
        aria-hidden="true"
      >
        <span class="font-[family-name:var(--font-display)] text-[2.5rem] leading-none font-black tracking-[-0.02em] text-white/90">
          {{ initials }}
        </span>
      </div>
      <!-- accent keyline anchoring the photo to the card body -->
      <span
        class="absolute inset-x-0 bottom-0 h-1"
        :style="{ background: accentVar }"
        aria-hidden="true"
      />
    </div>

    <!-- Body -->
    <div class="flex flex-1 flex-col p-4">
      <h3 class="m-0 font-[family-name:var(--font-display)] text-[1.0625rem] leading-[1.2] font-extrabold tracking-[-0.01em] text-[var(--text-strong)]">
        {{ name }}
      </h3>
      <p
        class="mt-1 mb-0 font-[family-name:var(--font-sans)] text-[0.8125rem] leading-[1.3] font-bold"
        :style="{ color: accentVar }"
      >
        {{ role }}
      </p>

      <p
        v-if="workplace"
        class="mt-2.5 mb-0 flex items-start gap-1.5 text-[0.8125rem] leading-[1.35] text-[var(--text-muted)]"
      >
        <UiIcon
          name="mapPin"
          :size="14"
          :stroke="2"
          class="mt-px flex-none text-[var(--text-subtle)]"
        />
        <span>{{ workplace }}</span>
      </p>

      <!-- Contact (officers carry phone/email; reps are reached via Find a rep) -->
      <div
        v-if="phone || email"
        class="mt-3 flex flex-col gap-1.5 border-t border-[var(--border-subtle)] pt-3"
      >
        <a
          v-if="phone"
          :href="`tel:${tel}`"
          class="group/link flex items-center gap-2 font-[family-name:var(--font-mono)] text-[0.8125rem] font-medium text-[var(--text-body)] no-underline hover:text-[var(--brand-primary)]"
        >
          <UiIcon
            name="phone"
            :size="14"
            :stroke="2"
            class="flex-none text-[var(--text-subtle)] group-hover/link:text-[var(--brand-primary)]"
          />
          {{ phone }}
        </a>
        <a
          v-if="email"
          :href="`mailto:${email}`"
          class="group/link flex min-w-0 items-center gap-2 text-[0.8125rem] text-[var(--text-body)] no-underline hover:text-[var(--brand-primary)]"
        >
          <UiIcon
            name="mail"
            :size="14"
            :stroke="2"
            class="flex-none text-[var(--text-subtle)] group-hover/link:text-[var(--brand-primary)]"
          />
          <span
            class="truncate"
            :title="email"
          >{{ email }}</span>
        </a>
      </div>
    </div>
  </article>
</template>

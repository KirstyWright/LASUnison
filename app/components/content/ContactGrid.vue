<script setup lang="ts">
/**
 * ContactGrid — "ways to get in touch", a responsive grid of icon-chip link
 * cards for content (`::contact-grid`). Defaults cover the branch's main routes;
 * pass `items` to override. Follows the home/QuickHelp + resources/QuickLink
 * idiom. Rooted in .las-embed; card titles/bodies are <span>s so the prose link
 * reset can't recolour them.
 */
type Tone = 'primary' | 'secondary' | 'accent' | 'amber'
interface ContactItem { icon: string, title: string, body: string, href: string, tone: Tone }

withDefaults(
  defineProps<{ items?: ContactItem[] }>(),
  {
    items: () => [
      { icon: 'mapPin', title: 'Find your rep', body: 'Search your station or workplace for its UNISON rep.', href: '/find-a-rep', tone: 'primary' },
      { icon: 'users', title: 'Branch officers & reps', body: 'Names, roles and direct contact details for the committee.', href: '/branch', tone: 'secondary' },
      { icon: 'userPlus', title: 'Update your details', body: 'Moved, transferred or changed hours? Tell the branch.', href: '/update-your-details', tone: 'accent' },
      { icon: 'lifebuoy', title: 'Website problems', body: 'Something not working on this site? Email the webmaster.', href: 'mailto:webmaster@lasunison.com', tone: 'amber' },
    ],
  },
)

const NuxtLink = resolveComponent('NuxtLink')
const isInternal = (h: string) => h.startsWith('/')
const isMail = (h: string) => h.startsWith('mailto:')
const isExternal = (h: string) => !isInternal(h) && !isMail(h)

function bind(h: string) {
  if (isInternal(h)) return { is: NuxtLink, to: h }
  if (isMail(h)) return { is: 'a', href: h }
  return { is: 'a', href: h, target: '_blank', rel: 'noopener noreferrer' }
}

const TONES: Record<Tone, string> = {
  primary: 'bg-[var(--brand-primary-soft)] text-[var(--brand-primary)]',
  secondary: 'bg-[var(--brand-secondary-soft)] text-[var(--brand-secondary)]',
  accent: 'bg-[var(--brand-accent-soft)] text-[var(--brand-accent)]',
  amber: 'bg-[var(--warning-soft)] text-[var(--amber-600)]',
}
</script>

<template>
  <div class="las-embed grid gap-4 sm:grid-cols-2">
    <component
      :is="bind(item.href).is"
      v-for="item in items"
      :key="item.title"
      v-bind="bind(item.href)"
      class="group relative flex flex-col gap-2 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 no-underline shadow-[var(--shadow-sm)] transition-[transform,box-shadow,border-color] duration-200 ease-out hover:translate-y-[-3px] hover:border-[var(--border-default)] hover:shadow-[var(--shadow-lg)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
    >
      <span
        class="absolute top-4 right-4 text-[var(--text-subtle)] transition-colors duration-150 group-hover:text-[var(--brand-primary)]"
        aria-hidden="true"
      >
        <UiIcon
          :name="isExternal(item.href) ? 'arrowUpRight' : 'arrowRight'"
          :size="18"
          :stroke="2"
        />
      </span>

      <span
        class="inline-flex size-11 items-center justify-center rounded-[var(--radius-md)]"
        :class="TONES[item.tone]"
        aria-hidden="true"
      >
        <UiIcon
          :name="item.icon"
          :size="22"
          :stroke="1.9"
        />
      </span>

      <span
        class="mt-1 block pr-6 font-[family-name:var(--font-display)] text-[length:var(--text-lg)] leading-tight font-extrabold tracking-[-0.01em] text-[var(--text-strong)] transition-colors group-hover:text-[var(--brand-primary)]"
      >{{ item.title }}</span>
      <span class="block text-[0.9375rem] leading-[1.55] text-[var(--text-muted)]">{{ item.body }}</span>

      <span
        v-if="isExternal(item.href)"
        class="sr-only"
      > (opens in a new tab)</span>
    </component>
  </div>
</template>

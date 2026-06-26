<script setup lang="ts">
/**
 * UiPagination — accessible, URL-driven pager.
 *
 * Every control is a real <NuxtLink> with a shareable, crawlable URL, so
 * paginated lists stay reachable by crawlers and on-site search. The page lives
 * in a query param (default ?page=N) and all other query params on the current
 * route are preserved; page 1 omits the param so the first page's URL stays
 * canonical. The active page renders as a non-link <span aria-current="page">.
 *
 * Numbers are windowed (first, last, current ±1) with "…" gaps once there are
 * more than 7 pages, so the control stays compact on long archives.
 */
const props = withDefaults(
  defineProps<{
    currentPage: number
    totalPages: number
    /** Query param the page number lives in. */
    queryKey?: string
    /** aria-label for the surrounding <nav>. */
    label?: string
  }>(),
  { queryKey: 'page', label: 'Pagination' },
)

const route = useRoute()

function linkTo(page: number) {
  const query = { ...route.query }
  if (page <= 1) delete query[props.queryKey]
  else query[props.queryKey] = String(page)
  return { path: route.path, query }
}

// First, last, current and its neighbours — with numeric gaps marked "…".
const items = computed<(number | '…')[]>(() => {
  const total = props.totalPages
  const cur = props.currentPage
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const wanted = [1, 2, total - 1, total, cur - 1, cur, cur + 1]
  const pages = [...new Set(wanted)].filter(p => p >= 1 && p <= total).sort((a, b) => a - b)
  const out: (number | '…')[] = []
  let prev = 0
  for (const p of pages) {
    if (p - prev > 1) out.push('…')
    out.push(p)
    prev = p
  }
  return out
})

const hasPrev = computed(() => props.currentPage > 1)
const hasNext = computed(() => props.currentPage < props.totalPages)

const STEP =
  'inline-flex items-center gap-1.5 h-11 px-3.5 rounded-[var(--radius-pill)] font-bold text-[0.875rem] leading-none border-2 transition-colors duration-150 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]'
const STEP_ON =
  'bg-[var(--surface-card)] border-[var(--border-default)] text-[var(--text-body)] no-underline hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]'
const STEP_OFF =
  'bg-transparent border-[var(--border-subtle)] text-[var(--text-subtle)] cursor-not-allowed'

const NUM =
  'inline-flex items-center justify-center min-w-11 h-11 px-2 rounded-[var(--radius-md)] font-bold text-[0.875rem] tabular-nums leading-none border-2 transition-colors duration-150 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]'
const NUM_IDLE =
  'bg-[var(--surface-card)] border-[var(--border-default)] text-[var(--text-body)] no-underline hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]'
const NUM_ACTIVE =
  'bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white'
</script>

<!--
  Links use NuxtLink in `custom` mode (we render our own <a>). Vue Router's
  active-state matching ignores query params, so a plain <NuxtLink> would mark
  every same-path page link as exact-active and auto-add aria-current="page" to
  all of them. Owning the <a> lets us put aria-current only on the real current
  page, while keeping crawlable hrefs and SPA navigation (`navigate` still
  guards modifier-clicks, so ⌘/middle-click open a new tab).
-->
<template>
  <nav v-if="totalPages > 1" :aria-label="label" class="flex items-center justify-center gap-1.5 flex-wrap">
    <!-- Previous -->
    <NuxtLink v-if="hasPrev" :to="linkTo(currentPage - 1)" custom v-slot="{ href, navigate }">
      <a :href="href" rel="prev" :class="[STEP, STEP_ON]" @click="navigate">
        <UiIcon name="arrowLeft" :size="16" :stroke="2.2" />
        <span class="max-sm:sr-only">Previous</span>
      </a>
    </NuxtLink>
    <span v-else :class="[STEP, STEP_OFF]" aria-hidden="true">
      <UiIcon name="arrowLeft" :size="16" :stroke="2.2" />
      <span class="max-sm:sr-only">Previous</span>
    </span>

    <!-- Page numbers -->
    <ul class="flex items-center gap-1.5 list-none p-0 m-0">
      <li v-for="(item, i) in items" :key="`${item}-${i}`">
        <span
          v-if="item === '…'"
          class="inline-flex items-center justify-center min-w-8 h-10 text-[var(--text-subtle)] select-none"
          aria-hidden="true"
        >…</span>
        <span
          v-else-if="item === currentPage"
          :class="[NUM, NUM_ACTIVE]"
          aria-current="page"
        >{{ item }}</span>
        <NuxtLink v-else :to="linkTo(item)" custom v-slot="{ href, navigate }">
          <a :href="href" :class="[NUM, NUM_IDLE]" :aria-label="`Go to page ${item}`" @click="navigate">{{ item }}</a>
        </NuxtLink>
      </li>
    </ul>

    <!-- Next -->
    <NuxtLink v-if="hasNext" :to="linkTo(currentPage + 1)" custom v-slot="{ href, navigate }">
      <a :href="href" rel="next" :class="[STEP, STEP_ON]" @click="navigate">
        <span class="max-sm:sr-only">Next</span>
        <UiIcon name="arrowRight" :size="16" :stroke="2.2" />
      </a>
    </NuxtLink>
    <span v-else :class="[STEP, STEP_OFF]" aria-hidden="true">
      <span class="max-sm:sr-only">Next</span>
      <UiIcon name="arrowRight" :size="16" :stroke="2.2" />
    </span>
  </nav>
</template>

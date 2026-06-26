<script setup lang="ts">
/**
 * ResourcesDocLibrary — browse view for the document library. Topic chips and
 * a year dropdown are the facets; the list is date-descending and paginated
 * ("show more"). Free-text search is handled by the hub above, not here.
 */
import type { SiteDocument } from '~/utils/resources'

const props = defineProps<{ docs: SiteDocument[] }>()

const PAGE = 24
const q = ref('')
const topic = ref('All')
const year = ref('All')
const visible = ref(PAGE)

const terms = computed(() => q.value.toLowerCase().split(/\s+/).filter(Boolean))

// Topics present, most-populated first — drives the chip row.
const topics = computed(() => {
  const counts: Record<string, number> = {}
  for (const d of props.docs) counts[d.topic] = (counts[d.topic] ?? 0) + 1
  const present = Object.entries(counts).sort((a, b) => b[1] - a[1])
  return [{ label: 'All', count: props.docs.length }, ...present.map(([label, count]) => ({ label, count }))]
})

const years = computed(() => {
  const set = new Set(props.docs.map(d => docYear(d.date)))
  return [...set].sort((a, b) => b - a)
})

const filtered = computed(() =>
  props.docs.filter((d) => {
    if (topic.value !== 'All' && d.topic !== topic.value) return false
    if (year.value !== 'All' && String(docYear(d.date)) !== year.value) return false
    if (terms.value.length) {
      const hay = `${d.title} ${d.topic}`.toLowerCase()
      if (!terms.value.every(t => hay.includes(t))) return false
    }
    return true
  }),
)

const shown = computed(() => filtered.value.slice(0, visible.value))
const remaining = computed(() => Math.max(0, filtered.value.length - shown.value.length))

const hasFilters = computed(() => topic.value !== 'All' || year.value !== 'All' || !!q.value)

// Reset pagination whenever the facets or query change.
watch([topic, year, q], () => { visible.value = PAGE })

function clearFilters() {
  q.value = ''
  topic.value = 'All'
  year.value = 'All'
}

const countLabel = computed(() => {
  const n = filtered.value.length
  return `${n} document${n === 1 ? '' : 's'}`
})

const CHIP_BASE
  = 'inline-flex items-center gap-2 font-[family-name:var(--font-sans)] font-bold text-[0.875rem] leading-none px-3.5 h-9 rounded-full border-2 cursor-pointer whitespace-nowrap transition-colors duration-150 ease-out focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]'
const CHIP_ACTIVE = 'bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white'
const CHIP_IDLE
  = 'bg-[var(--surface-card)] border-[var(--border-default)] text-[var(--text-body)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]'
</script>

<template>
  <div>
    <!-- Facets -->
    <div class="mb-6 flex flex-col gap-4">
      <!-- Text search within the library -->
      <div
        role="search"
        class="relative w-full max-w-[460px]"
      >
        <label
          for="doc-search"
          class="sr-only"
        >Search documents by title</label>
        <span
          class="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[var(--text-subtle)]"
          aria-hidden="true"
        >
          <UiIcon
            name="search"
            :size="20"
            :stroke="2"
          />
        </span>
        <input
          id="doc-search"
          v-model="q"
          type="search"
          enterkeyhint="search"
          autocomplete="off"
          placeholder="Search documents by title…"
          class="h-11 w-full rounded-[var(--radius-md)] border-2 border-[var(--border-default)] bg-[var(--surface-card)] px-11 text-[length:var(--text-base)] text-[var(--text-strong)] placeholder:text-[var(--text-subtle)] focus:outline-none focus-visible:border-[var(--border-focus)] [&::-webkit-search-cancel-button]:appearance-none"
        >
        <button
          v-show="q"
          type="button"
          aria-label="Clear document search"
          class="absolute top-1/2 right-2 inline-flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-none bg-[var(--surface-sunken)] text-[var(--text-muted)] hover:bg-[var(--brand-primary-soft)] hover:text-[var(--brand-primary)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
          @click="q = ''"
        >
          <UiIcon
            name="x"
            :size="16"
            :stroke="2.2"
          />
        </button>
      </div>

      <div
        role="group"
        aria-label="Filter documents by topic"
        class="flex flex-wrap gap-2"
      >
        <button
          v-for="t in topics"
          :key="t.label"
          type="button"
          :aria-pressed="topic === t.label"
          :class="[CHIP_BASE, topic === t.label ? CHIP_ACTIVE : CHIP_IDLE]"
          @click="topic = t.label"
        >
          {{ t.label }}
          <span
            class="font-[family-name:var(--font-mono)] text-[0.7rem] font-medium tabular-nums"
            :class="topic === t.label ? 'text-white/70' : 'text-[var(--text-subtle)]'"
          >{{ t.count }}</span>
        </button>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="relative">
            <label
              for="doc-year"
              class="sr-only"
            >Filter by year</label>
            <select
              id="doc-year"
              v-model="year"
              class="h-10 cursor-pointer appearance-none rounded-[var(--radius-md)] border-2 border-[var(--border-default)] bg-[var(--surface-card)] pr-9 pl-3.5 text-[0.875rem] font-bold text-[var(--text-body)] hover:border-[var(--brand-primary)] focus-visible:border-[var(--border-focus)] focus-visible:ring-[3px] focus-visible:ring-[var(--border-focus)] focus-visible:outline-none"
            >
              <option value="All">
                All years
              </option>
              <option
                v-for="y in years"
                :key="y"
                :value="String(y)"
              >
                {{ y }}
              </option>
            </select>
            <UiIcon
              name="chevronDown"
              :size="16"
              :stroke="2.2"
              class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[var(--text-muted)]"
            />
          </div>
          <button
            v-if="hasFilters"
            type="button"
            class="cursor-pointer rounded-[2px] border-none bg-transparent px-1 text-[0.875rem] font-bold text-[var(--text-link)] hover:text-[var(--text-link-hover)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
            @click="clearFilters"
          >
            Clear filters
          </button>
        </div>
        <p
          class="m-0 font-[family-name:var(--font-mono)] text-[0.8125rem] text-[var(--text-muted)] tabular-nums"
          aria-live="polite"
        >
          {{ countLabel }}
        </p>
      </div>
    </div>

    <!-- List -->
    <ul
      v-if="shown.length"
      class="m-0 grid list-none gap-1.5 p-0 sm:gap-2"
    >
      <li
        v-for="d in shown"
        :key="d.file"
      >
        <ResourcesDocRow :doc="d" />
      </li>
    </ul>

    <!-- Empty -->
    <div
      v-else
      class="rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] px-6 py-14 text-center"
    >
      <p class="m-0 mb-2 font-[family-name:var(--font-display)] text-[1.375rem] font-extrabold text-[var(--text-strong)]">
        No documents match
      </p>
      <p class="m-0 mb-5 text-[var(--text-muted)]">
        Try a different search, topic or year.
      </p>
      <UiButton
        variant="outline"
        size="sm"
        @click="clearFilters"
      >
        Clear filters
      </UiButton>
    </div>

    <!-- Pagination -->
    <div
      v-if="remaining > 0"
      class="mt-8 flex justify-center"
    >
      <UiButton
        variant="outline"
        icon-right="chevronDown"
        @click="visible += PAGE"
      >
        Show more ({{ remaining }} left)
      </UiButton>
    </div>
  </div>
</template>

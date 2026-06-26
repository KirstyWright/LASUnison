<script setup lang="ts">
import type { Sector } from '~/data/sectors'

interface Rep {
  name: string
  note?: string
}
interface StationRecord {
  slug: string
  name: string
  area?: string
  type?: string
  reps?: Rep[]
  hsReps?: Rep[]
}

const props = defineProps<{
  sector: Sector
  stations: StationRecord[]
  seniorReps: Rep[]
  highlightedStation?: string | null
}>()

const open = ref(true)

// Group stations by sub-area, preserving the order they arrive in (already sorted
// by the page). Stations without an area collapse into a single unlabelled group.
const areaGroups = computed(() => {
  const groups = new Map<string, StationRecord[]>()
  for (const s of props.stations) {
    const key = s.area ?? ''
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(s)
  }
  return [...groups.entries()].map(([area, stations]) => ({ area, stations }))
})
</script>

<template>
  <section class="border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden bg-[var(--surface-card)] shadow-[var(--shadow-sm)]">
    <!-- Sector header -->
    <button
      type="button"
      class="w-full flex items-center gap-4 px-6 py-5 text-left bg-[var(--surface-brand-soft)] hover:bg-[var(--brand-primary-soft)] transition-colors duration-150 cursor-pointer border-none"
      :aria-expanded="open"
      @click="open = !open"
    >
      <div class="w-2 h-8 rounded-full bg-[var(--brand-primary)] flex-none" aria-hidden="true" />
      <div class="flex-1 min-w-0">
        <h2 class="font-[family-name:var(--font-display)] font-black text-[1.375rem] leading-[1.1] tracking-[-0.02em] text-[var(--text-strong)] m-0">
          {{ sector.name }}
        </h2>
        <p v-if="sector.description" class="text-[0.8125rem] text-[var(--text-muted)] m-0 mt-0.5 truncate hidden md:block">
          {{ sector.description }}
        </p>
      </div>
      <div class="flex items-center gap-3 flex-none">
        <span class="text-[0.8125rem] font-[family-name:var(--font-mono)] text-[var(--text-muted)]">
          {{ stations.length }} workplace{{ stations.length === 1 ? '' : 's' }}
        </span>
        <UiIcon
          name="chevronDown"
          :size="20"
          :stroke="2.2"
          class="text-[var(--text-muted)] transition-transform duration-200"
          :class="open ? 'rotate-180' : ''"
        />
      </div>
    </button>

    <!-- Sector body -->
    <Transition
      enter-active-class="transition-[max-height,opacity] duration-300 ease-out overflow-hidden"
      leave-active-class="transition-[max-height,opacity] duration-200 ease-in overflow-hidden"
      enter-from-class="max-h-0 opacity-0"
      enter-to-class="max-h-[9999px] opacity-100"
      leave-from-class="max-h-[9999px] opacity-100"
      leave-to-class="max-h-0 opacity-0"
    >
      <div v-show="open" class="px-6 pb-6">
        <!-- Senior rep(s) — omitted for sectors without one (e.g. Other workplaces) -->
        <div v-if="seniorReps.length" class="pt-5 pb-5 border-b border-[var(--border-subtle)] mb-5">
          <p class="text-[0.75rem] font-bold tracking-[0.08em] uppercase text-[var(--brand-secondary)] mb-4">
            {{ seniorReps.length > 1 ? 'Sector Senior Reps' : 'Sector Senior Rep' }}
          </p>
          <div class="grid sm:grid-cols-2 gap-x-6 gap-y-4">
            <RepsRepPerson
              v-for="rep in seniorReps"
              :key="`snr-${rep.name}`"
              :name="rep.name"
              :note="rep.note"
              senior
            />
          </div>
        </div>

        <!-- Stations, grouped by sub-area where present -->
        <div class="flex flex-col gap-4">
          <div v-for="group in areaGroups" :key="group.area || 'flat'">
            <p
              v-if="group.area"
              class="text-[0.75rem] font-bold tracking-[0.08em] uppercase text-[var(--text-muted)] mb-1 mt-1"
            >
              {{ group.area }}
            </p>
            <div class="divide-y divide-[var(--border-subtle)]">
              <RepsStationRow
                v-for="station in group.stations"
                :key="station.slug"
                :station="station"
                :highlighted="highlightedStation === station.slug"
              />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </section>
</template>

<script setup lang="ts">
interface Rep {
  name: string
  note?: string
}
interface StationRecord {
  slug: string
  name: string
  type?: string
  reps?: Rep[]
  hsReps?: Rep[]
}

defineProps<{
  station: StationRecord
  highlighted?: boolean
}>()

const TYPE_LABELS: Record<string, string> = {
  'ambulance-station': 'Ambulance station',
  'control-room': 'Control room',
  'headquarters': 'Headquarters',
  'specialist': 'Specialist',
  'nets': 'NETS',
  'workshop': 'Workshop',
  'logistics': 'Logistics',
  'education': 'Education',
  'support': 'Support',
}
</script>

<template>
  <div
    :id="`station-${station.slug}`"
    class="rounded-[var(--radius-lg)] transition-colors duration-200 scroll-mt-[var(--reps-row-scroll-mt,200px)]"
    :class="highlighted ? 'bg-[var(--surface-brand-soft)]' : ''"
  >
    <!-- Station header -->
    <div class="flex items-center gap-3 px-1 py-3">
      <UiIcon name="mapPin" :size="16" :stroke="2" class="text-[var(--brand-primary)] flex-none" />
      <span class="font-[family-name:var(--font-display)] font-extrabold text-[1rem] tracking-[-0.01em] text-[var(--text-strong)]">
        {{ station.name }}
      </span>
      <UiBadge variant="neutral" class="ml-auto flex-none">
        {{ TYPE_LABELS[station.type ?? ''] ?? station.type }}
      </UiBadge>
    </div>

    <!-- Reps: workplace + health & safety -->
    <div class="pl-7 pb-4 grid sm:grid-cols-2 gap-x-6 gap-y-5">
      <!-- Workplace rep(s) -->
      <div class="flex flex-col gap-3">
        <p class="text-[length:var(--text-xs)] font-bold tracking-[0.07em] uppercase text-[var(--text-subtle)] m-0">
          {{ (station.reps?.length ?? 0) > 1 ? 'Workplace reps' : 'Workplace rep' }}
        </p>
        <template v-if="station.reps?.length">
          <RepsRepPerson
            v-for="rep in station.reps"
            :key="`wp-${rep.name}`"
            :name="rep.name"
            :note="rep.note"
          />
        </template>
        <RepsVacantCard v-else label="No workplace rep yet" />
      </div>

      <!-- Health & safety rep(s) -->
      <div class="flex flex-col gap-3">
        <p class="text-[length:var(--text-xs)] font-bold tracking-[0.07em] uppercase text-[var(--text-subtle)] m-0">
          {{ (station.hsReps?.length ?? 0) > 1 ? 'Health &amp; safety reps' : 'Health &amp; safety rep' }}
        </p>
        <template v-if="station.hsReps?.length">
          <RepsRepPerson
            v-for="rep in station.hsReps"
            :key="`hs-${rep.name}`"
            :name="rep.name"
            :note="rep.note"
          />
        </template>
        <RepsVacantCard v-else label="No H&amp;S rep yet" />
      </div>
    </div>
  </div>
</template>

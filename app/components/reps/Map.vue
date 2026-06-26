<script setup lang="ts">
import 'leaflet/dist/leaflet.css'

// Only stations that have coordinates are passed in (the page filters them).
interface MapStation {
  slug: string
  name: string
  lat: number
  lng: number
}

const props = defineProps<{
  stations: MapStation[]
  activeStation?: string | null
}>()

const emit = defineEmits<{
  stationSelect: [slug: string]
}>()

const mapEl = ref<HTMLElement | null>(null)
let mapInstance: any = null
let L: any = null
const markers: Record<string, any> = {}

// UNISON purple teardrop pin
function makeIcon(active = false) {
  const fill = active ? '#491A82' : '#5E22A6'
  return L.divIcon({
    className: '',
    html: `<svg width="26" height="34" viewBox="0 0 26 34" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M13 0C5.82 0 0 5.82 0 13c0 9.12 13 21 13 21S26 22.12 26 13C26 5.82 20.18 0 13 0z" fill="${fill}" />
      <circle cx="13" cy="13" r="5" fill="white" />
    </svg>`,
    iconSize: [26, 34],
    iconAnchor: [13, 34],
    popupAnchor: [0, -36],
    tooltipAnchor: [14, -18],
  })
}

// Repaint every pin so only the active station is highlighted.
function refreshIcons(activeSlug?: string | null) {
  for (const [slug, marker] of Object.entries(markers)) {
    marker.setIcon(makeIcon(slug === activeSlug))
  }
}

// Create a pin for a station, wire its click, and track it in `markers`.
function addMarker(station: MapStation) {
  const marker = L.marker([station.lat, station.lng], {
    icon: makeIcon(),
    title: station.name,
    alt: station.name,
  })
    .addTo(mapInstance)
    .bindTooltip(station.name, { direction: 'right', offset: [14, -18] })

  marker.on('click', () => {
    emit('stationSelect', station.slug)
    refreshIcons(station.slug)
    scrollToStation(station.slug)
  })

  markers[station.slug] = marker
}

onMounted(async () => {
  L = await import('leaflet')

  mapInstance = L.map(mapEl.value!, {
    center: [51.505, -0.15],
    zoom: 10,
    scrollWheelZoom: false,
    zoomControl: true,
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
  }).addTo(mapInstance)

  for (const station of props.stations) addMarker(station)
})

onUnmounted(() => {
  mapInstance?.remove()
  mapInstance = null
})

watch(() => props.activeStation, (slug) => {
  if (!slug || !mapInstance) return
  const m = markers[slug]
  if (!m) return
  mapInstance.setView(m.getLatLng(), Math.max(mapInstance.getZoom(), 13), { animate: true })
  refreshIcons(slug)
  m.openTooltip()
})

// Sync pins with the filtered station list: drop pins that fell out of the
// filter — and forget them, so clearing the filter recreates them — then add
// any that came back in.
watch(() => props.stations, (newStations) => {
  if (!mapInstance) return
  for (const [slug, marker] of Object.entries(markers)) {
    if (!newStations.some(s => s.slug === slug)) {
      mapInstance.removeLayer(marker)
      delete markers[slug]
    }
  }
  for (const station of newStations) {
    if (!markers[station.slug]) addMarker(station)
  }
}, { deep: false })

function scrollToStation(slug: string) {
  const el = document.getElementById(`station-${slug}`)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}
</script>

<template>
  <div
    ref="mapEl"
    class="z-0 size-full overflow-hidden rounded-[var(--radius-xl)]"
    role="application"
    aria-label="Map of LAS ambulance stations across London — use the list below to search and find your rep"
  />
</template>

<style>
/* Fix leaflet attribution z-index conflicting with sticky header */
.leaflet-control-attribution {
  font-size: 10px;
}
.leaflet-container {
  font-family: inherit;
}
</style>

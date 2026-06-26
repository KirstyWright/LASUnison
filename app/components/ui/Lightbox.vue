<script setup lang="ts">
/**
 * UiLightbox — a "shadowbox" for images inside prose content.
 *
 * Wrap a prose column (ContentRenderer / .article-prose / .las-prose) in this
 * component. It listens for clicks on the rendered content and, when an image
 * is clicked, opens it in a focus-trapped overlay instead of letting the link
 * fire.
 *
 * Why this exists: the WordPress migration left "click to enlarge" markup —
 * `[![](thumb)](full.jpg)` — which renders as <a href="/images/…"><img></a>.
 * @nuxt/content routes those internal hrefs through vue-router, so a click
 * tried to *navigate* to the raw image path (no page route → 404) rather than
 * serving the file. Intercepting the click here both kills that 404 and gives
 * a proper enlarged view.
 *
 * What it intercepts (everything else clicks through untouched):
 *   - <a> whose href is an image file  → opens the full-size href
 *   - bare <img> not wrapped in a link → opens its src
 * An image wrapped in a link to a *page* (e.g. a banner linking off-site) is
 * left alone so it still navigates.
 *
 * The host wrapper is display:contents, so it adds no box — prose layout and
 * the .article-prose / .las-prose styling are unaffected.
 */
const root = ref<HTMLElement | null>(null)
const panelEl = ref<HTMLElement | null>(null)
const closeBtn = ref<HTMLButtonElement | null>(null)
const mounted = ref(false)

interface Shot { src: string, alt: string }

const gallery = ref<Shot[]>([])
const index = ref(0)
const failed = ref(false)

const current = computed<Shot | null>(() => gallery.value[index.value] ?? null)
const hasMany = computed(() => gallery.value.length > 1)

const IMAGE_RE = /\.(jpe?g|png|gif|webp|avif|svg|bmp)(\?|#|$)/i

let lastFocused: HTMLElement | null = null

/* ---------------------------------------------------------- resolve targets */
/** A linked image counts only when the link points at an image file. */
function fromAnchor(a: HTMLAnchorElement): (Shot & { el: Element }) | null {
  const href = a.getAttribute('href') || ''
  if (!IMAGE_RE.test(href)) return null
  const img = a.querySelector('img')
  return { src: href, alt: img?.getAttribute('alt') || a.getAttribute('title') || '', el: a }
}

/** A bare image counts only when it isn't itself a link or part of an embed. */
function fromImg(img: HTMLImageElement): (Shot & { el: Element }) | null {
  if (img.closest('a') || img.closest('.las-embed')) return null
  const src = img.currentSrc || img.getAttribute('src') || ''
  if (!src) return null
  return { src, alt: img.getAttribute('alt') || '', el: img }
}

/** Every zoomable image in the column, in document order, de-duplicated. */
function collect(): Array<Shot & { el: Element }> {
  const out: Array<Shot & { el: Element }> = []
  root.value?.querySelectorAll<HTMLElement>('a[href], img').forEach((el) => {
    const shot = el.tagName === 'A'
      ? fromAnchor(el as HTMLAnchorElement)
      : fromImg(el as HTMLImageElement)
    if (shot) out.push(shot)
  })
  return out
}

/* ----------------------------------------------------------------- open/close */
function onClick(e: MouseEvent) {
  // Leave modified clicks (open-in-new-tab) and non-primary buttons alone.
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.defaultPrevented) return
  const target = e.target
  if (!(target instanceof Element) || !root.value) return

  const link = target.closest('a')
  const hit = link && root.value.contains(link)
    ? fromAnchor(link as HTMLAnchorElement)
    : (() => {
        const img = target.closest('img')
        return img && root.value.contains(img) ? fromImg(img as HTMLImageElement) : null
      })()

  if (!hit) return // not an image we handle — let the browser/router proceed

  // Runs in the capture phase, so we get in ahead of @nuxt/content's NuxtLink:
  // stopping propagation here means vue-router never sees the click and never
  // navigates to the raw image path.
  e.preventDefault()
  e.stopPropagation()
  const shots = collect()
  const at = shots.findIndex(s => s.el === hit.el)
  gallery.value = shots.length ? shots.map(({ src, alt }) => ({ src, alt })) : [{ src: hit.src, alt: hit.alt }]
  open(at < 0 ? 0 : at)
}

function open(at: number) {
  lastFocused = (document.activeElement as HTMLElement) ?? null
  index.value = at
  failed.value = false
  document.body.style.overflow = 'hidden'
  nextTick(() => closeBtn.value?.focus())
}

function closeLightbox() {
  gallery.value = []
  document.body.style.overflow = ''
  if (lastFocused?.focus) lastFocused.focus()
  lastFocused = null
}

function step(delta: number) {
  if (!hasMany.value) return
  const n = gallery.value.length
  index.value = (index.value + delta + n) % n
  failed.value = false
}

/* --------------------------------------------------------------- keyboard */
function onKeydown(e: KeyboardEvent) {
  if (!current.value) return
  if (e.key === 'Escape') { e.preventDefault(); closeLightbox() }
  else if (e.key === 'ArrowRight') { e.preventDefault(); step(1) }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1) }
  else if (e.key === 'Tab') trapTab(e)
}

/** Keep Tab focus inside the panel (close / prev / next only). */
function trapTab(e: KeyboardEvent) {
  if (!panelEl.value) return
  const focusable = panelEl.value.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )
  if (!focusable.length) return
  const first = focusable[0]!
  const last = focusable[focusable.length - 1]!
  const act = document.activeElement
  if (e.shiftKey && act === first) { e.preventDefault(); last.focus() }
  else if (!e.shiftKey && act === last) { e.preventDefault(); first.focus() }
}

/* --------------------------------------------------------------- lifecycle */
const router = useRouter()
let removeAfterEach: (() => void) | null = null

onMounted(() => {
  mounted.value = true
  // Esc works even if focus has wandered off the panel.
  window.addEventListener('keydown', onKeydown)
  // A click that does navigate (e.g. a related-article card) should not leave
  // a stranded overlay behind.
  removeAfterEach = router.afterEach(() => { if (current.value) closeLightbox() })
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  removeAfterEach?.()
  document.body.style.overflow = ''
})
</script>

<template>
  <div ref="root" style="display: contents" @click.capture="onClick">
    <slot />
  </div>

  <ClientOnly>
    <Teleport v-if="mounted" to="body">
      <!-- Presence by v-if (instant, reliable close); entrance is a pure CSS
           animation. A teleported Vue <Transition> can strand mid-leave when a
           navigation re-renders the app, so we avoid one — same pattern as the
           search overlay. -->
      <div
        v-if="current"
        class="lightbox fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-8"
        @keydown="onKeydown"
      >
        <!-- Scrim -->
        <div
          class="lightbox-scrim absolute inset-0 bg-[var(--purple-950)]/85 backdrop-blur-[3px]"
          aria-hidden="true"
          @click="closeLightbox"
        />

        <!-- Close (top-right of the viewport, always reachable) -->
        <button
          ref="closeBtn"
          type="button"
          aria-label="Close image"
          class="absolute top-4 right-4 z-10 inline-flex items-center justify-center w-11 h-11 rounded-full border-none bg-white/10 text-white cursor-pointer backdrop-blur-sm transition-colors duration-150 hover:bg-white/20 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-white/70"
          @click="closeLightbox"
        >
          <UiIcon name="x" :size="22" :stroke="2.2" />
        </button>

        <!-- Prev / next -->
        <template v-if="hasMany">
          <button
            type="button"
            aria-label="Previous image"
            class="lightbox-nav absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center w-11 h-11 rounded-full border-none bg-white/10 text-white cursor-pointer backdrop-blur-sm transition-colors duration-150 hover:bg-white/20 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-white/70"
            @click="step(-1)"
          >
            <UiIcon name="arrowLeft" :size="22" :stroke="2.2" />
          </button>
          <button
            type="button"
            aria-label="Next image"
            class="lightbox-nav absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center w-11 h-11 rounded-full border-none bg-white/10 text-white cursor-pointer backdrop-blur-sm transition-colors duration-150 hover:bg-white/20 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-white/70"
            @click="step(1)"
          >
            <UiIcon name="arrowRight" :size="22" :stroke="2.2" />
          </button>
        </template>

        <!-- Panel -->
        <figure
          ref="panelEl"
          role="dialog"
          aria-modal="true"
          :aria-label="current.alt || 'Image preview'"
          class="lightbox-panel relative flex flex-col items-center justify-center m-0 max-w-[min(1100px,92vw)] max-h-[92vh]"
        >
          <div
            v-if="failed"
            class="flex flex-col items-center gap-2 px-8 py-12 text-center text-white/80"
          >
            <UiIcon name="alert" :size="28" :stroke="2" />
            <p class="m-0 font-[family-name:var(--font-sans)] text-[0.9375rem]">This image is no longer available.</p>
          </div>
          <img
            v-else
            :key="current.src"
            :src="current.src"
            :alt="current.alt"
            class="lightbox-img block max-w-full max-h-[80vh] w-auto h-auto object-contain rounded-[var(--radius-md)] bg-[var(--surface-card)] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.6)]"
            @error="failed = true"
          >

          <figcaption
            v-if="current.alt || hasMany"
            class="mt-4 flex items-center gap-3 max-w-[70ch] font-[family-name:var(--font-sans)] text-[0.875rem] text-white/85"
          >
            <span v-if="current.alt" class="min-w-0 text-center">{{ current.alt }}</span>
            <span
              v-if="hasMany"
              class="flex-none font-[family-name:var(--font-mono)] text-[0.8125rem] text-white/60"
            >{{ index + 1 }} / {{ gallery.length }}</span>
          </figcaption>
        </figure>
      </div>
    </Teleport>
  </ClientOnly>
</template>

<style scoped>
.lightbox-scrim {
  animation: lightbox-scrim-in 150ms ease-out;
}
.lightbox-panel,
.lightbox-nav {
  animation: lightbox-panel-in 200ms ease-out;
}
@keyframes lightbox-scrim-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes lightbox-panel-in {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: none; }
}
/* The nav buttons keep their translate while fading in. */
.lightbox-nav {
  animation-name: lightbox-nav-in;
}
@keyframes lightbox-nav-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .lightbox-scrim,
  .lightbox-panel,
  .lightbox-nav { animation: none; }
}
</style>

<script setup lang="ts">
/**
 * SiteNavDropdown — one top-level menu with a dropdown panel.
 *
 * The trigger is a real link to the group's hub page (so clicking "Support"
 * goes to /support), and the panel of child links opens on hover and on
 * keyboard focus. Escape closes and returns focus to the trigger; ArrowDown
 * opens it and moves into the list. Focus leaving the group closes it.
 */
import { navGroupForPath, type NavGroup } from '~/data/nav'

const props = defineProps<{ group: NavGroup }>()

const route = useRoute()
// Highlight the trigger when the current route lives anywhere in this group.
const isActive = computed(() => navGroupForPath(route.path)?.id === props.group.id)

const open = ref(false)
const root = ref<HTMLElement | null>(null)
let closeTimer: ReturnType<typeof setTimeout> | undefined

function show() {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = undefined
  }
  open.value = true
}
function hide() {
  open.value = false
}
// Brief delay on mouse-leave so a diagonal path to the panel doesn't close it.
function deferHide() {
  closeTimer = setTimeout(hide, 90)
}

// Close once focus leaves the whole group (e.g. tabbing past it).
function onFocusOut(e: FocusEvent) {
  const next = e.relatedTarget as Node | null
  if (!next || !root.value?.contains(next)) hide()
}

function itemLinks(): HTMLElement[] {
  return Array.from(root.value?.querySelectorAll<HTMLElement>('[data-nav-item]') ?? [])
}
function focusItem(i: number) {
  const els = itemLinks()
  if (!els.length) return
  els[(i + els.length) % els.length]?.focus()
}
function focusTrigger() {
  root.value?.querySelector<HTMLElement>('[data-nav-trigger]')?.focus()
}

function onTriggerKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    show()
    nextTick(() => focusItem(0))
  }
  else if (e.key === 'Escape') {
    hide()
  }
}
function onItemKeydown(e: KeyboardEvent, i: number) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    focusItem(i + 1)
  }
  else if (e.key === 'ArrowUp') {
    e.preventDefault()
    focusItem(i - 1)
  }
  else if (e.key === 'Escape') {
    e.preventDefault()
    hide()
    focusTrigger()
  }
}
</script>

<template>
  <div
    ref="root"
    class="relative"
    @mouseenter="show"
    @mouseleave="deferHide"
    @focusin="show"
    @focusout="onFocusOut"
  >
    <NuxtLink
      :to="group.hub"
      data-nav-trigger
      :aria-expanded="open"
      :aria-current="route.path === group.hub ? 'page' : (isActive ? 'true' : undefined)"
      class="inline-flex items-center gap-1 rounded-[var(--radius-md)] px-3 py-2 text-[1rem] font-bold no-underline transition-colors duration-150 hover:bg-[var(--surface-sunken)] hover:text-[var(--brand-primary)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
      :class="isActive ? 'text-[var(--brand-primary)]' : 'text-[var(--text-body)]'"
      @keydown="onTriggerKeydown"
    >
      {{ group.label }}
      <UiIcon
        name="chevronDown"
        :size="16"
        :stroke="2.2"
        class="transition-transform duration-150"
        :class="open && '-rotate-180'"
      />
    </NuxtLink>

    <Transition
      enter-active-class="transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none"
      leave-active-class="transition-[opacity,transform] duration-100 ease-in motion-reduce:transition-none"
      enter-from-class="opacity-0 -translate-y-1"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-show="open"
        class="absolute top-full left-0 z-[210] w-[320px] pt-2"
      >
        <ul
          class="m-0 flex list-none flex-col gap-0.5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-card)] p-2 shadow-[var(--shadow-lg)]"
        >
          <li
            v-for="(item, i) in group.items"
            :key="item.path"
          >
            <NuxtLink
              :to="item.path"
              data-nav-item
              class="group/item flex items-start gap-3 rounded-[var(--radius-md)] p-2.5 text-[var(--text-body)] no-underline transition-colors duration-150 hover:bg-[var(--surface-sunken)] focus-visible:bg-[var(--surface-sunken)]"
              @keydown="onItemKeydown($event, i)"
            >
              <span
                class="mt-0.5 inline-flex size-9 flex-none items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand-primary-soft)] text-[var(--brand-primary-strong)]"
                aria-hidden="true"
              >
                <UiIcon
                  :name="item.icon ?? 'arrowRight'"
                  :size="18"
                  :stroke="1.9"
                />
              </span>
              <span class="min-w-0">
                <span
                  class="block text-[0.9375rem] leading-tight font-bold text-[var(--text-strong)] group-hover/item:text-[var(--brand-primary)]"
                >{{ item.label }}</span>
                <span
                  v-if="item.note"
                  class="mt-0.5 block text-[0.8125rem] leading-snug text-[var(--text-muted)]"
                >{{ item.note }}</span>
              </span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

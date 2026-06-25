<script setup lang="ts">
// Site header — notice banner slot, utility strip, main bar, and a mobile menu.
// The primary nav is driven by app/data/nav.ts: groups with children render as
// dropdowns (desktop) / accordions (mobile); groups without children (News,
// Resources) render as plain links. One source of truth shared with the hub
// pages and the catch-all's "In this section" block.
import { navGroups, socials as SOCIALS } from '~/data/nav'

const menuOpen = ref(false)
// Which mobile accordion sections are expanded (by group id).
const openMobile = reactive<Record<string, boolean>>({})
function toggleMobile(id: string) {
  openMobile[id] = !openMobile[id]
}

const { open: openSearch } = useSiteSearch()

const route = useRoute()
// Close the mobile menu whenever navigation completes.
watch(() => route.fullPath, () => { menuOpen.value = false })

// Open the site-wide search overlay (from the icon button or the mobile menu).
function launchSearch() {
  menuOpen.value = false
  openSearch()
}
</script>

<template>
  <header class="sticky top-0 z-[200] font-[family-name:var(--font-sans)]">
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <!-- Utility strip -->
    <div class="bg-[var(--surface-brand-deep)] text-[var(--purple-200)]">
      <div class="las-container flex items-center justify-between h-10 text-[0.875rem]">
        <span class="font-semibold truncate">London Ambulance Service UNISON Branch</span>
        <div class="flex items-center gap-4 flex-none">
          <a
            href="https://my.unison.org.uk"
            class="text-[var(--purple-200)] no-underline font-semibold hover:text-white whitespace-nowrap"
          >My UNISON</a>
          <span class="opacity-40" aria-hidden="true">|</span>
          <div class="hidden sm:flex gap-3">
            <a
              v-for="s in SOCIALS"
              :key="s.name"
              :href="s.href"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="`LAS UNISON on ${s.name}`"
              class="text-[var(--purple-200)] inline-flex hover:text-white"
            >
              <UiIcon :name="s.name" :size="16" :stroke="1.8" />
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Main bar -->
    <div class="bg-[var(--surface-card)] border-b border-[var(--border-default)] shadow-[var(--shadow-xs)]">
      <div class="las-container flex items-center gap-6 h-[78px]">
        <NuxtLink to="/" class="flex items-center flex-none" aria-label="LAS UNISON — home">
          <UiLogo tone="dark" />
        </NuxtLink>

        <nav class="hidden lg:flex items-center gap-1 ml-auto" aria-label="Primary">
          <template v-for="group in navGroups" :key="group.id">
            <SiteNavDropdown v-if="group.items.length" :group="group" />
            <NuxtLink
              v-else
              :to="group.hub"
              class="inline-flex items-center px-3 py-2 rounded-[var(--radius-md)] font-bold text-[1rem] no-underline text-[var(--text-body)] hover:bg-[var(--surface-sunken)] hover:text-[var(--brand-primary)] transition-colors duration-150"
            >
              {{ group.label }}
            </NuxtLink>
          </template>
        </nav>

        <div class="flex items-center gap-2 flex-none ml-auto lg:ml-0">
          <button
            type="button"
            aria-label="Search the site"
            aria-keyshortcuts="Meta+K Control+K"
            class="w-11 h-11 rounded-[var(--radius-md)] border-none bg-transparent text-[var(--text-muted)] cursor-pointer hidden sm:inline-flex items-center justify-center hover:bg-[var(--surface-sunken)] hover:text-[var(--brand-primary)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
            @click="launchSearch"
          >
            <UiIcon name="search" :size="22" />
          </button>
          <UiButton variant="primary" href="/#join">Join us</UiButton>

          <!-- Mobile menu toggle -->
          <button
            type="button"
            class="lg:hidden w-11 h-11 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-transparent text-[var(--text-strong)] cursor-pointer inline-flex items-center justify-center hover:bg-[var(--surface-sunken)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
            :aria-expanded="menuOpen"
            aria-controls="mobile-menu"
            :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
            @click="menuOpen = !menuOpen"
          >
            <UiIcon :name="menuOpen ? 'x' : 'menu'" :size="24" :stroke="2.2" />
          </button>
        </div>
      </div>

      <!-- Mobile menu panel -->
      <Transition
        enter-active-class="transition-[max-height,opacity] duration-300 ease-out overflow-hidden motion-reduce:transition-none"
        leave-active-class="transition-[max-height,opacity] duration-200 ease-in overflow-hidden motion-reduce:transition-none"
        enter-from-class="max-h-0 opacity-0"
        enter-to-class="max-h-screen opacity-100"
        leave-from-class="max-h-screen opacity-100"
        leave-to-class="max-h-0 opacity-0"
      >
        <nav
          v-show="menuOpen"
          id="mobile-menu"
          class="lg:hidden border-t border-[var(--border-subtle)] bg-[var(--surface-card)]"
          aria-label="Primary (mobile)"
        >
          <!-- Scrollable inner — caps at viewport height minus the two header bars -->
          <div class="overflow-y-auto max-h-[calc(100dvh-118px)]">
            <div class="las-container py-3 flex flex-col">
              <button
                type="button"
                class="mb-1 flex items-center gap-2.5 py-2.5 px-3 -mx-3 rounded-[var(--radius-md)] border-none bg-[var(--surface-sunken)] text-[var(--text-body)] font-bold text-[length:var(--text-md)] cursor-pointer text-left hover:text-[var(--brand-primary)]"
                @click="launchSearch"
              >
                <UiIcon name="search" :size="20" :stroke="2" />
                Search the site
              </button>

              <template v-for="group in navGroups" :key="group.id">
                <!-- Group with children → accordion section -->
                <div v-if="group.items.length" class="border-b border-[var(--border-subtle)] last:border-b-0">
                  <button
                    type="button"
                    class="w-full flex items-center justify-between gap-2 py-2.5 px-3 -mx-3 rounded-[var(--radius-md)] border-none bg-transparent font-bold text-[length:var(--text-md)] text-[var(--text-body)] cursor-pointer text-left hover:bg-[var(--surface-sunken)] hover:text-[var(--brand-primary)]"
                    :aria-expanded="!!openMobile[group.id]"
                    :aria-controls="`m-${group.id}`"
                    @click="toggleMobile(group.id)"
                  >
                    {{ group.label }}
                    <UiIcon
                      name="chevronDown"
                      :size="18"
                      :stroke="2.2"
                      class="transition-transform duration-150"
                      :class="openMobile[group.id] && '-rotate-180'"
                    />
                  </button>
                  <ul
                    v-show="openMobile[group.id]"
                    :id="`m-${group.id}`"
                    class="list-none m-0 pb-2 pl-3 flex flex-col"
                  >
                    <li v-for="item in group.items" :key="item.path">
                      <NuxtLink
                        :to="item.path"
                        class="block py-2 px-3 -mx-3 rounded-[var(--radius-md)] no-underline text-[0.9375rem] text-[var(--text-muted)] hover:bg-[var(--surface-sunken)] hover:text-[var(--brand-primary)]"
                      >
                        {{ item.label }}
                      </NuxtLink>
                    </li>
                  </ul>
                </div>
                <!-- Plain link (News, Resources) -->
                <NuxtLink
                  v-else
                  :to="group.hub"
                  class="py-2.5 px-3 -mx-3 rounded-[var(--radius-md)] font-bold text-[length:var(--text-md)] no-underline text-[var(--text-body)] border-b border-[var(--border-subtle)] last:border-b-0 hover:bg-[var(--surface-sunken)] hover:text-[var(--brand-primary)]"
                >
                  {{ group.label }}
                </NuxtLink>
              </template>

              <a
                href="tel:08000857857"
                class="mt-2 flex items-center gap-2.5 py-2.5 px-3 -mx-3 rounded-[var(--radius-md)] no-underline text-[var(--emergency)] font-bold hover:bg-[var(--emergency-soft)]"
              >
                <UiIcon name="phone" :size="18" :stroke="2" />
                UNISON Direct · 0800 0857 857
              </a>
              <UiButton variant="primary" href="/#join" full-width class="mt-3 mb-1">Join us</UiButton>
            </div>
          </div>
        </nav>
      </Transition>
    </div>
  </header>
</template>

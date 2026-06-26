<script setup lang="ts">
// Site header — notice banner slot, utility strip, main bar, and a mobile menu.
// The primary nav is driven by app/data/nav.ts: groups with children render as
// dropdowns (desktop) / accordions (mobile); groups without children (News,
// Resources) render as plain links. One source of truth shared with the hub
// pages and the catch-all's "In this section" block.
import { navGroups, navGroupForPath, socials as SOCIALS } from '~/data/nav'

const menuOpen = ref(false)
// Which mobile accordion sections are expanded (by group id).
const openMobile = reactive<Record<string, boolean>>({})
function toggleMobile(id: string) {
  openMobile[id] = !openMobile[id]
}

const { open: openSearch } = useSiteSearch()

const route = useRoute()
// The nav group the current route belongs to — drives the active-link state so
// the menu always shows where you are (design: "the active item is purple").
const activeGroupId = computed(() => navGroupForPath(route.path)?.id)
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
    <a
      href="#main-content"
      class="skip-link"
    >Skip to main content</a>

    <!-- Utility strip -->
    <div class="bg-[var(--surface-brand-deep)] text-[var(--purple-200)]">
      <div class="las-container flex h-10 items-center justify-between text-[0.875rem]">
        <span class="truncate font-semibold">London Ambulance Service UNISON Branch</span>
        <div class="flex flex-none items-center gap-4">
          <a
            href="https://my.unison.org.uk"
            class="font-semibold whitespace-nowrap text-[var(--purple-200)] no-underline transition-colors duration-150 hover:text-white"
          >My UNISON</a>
          <span
            class="opacity-40"
            aria-hidden="true"
          >|</span>
          <div class="hidden gap-3 sm:flex">
            <a
              v-for="s in SOCIALS"
              :key="s.name"
              :href="s.href"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="`LAS UNISON on ${s.name}`"
              class="inline-flex text-[var(--purple-200)] transition-colors duration-150 hover:text-white"
            >
              <UiIcon
                :name="s.name"
                :size="16"
                :stroke="1.8"
              />
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Main bar -->
    <div class="border-b border-[var(--border-default)] bg-[var(--surface-card)] shadow-[var(--shadow-xs)]">
      <div class="las-container flex h-[78px] items-center gap-6">
        <NuxtLink
          to="/"
          class="flex flex-none items-center"
          aria-label="LAS UNISON — home"
        >
          <UiLogo tone="dark" />
        </NuxtLink>

        <nav
          class="ml-auto hidden items-center gap-1 lg:flex"
          aria-label="Primary"
        >
          <template
            v-for="group in navGroups"
            :key="group.id"
          >
            <SiteNavDropdown
              v-if="group.items.length"
              :group="group"
            />
            <NuxtLink
              v-else
              :to="group.hub"
              class="inline-flex items-center rounded-[var(--radius-md)] px-3 py-2 text-[1rem] font-bold no-underline transition-colors duration-150 hover:bg-[var(--surface-sunken)] hover:text-[var(--brand-primary)]"
              :class="activeGroupId === group.id ? 'text-[var(--brand-primary)]' : 'text-[var(--text-body)]'"
              :aria-current="route.path === group.hub ? 'page' : (activeGroupId === group.id ? 'true' : undefined)"
            >
              {{ group.label }}
            </NuxtLink>
          </template>
        </nav>

        <div class="ml-auto flex flex-none items-center gap-2 lg:ml-0">
          <button
            type="button"
            aria-label="Search the site"
            aria-keyshortcuts="Meta+K Control+K"
            class="hidden size-11 cursor-pointer items-center justify-center rounded-[var(--radius-md)] border-none bg-transparent text-[var(--text-muted)] hover:bg-[var(--surface-sunken)] hover:text-[var(--brand-primary)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)] sm:inline-flex"
            @click="launchSearch"
          >
            <UiIcon
              name="search"
              :size="22"
            />
          </button>
          <UiButton
            variant="primary"
            href="/#join"
          >
            Join us
          </UiButton>

          <!-- Mobile menu toggle -->
          <button
            type="button"
            class="inline-flex size-11 cursor-pointer items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-transparent text-[var(--text-strong)] hover:bg-[var(--surface-sunken)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)] lg:hidden"
            :aria-expanded="menuOpen"
            aria-controls="mobile-menu"
            :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
            @click="menuOpen = !menuOpen"
          >
            <UiIcon
              :name="menuOpen ? 'x' : 'menu'"
              :size="24"
              :stroke="2.2"
            />
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
          class="border-t border-[var(--border-subtle)] bg-[var(--surface-card)] lg:hidden"
          aria-label="Primary (mobile)"
        >
          <!-- Scrollable inner — caps at viewport height minus the two header bars -->
          <div class="max-h-[calc(100dvh-var(--header-h))] overflow-y-auto">
            <div class="las-container flex flex-col py-3">
              <button
                type="button"
                class="-mx-3 mb-1 flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-md)] border-none bg-[var(--surface-sunken)] px-3 py-2.5 text-left text-[length:var(--text-md)] font-bold text-[var(--text-body)] hover:text-[var(--brand-primary)]"
                @click="launchSearch"
              >
                <UiIcon
                  name="search"
                  :size="20"
                  :stroke="2"
                />
                Search the site
              </button>

              <template
                v-for="group in navGroups"
                :key="group.id"
              >
                <!-- Group with children → accordion section -->
                <div
                  v-if="group.items.length"
                  class="border-b border-[var(--border-subtle)] last:border-b-0"
                >
                  <button
                    type="button"
                    class="-mx-3 flex w-full cursor-pointer items-center justify-between gap-2 rounded-[var(--radius-md)] border-none bg-transparent px-3 py-2.5 text-left text-[length:var(--text-md)] font-bold hover:bg-[var(--surface-sunken)] hover:text-[var(--brand-primary)]"
                    :class="activeGroupId === group.id ? 'text-[var(--brand-primary)]' : 'text-[var(--text-body)]'"
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
                    class="m-0 flex list-none flex-col pb-2 pl-3"
                  >
                    <li
                      v-for="item in group.items"
                      :key="item.path"
                    >
                      <NuxtLink
                        :to="item.path"
                        class="-mx-3 block rounded-[var(--radius-md)] px-3 py-2 text-[0.9375rem] text-[var(--text-muted)] no-underline hover:bg-[var(--surface-sunken)] hover:text-[var(--brand-primary)]"
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
                  class="-mx-3 rounded-[var(--radius-md)] border-b border-[var(--border-subtle)] px-3 py-2.5 text-[length:var(--text-md)] font-bold no-underline last:border-b-0 hover:bg-[var(--surface-sunken)] hover:text-[var(--brand-primary)]"
                  :class="activeGroupId === group.id ? 'text-[var(--brand-primary)]' : 'text-[var(--text-body)]'"
                  :aria-current="route.path === group.hub ? 'page' : (activeGroupId === group.id ? 'true' : undefined)"
                >
                  {{ group.label }}
                </NuxtLink>
              </template>

              <a
                href="tel:08000857857"
                class="-mx-3 mt-2 flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2.5 font-bold text-[var(--emergency)] no-underline hover:bg-[var(--emergency-soft)]"
              >
                <UiIcon
                  name="phone"
                  :size="18"
                  :stroke="2"
                />
                UNISON Direct · <span class="font-[family-name:var(--font-mono)]">0800 0857 857</span>
              </a>
              <UiButton
                variant="primary"
                href="/#join"
                full-width
                class="mt-3 mb-1"
              >
                Join us
              </UiButton>
            </div>
          </div>
        </nav>
      </Transition>
    </div>
  </header>
</template>

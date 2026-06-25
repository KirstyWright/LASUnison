/**
 * Global state for the site-wide search overlay. The header search button (and
 * a Cmd/Ctrl+K shortcut) call `open()`; the overlay lives once in app.vue and
 * reads `isOpen`. Kept as shared `useState` so any component can trigger it.
 */
export function useSiteSearch() {
  const isOpen = useState('site-search-open', () => false)
  return {
    isOpen,
    open: () => { isOpen.value = true },
    close: () => { isOpen.value = false },
    toggle: () => { isOpen.value = !isOpen.value },
  }
}

import type { RouterConfig } from '@nuxt/schema'

// In-page anchor navigation. The header nav links to on-page sections (e.g. /#branch),
// and the site header is sticky — so anchor clicks must scroll to their target and clear
// the header. Returning a position to the router doesn't apply reliably for same-page hash
// navigation alongside CSS `scroll-behavior: smooth`, so we perform the scroll ourselves.
// Smoothness and prefers-reduced-motion are governed by that CSS rule, so no explicit
// behavior is passed here.
export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition

    if (to.hash && to.hash.length > 1) {
      const scrollToHash = (): boolean => {
        const el = document.querySelector(to.hash)
        if (!el) return false
        const header = document.querySelector('header')
        const offset = (header?.getBoundingClientRect().height ?? 96) + 16
        window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - offset })
        return true
      }

      // Same-page anchors are already in the DOM, so this resolves immediately. When
      // arriving from another route the target may mount a tick later — poll briefly.
      if (!scrollToHash()) {
        let attempts = 0
        const timer = setInterval(() => {
          if (scrollToHash() || ++attempts >= 20) clearInterval(timer)
        }, 50)
      }
      return false
    }

    if (to.path !== from.path) return { top: 0 }
  },
}

// Enumerate the site routes backed by Content files, for static prerendering.
//
// On a static (IONOS) deploy every page must be prerendered to a real .html file
// or it 404s — `crawlLinks` alone would MISS any migrated page not linked from the
// nav (orphaned WordPress pages, older news posts beyond the paginated archive).
// We seed Nitro's prerender list from disk so coverage doesn't depend on internal
// linking. Imported by nuxt.config.ts (`nitro:config` hook).
import { readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, relative, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const CONTENT = resolve(HERE, '..', 'content')

function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else if (name.endsWith('.md')) out.push(full)
  }
  return out
}

// Top-level dirs that are DATA collections (no page route) — skip them.
const SKIP_TOP = new Set(['documents', 'reps', 'committee', 'links'])

// content/<path>.md → "/<path>", mirroring the page collections:
//   content/news/<slug>.md  → /news/<slug>      (news collection)
//   content/legal/<slug>.md → /legal/<slug>     (legal collection)
//   content/<path>.md       → /<path>           (catch-all `content` collection)
// index.md is the designed homepage (owns "/") and is skipped.
export function contentRoutes() {
  const routes = new Set()
  for (const file of walk(CONTENT)) {
    const rel = relative(CONTENT, file).replace(/\\/g, '/').replace(/\.md$/, '')
    if (rel === 'index') continue
    if (SKIP_TOP.has(rel.split('/')[0])) continue
    routes.add('/' + rel)
  }
  return [...routes]
}

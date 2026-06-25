// Image/media handling: rewrite WordPress upload URLs to local /images/... paths,
// remember which files to copy, copy the ones that exist on disk, and report the rest.
//
// The local uploads pull is known to be incomplete (2019 & 2021 folders missing, and
// many sized variants absent), so a missing source is logged, never fatal — the Markdown
// keeps a faithful /images/... reference either way.
import { existsSync, mkdirSync, copyFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { LOCAL_HOSTS, IMAGE_EXT, UPLOADS_ROOT, PUBLIC_IMAGES_DIR, SITE } from './config.mjs'

const UPLOAD_RE = /\/wp-content\/uploads\/(.+)$/i

function extOf(p) {
  const m = /\.([a-z0-9]+)(?:[?#].*)?$/i.exec(p)
  return m ? m[1].toLowerCase() : ''
}

// Pull host + path out of absolute, protocol-relative or root-relative URLs.
function parse(url) {
  if (!url) return null
  let host = null
  let rest = url
  let m
  if ((m = /^https?:\/\/([^/]+)(\/.*)?$/i.exec(url))) {
    host = m[1].toLowerCase()
    rest = m[2] || '/'
  } else if ((m = /^\/\/([^/]+)(\/.*)?$/.exec(url))) {
    host = m[1].toLowerCase()
    rest = m[2] || '/'
  } else if (url.startsWith('/')) {
    host = null // root-relative — treat as same-site
    rest = url
  } else {
    return null // mailto:, tel:, #anchor, relative — leave alone
  }
  return { host, rest }
}

export class MediaCollector {
  constructor() {
    this.referenced = new Map() // rel -> Set of contexts (for reporting)
    this.copied = []
    this.alreadyPresent = []
    this.missing = []
    this.external = new Set()
    this.docLinks = new Set()
  }

  // Record an uploads-relative path we'll want to copy. Returns the new /images URL.
  _recordImage(rel, ctx) {
    if (!this.referenced.has(rel)) this.referenced.set(rel, new Set())
    this.referenced.get(rel).add(ctx)
    return '/images/' + rel
  }

  // Rewrite a single URL found in an <img src> or <a href>.
  //  - local uploads image  -> /images/<rel> (and queued for copy)
  //  - local uploads non-image (pdf/doc) -> absolute live URL (left for documents pass)
  //  - external -> unchanged
  rewrite(url, ctx = '') {
    const p = parse(url)
    if (!p) return url
    const isLocal = p.host === null || LOCAL_HOSTS.has(p.host)
    if (!isLocal) {
      this.external.add(url)
      return url
    }
    const m = UPLOAD_RE.exec(p.rest)
    if (!m) {
      // a local non-uploads link (e.g. /membership) — make it root-relative
      return p.rest
    }
    const rel = decodeURIComponent(m[1])
    if (IMAGE_EXT.has(extOf(rel))) return this._recordImage(rel, ctx)
    // document / other upload — normalise to the canonical live host for now
    const abs = SITE + '/wp-content/uploads/' + rel
    this.docLinks.add(abs)
    return abs
  }

  // Featured image relative path -> /images URL, only if the file exists on disk.
  featured(rel, ctx = '') {
    if (!rel) return null
    if (existsSync(join(UPLOADS_ROOT, rel))) return this._recordImage(rel, ctx)
    // still record so it shows in the missing report, but don't set frontmatter image
    if (!this.referenced.has(rel)) this.referenced.set(rel, new Set())
    this.referenced.get(rel).add(ctx + ' (featured, missing)')
    this.missing.push(rel)
    return null
  }

  // Copy every referenced image that exists; track copied / already-present / missing.
  copyAll({ dryRun = false } = {}) {
    for (const rel of this.referenced.keys()) {
      const src = join(UPLOADS_ROOT, rel)
      const dest = join(PUBLIC_IMAGES_DIR, rel)
      if (!existsSync(src)) {
        if (!this.missing.includes(rel)) this.missing.push(rel)
        continue
      }
      if (existsSync(dest) && statSync(dest).size === statSync(src).size) {
        this.alreadyPresent.push(rel)
        continue
      }
      if (!dryRun) {
        mkdirSync(dirname(dest), { recursive: true })
        copyFileSync(src, dest)
      }
      this.copied.push(rel)
    }
  }

  report() {
    return {
      referenced: this.referenced.size,
      copied: this.copied.length,
      alreadyPresent: this.alreadyPresent.length,
      missing: [...new Set(this.missing)],
      external: this.external.size,
      docLinks: this.docLinks.size,
    }
  }
}

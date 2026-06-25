// SQLite read layer for the migration. Mirrors the queries in
// scripts/wp-audit/generate_audit.py but returns shapes the migrator needs.
import Database from 'better-sqlite3'

export function openDb(path) {
  return new Database(path, { readonly: true })
}

// All published news posts, newest first, with the author's display_name joined.
export function getPublishedPosts(db) {
  return db
    .prepare(
      `SELECT p.ID AS id, p.post_title AS title, p.post_name AS slug,
              p.post_date AS date, p.post_content AS content,
              u.display_name AS author
       FROM posts p
       LEFT JOIN users u ON p.post_author = u.ID
       WHERE p.post_type = 'post' AND p.post_status = 'publish'
       ORDER BY p.post_date DESC`,
    )
    .all()
}

// All published pages (path is resolved separately via buildPagePaths).
export function getPublishedPages(db) {
  return db
    .prepare(
      `SELECT ID AS id, post_title AS title, post_name AS slug,
              post_parent AS parent, post_date AS date,
              post_modified AS modified, post_content AS content
       FROM posts
       WHERE post_type = 'page' AND post_status = 'publish'`,
    )
    .all()
}

// object_id -> { categories: [{name,slug}], tags: [name,...] }
export function getTerms(db) {
  const rows = db
    .prepare(
      `SELECT tr.object_id AS oid, tt.taxonomy AS tax, t.name AS name, t.slug AS slug
       FROM term_relationships tr
       JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
       JOIN terms t ON tt.term_id = t.term_id
       WHERE tt.taxonomy IN ('category', 'post_tag')`,
    )
    .all()
  const map = new Map()
  for (const r of rows) {
    if (!map.has(r.oid)) map.set(r.oid, { categories: [], tags: [] })
    const entry = map.get(r.oid)
    if (r.tax === 'category') entry.categories.push({ name: r.name, slug: r.slug })
    else entry.tags.push(r.name)
  }
  return map
}

// post_id -> relative upload path (YYYY/MM/file.ext) of the featured image.
// _thumbnail_id rows are duplicated in this dump, hence DISTINCT.
export function getFeaturedImages(db) {
  const rows = db
    .prepare(
      `SELECT DISTINCT tm.post_id AS pid, af.meta_value AS rel
       FROM postmeta tm
       JOIN postmeta af ON af.post_id = tm.meta_value AND af.meta_key = '_wp_attached_file'
       WHERE tm.meta_key = '_thumbnail_id'`,
    )
    .all()
  const map = new Map()
  for (const r of rows) if (r.rel) map.set(r.pid, r.rel)
  return map
}

// id -> "parent/child/leaf" slug path, built by walking post_parent.
// Used to place pages at content/<path>.md so the catch-all serves the old URL.
export function buildPagePaths(db) {
  const rows = db
    .prepare(`SELECT ID AS id, post_name AS slug, post_parent AS parent FROM posts`)
    .all()
  const byId = new Map(rows.map((r) => [r.id, r]))
  const cache = new Map()
  const pathOf = (id, seen = new Set()) => {
    if (cache.has(id)) return cache.get(id)
    const node = byId.get(id)
    if (!node || !node.slug || seen.has(id)) return ''
    seen.add(id)
    const parentPath =
      node.parent && node.parent !== '0' ? pathOf(node.parent, seen) : ''
    const full = parentPath ? `${parentPath}/${node.slug}` : node.slug
    cache.set(id, full)
    return full
  }
  const out = new Map()
  for (const r of rows) out.set(r.id, pathOf(r.id))
  return out
}

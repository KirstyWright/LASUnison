// Shared configuration + paths for the WordPress → @nuxt/content migration.
//
// The migration reads the SQLite DB produced by scripts/wp-audit/ (parse_to_sqlite.py)
// and writes Markdown into content/. See docs/migration/README.md for how to build the DB.
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
export const REPO_ROOT = resolve(HERE, '..', '..')

// Source SQLite (override with --db). Built by the wp-audit pipeline into /tmp.
export const AUDIT_DB = '/tmp/audit.db'

// WordPress uploads on disk (the 2026-06-25 pull). Year folders live directly under here.
export const UPLOADS_ROOT = resolve(
  REPO_ROOT,
  '..',
  'old',
  'pull-2026-06-25',
  'site',
  'app82853866',
  'wp-content',
  'uploads',
)

// Output locations.
export const CONTENT_DIR = resolve(REPO_ROOT, 'content')
export const NEWS_DIR = resolve(CONTENT_DIR, 'news')
export const PUBLIC_IMAGES_DIR = resolve(REPO_ROOT, 'public', 'images')
export const REDIRECTS_FILE = resolve(REPO_ROOT, 'app', 'redirects.json')
export const BACKUP_DIR = resolve(HERE, '.backup')

// Canonical live site (used for legacyUrl + as the normalised host for non-image links).
export const SITE = 'https://lasunison.co.uk'

// Every host that means "this site" — uploads under any of these get pulled local.
// The site has lived on .com and .co.uk (and a hyphenated variant); content references all.
export const LOCAL_HOSTS = new Set([
  'lasunison.co.uk',
  'www.lasunison.co.uk',
  'lasunison.com',
  'www.lasunison.com',
  'las-unison.co.uk',
  'www.las-unison.co.uk',
])

// post_author display_names that are NOT real bylines — never write these as `author`.
// (449/482 posts are `las99unison`; only "Tim Stephens" is a genuine name in the data.)
export const AUTHOR_DENYLIST = new Set([
  'las99unison',
  'editor',
  'admin',
  'admin_',
  'dokter',
])

// WP category slug → news `category` (the content-TYPE enum). Everything defaults to "News".
export const CATEGORY_TYPE_MAP = {
  campaign: 'Campaign',
  action: 'Campaign',
}

// WP category slug → news `topic` (subject badge), highest priority first.
// The first WP category a post has that appears here wins; otherwise topic is omitted.
export const TOPIC_PRIORITY = [
  ['pensions', 'Pensions'],
  ['healthandsafety', 'Safety'],
  ['equalities', 'Equality'],
  ['education', 'Education'],
  ['welfare', 'Wellbeing'],
  ['benefits', 'Wellbeing'],
  ['agenda-for-change', 'Pay'],
  ['unsocial-hours', 'Pay'],
  ['pay', 'Pay'],
]

// Pages to never migrate.
//  1539 = WP static front page (the designed homepage owns `/`)
//  5105 = WP "News" archive stub (the /news Vue route owns `/news`)
//  the rest = AnsPress Q&A plugin stubs (feature dropped; empty plugin-internal URLs)
export const SKIP_PAGE_IDS = new Set([
  '1539',
  '5105',
  // questions / FAQ AnsPress subtree (two parallel trees), all empty 10-byte stubs
  '1247', '2929', '2930', '2931', '2932', '3034',
  '4795', '4796', '4797', '4798', '4799', '4800',
  // Legal pages: owned by the hand-authored `legal` collection (content/legal/*) and
  // redirected there from their old URLs in nuxt.config.ts. Do not re-migrate.
  '1199', // about-us/cookie-policy
  '1202', // about-us/privacy-policy
  '1662', // legal-services
])

// Image file extensions we pull local. Other uploads (PDF/Office) are left as live links
// for the separate documents migration.
export const IMAGE_EXT = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif', 'bmp'])

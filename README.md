# Nuxt Content Starter

Look at the [Nuxt Content documentation](https://content.nuxt.com) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Todo

- [ ] Implement Analytics
- [ ] Get branch rep/officer pictures & ensure emails up to date
- [ ] Ensure Rep details are correct
- [ ] Sort out VPS?
- [ ] Sort out smoke test
- [ ] Sort out documentation

## Deployment — 2026 staging prototype (manual, IONOS)

> Notes from the first manual deploy of the static build to **https://2026.lasunison.com**
> (committee preview). Recorded for future reference. See also the hosting notes in
> `CLAUDE.md` and the SEO launch checklist.

**Where it lives.** IONOS managed shared hosting (SFTP/SSH only — **no Node**, PHP/static
only). One webspace; document root is `/homepages/29/d599914938/htdocs`. The `2026`
subdomain isn't given its own docroot in the IONOS panel — instead a **host-scoped rewrite
in the webspace-root `htdocs/.htaccess`** maps `2026.lasunison.com/*` → `htdocs/2026/*`.
The live WordPress site is untouched (it's served from other directories).

**1. Build (staging defaults).** `pnpm generate` is staging-safe out of the box:
`NUXT_PUBLIC_SITE_URL` defaults to `https://2026.lasunison.com` and `NUXT_SITE_INDEXABLE`
defaults to `false`, so the output ships site-wide `noindex` + `robots.txt` `Disallow: /`.
Output goes to `.output/public/` (≈475 MB — the migrated `public/` images + docs dominate).
If you edited existing `content/**` first, clear the cache: `rm -rf .data/content .nuxt`.

**2. Fix the generated `.htaccess` for subfolder serving.** `scripts/build-htaccess.mjs`
emits `public/.htaccess` (≈519 redirects + clean-URL serving) assuming the site is at the
**document root**. Served from the `/2026` subfolder via the host-rewrite it is **not**, so
two rules had to change, and the prototype guards are prepended:

- Clean-URL rule: the generated one uses `%{DOCUMENT_ROOT}/$1/index.html` (here
  `DOCUMENT_ROOT` is the webspace root, not `/2026`) and skips directories (`!-d`). Replace
  with a base-independent version that serves directory-style routes via the absolute
  request URI:

  ```apache
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME}/index.html -f
  RewriteCond %{REQUEST_URI} ^(.*?)/?$
  RewriteRule .* %1/index.html [L]
  ```

  (A *relative* substitution like `$1/index.html` is mis-resolved in this per-directory
  context and 404s every sub-route — use the absolute `%1` form.)
- `ErrorDocument 404 /404.html` → `ErrorDocument 404 /2026/404.html`.
- Prepend the prototype guards: `X-Robots-Tag: noindex…` header, plus a
  `<FilesMatch "^\.ht">` deny. Current state is **search-blocked but publicly viewable**
  (no password). A committee-only HTTP Basic Auth gate was used initially and **removed on
  request (2026-06-26)**. If you re-add Basic Auth (`AuthUserFile …/2026/.htpasswd`,
  `Require valid-user`), note the gotcha: **`.htpasswd` must be chmod 644** — Apache reads
  it via the "other" bit on this host, so `600` → HTTP 500.

**3. Upload + extract.**

```bash
COPYFILE_DISABLE=1 tar --no-xattrs -czf site.tgz -C .output/public .   # exclude .htpasswd
scp -O site.tgz u34900806@home599914938.1and1-data.host:/.../htdocs/2026/   # NOTE: -O !
ssh … 'cd …/htdocs/2026 && tar xzf site.tgz && rm site.tgz'
```

- **`scp -O` is required** — modern OpenSSH `scp` defaults to SFTP-protocol mode, which
  fails on this host ("failed to upload file"); `-O` (legacy protocol) works.
- `.htpasswd` is **kept out of the tarball** so extraction can't wipe the password gate.
- SSH is **password auth only** (`PubkeyAuthentication=no`); the password contains `%`, so
  it can't go in a URL. There's no `sshpass` locally — drive it with `expect`.

**4. Verify** (with creds): homepage, a content page, an extensionless sub-route
(`/membership` — the clean-URL test), an asset (`/_nuxt/*.js`), an image/PDF, an old-slug
301, the `X-Robots-Tag` header, `401` without creds, and `403` on `/.htpasswd`.

**Known quirk:** `/news` (no trailing slash) 301s to `/news/` then serves 200 — harmless
(invisible to users; Nuxt navigates client-side). All other routes serve cleanly without a
slash.

**At launch** (moving to `lasunison.com`): rebuild with the env flags in the SEO launch
checklist (`NUXT_PUBLIC_SITE_URL=https://lasunison.com NUXT_SITE_INDEXABLE=true
SEO_FORCE_CANONICAL=true`), and **remove the prototype guards** (the `noindex` header block
in `/2026/.htaccess`). If the production site is
served from a real document root (panel-assigned), the generated `.htaccess` works as-is —
the subfolder fixes above are only needed for the host-rewrite staging setup.
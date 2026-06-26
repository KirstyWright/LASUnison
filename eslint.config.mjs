// @ts-check
// Flat config layered on top of the project-aware config that @nuxt/eslint
// generates into .nuxt/eslint.config.mjs (run `nuxt prepare`/`dev` to (re)generate
// it). Base config + formatting come from withNuxt(); we add Tailwind best-practice
// rules and a few Vue / code-quality rules pulled from the SnapMedic configs.
import withNuxt from './.nuxt/eslint.config.mjs'
import tailwind from 'eslint-plugin-tailwindcss'

export default withNuxt(
  // ── Tailwind CSS best practices ───────────────────────────────────────────
  // The plugin's `recommended` preset only globs JS/TS/JSX, so it would skip our
  // .vue templates entirely. Register the plugin and apply the rules ourselves,
  // and point `cssConfigPath` at the Tailwind v4 entry so the plugin can read our
  // @theme tokens / @import "tailwindcss" (default is the non-existent src/style.css).
  {
    name: 'unison/tailwindcss',
    files: ['**/*.vue', '**/*.{ts,mts,js,mjs}'],
    plugins: { tailwindcss: tailwind },
    settings: {
      tailwindcss: {
        cssConfigPath: 'app/assets/css/main.css',
      },
    },
    rules: {
      'tailwindcss/classnames-order': 'warn', // deterministic, consistent class order
      'tailwindcss/enforces-shorthand': 'warn', // mx-2 my-2 → m-2
      'tailwindcss/enforces-negative-arbitrary-values': 'warn',
      // Warn (not error): catches genuine conflicts, but false-positives on our
      // intentional a11y focus ring `outline outline-[3px]` (style + width, not a
      // conflict) and on ambiguous arbitrary text-[var(--…)] color-vs-size values.
      'tailwindcss/no-contradicting-classname': 'warn',
      // Off by default: the site defines many bespoke semantic classes in main.css
      // (.las-prose, .article-prose, .las-embed, font helpers…) that aren't @utility
      // /@theme, so this rule is mostly false positives. Flip to 'warn' to police typos.
      'tailwindcss/no-custom-classname': 'off',
    },
  },

  // ── Vue + general code quality (adapted from SnapMedic App/Portal) ──────────
  {
    name: 'unison/rules',
    files: ['**/*.{ts,mts,vue}'],
    rules: {
      // Vue
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/component-definition-name-casing': ['error', 'PascalCase'],
      'vue/no-unused-vars': 'error',
      'vue/prefer-template': 'error',
      'vue/require-default-prop': 'off', // optional props don't need defaults
      // Off: content components (Callout, used as ::callout) and Nuxt pages are
      // intentionally single-word; PascalCase isn't required of them.
      'vue/multi-word-component-names': 'off',

      // General code quality
      'prefer-const': 'error',
      'prefer-template': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // Require === everywhere, but allow the `x == null` idiom (matches null AND
      // undefined in one check), which the codebase uses deliberately.
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
      // Warn (not error): there's a pre-existing backlog of `any` in loosely-typed
      // areas (Leaflet map, search index, sitemap/content data). Kept visible as a
      // burn-down list rather than blocking lint; ratchet to 'error' once cleared.
      '@typescript-eslint/no-explicit-any': 'warn',
      // Off: the codebase favours readable compact guard handlers
      // (`if (e.key === 'Escape') { e.preventDefault(); close() }`); 1-per-line
      // would only add noise with no correctness benefit.
      '@stylistic/max-statements-per-line': 'off',
      // Off: `delete dict[key]` is used correctly for keyed maps (Leaflet markers,
      // route query) where true key removal — not `= undefined` — is intended.
      '@typescript-eslint/no-dynamic-delete': 'off',
    },
  },
)

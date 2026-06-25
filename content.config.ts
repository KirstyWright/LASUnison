import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    // General page content (about, migrated WordPress pages, etc.). News, legal and reps
    // live in their own collections; index.md is the designed homepage (rendered by a Vue
    // page, never the catch-all). All fields optional so legacy/handwritten pages validate.
    content: defineCollection({
      type: 'page',
      source: { include: '**', exclude: ['news/**', 'legal/**', 'reps/**', 'committee/**', 'documents/**', 'links/**', 'index.md'] },
      schema: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        // ISO date (yyyy-mm-dd) — page's last-modified date from WordPress.
        date: z.string().optional(),
        // True for empty WordPress pages migrated as title-only placeholders.
        stub: z.boolean().optional(),
        // Provenance for migrated pages (traceability + future re-taxonomy).
        wpId: z.number().optional(),
        legacyUrl: z.string().optional(),
      }),
    }),

    // Branch document library — editable in Nuxt Studio. One YAML file per
    // document in content/documents/. Editors add a document by creating an
    // entry (title, date, topic, type) and pointing `file` at the uploaded PDF.
    // The PDFs live in public/docs/ (upload via Studio's media manager); the
    // build script seeds existing files. Drives /resources' searchable library.
    documents: defineCollection({
      type: 'data',
      source: 'documents/**',
      schema: z.object({
        title: z.string().describe('Document title shown in the library.'),
        date: z.string().describe('Publish date, ISO yyyy-mm-dd, e.g. 2026-05-15.'),
        topic: z
          .enum([
            'Pay & conditions',
            'Branch & governance',
            'Stewards’ resources',
            'Labour Link',
            'Education & learning',
            'Membership',
            'Welfare',
            'Equality',
            'Environment',
            'Health & safety',
            'Pensions',
            'Legal & forms',
            'Retired members',
            'General',
          ])
          .describe('Subject — drives the colour, icon and the topic filter.'),
        type: z
          .enum(['PDF', 'Word', 'Excel', 'PowerPoint', 'Word template', 'File'])
          .describe('File kind.'),
        file: z
          .string()
          .describe('Path to the file in /public, e.g. /docs/2026/05/foo.pdf — upload it via the media manager.'),
        wpId: z.number().optional().describe('Original WordPress attachment ID (provenance).'),
      }),
    }),

    // Branch reps — editable in Nuxt Studio. One file per record, split into two kinds:
    //   kind='station'  → content/reps/stations/<slug>.yml — a workplace, its elected
    //                     workplace rep(s) (`reps`) and elected H&S rep(s) (`hsReps`).
    //                     `lat`/`lng` are optional: stations with a location get a map pin;
    //                     non-geographic workplaces (NETS, watches, support fns) omit them.
    //   kind='sector'   → content/reps/sectors/<slug>.yml — a sector's display name,
    //                     blurb (`description`), panel `order`, and senior rep(s). The
    //                     sectors and their order live here, not in code, so editors own them.
    // A rep entry is { name, note? }; an empty/omitted array means that role is vacant.
    reps: defineCollection({
      type: 'data',
      source: 'reps/**',
      schema: z.object({
        kind: z.enum(['station', 'sector']).describe('station = a workplace; sector = a branch sector.'),
        name: z.string().describe('Station name, or sector name (e.g. "North West").'),
        sector: z.string().describe('Sector slug this record belongs to, e.g. "north-west".'),
        // station-only
        slug: z.string().optional(),
        area: z.string().optional().describe('Optional sub-area heading within the sector, e.g. "North".'),
        // Other names this workplace is known by — matched in search but not displayed,
        // so e.g. "Clinical Education West" still finds "West Education Centre".
        aliases: z.array(z.string()).optional().describe('Alternate names this workplace is also known by, e.g. "Clinical Education West".'),
        type: z
          .enum([
            'ambulance-station',
            'control-room',
            'headquarters',
            'specialist',
            'nets',
            'workshop',
            'logistics',
            'education',
            'support',
          ])
          .optional(),
        lat: z.number().optional(),
        lng: z.number().optional(),
        // Station: display order within its sector (areas derive their order from this).
        // Sector: order of the sector panel on the page (lower shows first).
        order: z.number().optional().describe('Sort order — lower shows first.'),
        reps: z.array(z.object({ name: z.string(), note: z.string().optional() })).optional(),
        hsReps: z.array(z.object({ name: z.string(), note: z.string().optional() })).optional(),
        // sector-only
        description: z.string().optional().describe('Sector blurb shown under its name — the workplaces it covers.'),
        seniorReps: z.array(z.object({ name: z.string(), note: z.string().optional() })).optional(),
      }),
    }),

    // Branch committee — the elected officers and branch representatives shown on
    // /branch. Designed to be added to / removed from in Nuxt Studio: one YAML
    // file per person, every field beyond name/role/group optional so a new
    // member can be created from the form and refined later. Removing a file
    // simply drops that person from the page.
    //   group='officer' → a branch officer (Secretary, Chair, H&S, Welfare, …).
    //   group='rep'     → a branch representative, grouped by `area` (the seat's sector).
    committee: defineCollection({
      type: 'data',
      source: 'committee/*.yml',
      schema: z.object({
        name: z.string().describe('Full name, e.g. Eddie Brand.'),
        role: z
          .string()
          .describe(
            'Officers: their post (e.g. Welfare Officer). Reps: the seat — "Male Seat" or "Female Seat".',
          ),
        group: z
          .enum(['officer', 'rep'])
          .describe('Officer = branch officer; rep = branch representative.'),
        // Optional so a member can be added without picking a number; lower numbers
        // show first, blank sorts to the end (see (a.order ?? …) in branch.vue).
        order: z.number().optional().describe('Sort order within the group/sector — lower shows first.'),
        // Reps only: which sector the seat covers. Drives the grouping on /branch.
        area: z
          .enum(['west', 'north-central', 'east-central', 'south-east', 'south-west', 'eoc-111'])
          .optional()
          .describe('Reps only: the sector this seat covers.'),
        workplace: z.string().optional().describe('Their base, e.g. Waterloo HQ. Optional.'),
        phone: z.string().optional().describe('Officers only, e.g. 07766 524 972. Optional.'),
        email: z.string().optional().describe('Officers only. Optional.'),
        photo: z
          .string()
          .optional()
          .describe('Path to their photo, e.g. /images/committee/eddie-brand.jpg. Blank = show initials.'),
      }),
    }),

    // Legal / policy pages: privacy, cookies, legal services.
    // Editors can update these in Nuxt Studio without touching code.
    legal: defineCollection({
      type: 'page',
      source: 'legal/**',
      schema: z.object({
        // Page title — used in the <title> tag and the page hero.
        title: z.string(),
        // Short description for SEO meta.
        description: z.string().optional(),
        // ISO date (yyyy-mm-dd) shown as "Last updated" in the page footer.
        lastUpdated: z.string().optional(),
      }),
    }),

    // Branch news: statements, negotiations, reports and campaigns.
    // This is what an editor (e.g. via Nuxt Studio) maintains — each
    // article is one Markdown file in content/news/.
    news: defineCollection({
      type: 'page',
      source: 'news/**',
      schema: z.object({
        // ISO date (yyyy-mm-dd) — formatted for display in the UI.
        date: z.string(),
        // Post type — drives the category label, accent colour and filtering.
        // One of: Statement | Negotiations | Report | Campaign | News
        category: z.string(),
        // Subject tag shown as a badge, e.g. Pay, Pensions, Safety, Wellbeing, Equality.
        topic: z.string().optional(),
        // Card / SEO summary.
        excerpt: z.string(),
        // Who it is from (branch officer, committee, UNISON spokesperson).
        author: z.string().optional(),
        // Approximate reading time in minutes.
        readTime: z.number().optional(),
        // Reserve the 999 register: set true only for genuinely urgent,
        // action-required items (renders in the emergency red treatment).
        urgent: z.boolean().optional(),
        // Optional source link when the full story lives off-site (a PDF report, survey, etc.).
        source: z.string().optional(),
        sourceLabel: z.string().optional(),
        // Subject tags carried over from WordPress (post_tag terms) for future filtering.
        tags: z.array(z.string()).optional(),
        // Featured image, e.g. /images/2026/05/foo.jpg (display is a follow-up UI task).
        image: z.string().optional(),
        // Raw WordPress categories, preserved for later re-taxonomy in Studio.
        wpCategories: z.array(z.string()).optional(),
        // Provenance: WordPress post ID and its original flat URL (redirect source).
        wpId: z.number().optional(),
        legacyUrl: z.string().optional(),
      }),
    }),
  },
})

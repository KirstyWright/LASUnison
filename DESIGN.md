---
name: LAS UNISON
description: The campaigning website of the UK's biggest ambulance union branch — heritage purple-and-green, banner-bold, accessibility-first.
colors:
  unison-purple: "#5E22A6"
  purple-strong: "#491A82"
  purple-band: "#3C1D5D"
  purple-deep: "#341259"
  purple-soft: "#E7DBF7"
  purple-mist: "#F3EDFB"
  lilac-200: "#CBB4ED"
  unison-green: "#00843D"
  green-strong: "#006B33"
  green-mist: "#E0F2E8"
  spark-green: "#1FB866"
  spark-mist: "#DDF6E8"
  nhs-blue: "#005EB8"
  blue-mist: "#E3EFFA"
  emergency-red: "#D5281B"
  red-strong: "#A81B10"
  red-mist: "#FBE3E1"
  warning-amber: "#E08600"
  amber-mist: "#FCEFD6"
  hivis-yellow: "#FFD200"
  ink-strong: "#16121C"
  ink-body: "#2A2433"
  ink-muted: "#5C5468"
  ink-subtle: "#7A7287"
  border-default: "#E2DFE8"
  border-subtle: "#EAE7EF"
  surface-sunken: "#F0EEF3"
  page-bg: "#F8F7FA"
  white: "#FFFFFF"
typography:
  display:
    fontFamily: "Archivo, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(3rem, calc(2rem + 5vw), 4.75rem)"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Archivo, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(2.125rem, calc(1.6rem + 2.6vw), 3rem)"
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Archivo, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Public Sans, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Public Sans, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.08em"
  mono:
    fontFamily: "IBM Plex Mono, ui-monospace, Menlo, monospace"
    fontSize: "1rem"
    fontWeight: 500
rounded:
  xs: "4px"
  sm: "6px"
  md: "10px"
  lg: "14px"
  xl: "20px"
  pill: "999px"
spacing:
  3: "0.75rem"
  4: "1rem"
  5: "1.25rem"
  6: "1.5rem"
  8: "2rem"
  10: "2.5rem"
  12: "3rem"
  16: "4rem"
  20: "5rem"
  24: "6rem"
components:
  button-primary:
    backgroundColor: "{colors.unison-purple}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "0 1.5rem"
    height: "2.75rem"
  button-primary-hover:
    backgroundColor: "{colors.purple-strong}"
  button-highlight:
    backgroundColor: "{colors.spark-green}"
    textColor: "{colors.ink-strong}"
    rounded: "{rounded.pill}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.unison-purple}"
    rounded: "{rounded.pill}"
  button-emergency:
    backgroundColor: "{colors.emergency-red}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
  card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink-body}"
    rounded: "{rounded.lg}"
    padding: "1.25rem 1.25rem 1.5rem"
  badge-default:
    backgroundColor: "{colors.purple-soft}"
    textColor: "{colors.purple-strong}"
    rounded: "{rounded.sm}"
  emergency-bar:
    backgroundColor: "{colors.emergency-red}"
    textColor: "{colors.white}"
    rounded: "{rounded.lg}"
    padding: "1rem 1.5rem"
---

# Design System: LAS UNISON

## 1. Overview

**Creative North Star: "The Branch Banner"**

The site carries itself the way a trade-union branch carries its banner: proud, heritage-bound, and made to be seen at the front of a march. UNISON purple grounds everything; green and a brighter spark green are the rallying accents. Display type is Archivo at 800–900 — banner lettering, loud and unembarrassed — over the quiet, Helvetica-adjacent calm of Public Sans for everything you actually read. The feeling to land is solidarity made visible: almost 7,000 members standing together, a branch that represents, protects and stands up for the people who answer the call.

Underneath the banner there is an operational discipline borrowed from the service itself. Numbers that matter — pay rates, reference numbers, the help-line phone number — are set in IBM Plex Mono so they read as fact, not decoration. The 999-emergency register (a single hard red) is held in reserve and spent only on the genuinely urgent; its rarity is the whole point. Motion is restrained and quick; surfaces lift gently on soft, purple-tinted shadows. The result should read as institutional and trustworthy first, campaigning second — never the other way around.

This system explicitly rejects three things. It is **not corporate / SaaS slick** — no gradient-mesh heroes, no "book a demo" gloss; this is a member union, not a product launch. It is **not a dated gov template** — no grey-box GDS clone or accordion soup; public-sector does not have to mean clunky. And it is **not loud / agitprop** — no all-caps shouting or clip-art megaphones; the conviction shows in clarity and confidence, not volume.

**Key Characteristics:**
- Heritage-led: UNISON purple + green do the identity work; everything else is functional.
- Banner-bold display type (Archivo 800–900) against calm humanist body type (Public Sans).
- Mono for facts: rates, references and phone numbers in IBM Plex Mono.
- The red is earned — emergency register reserved for genuine urgency.
- Accessibility-first: built for a tired reader, mid-shift, on a small bright screen (WCAG 2.2 AA floor).

## 2. Colors

A heritage two-colour brand (purple + green) over warm, faintly purple-tinted neutrals, with a small set of strictly functional accents.

### Primary
- **UNISON Purple** (#5E22A6): the brand's spine. Carries primary buttons, links, and the active-nav state. When it covers a large surface it darkens to **Purple Band** (#3C1D5D) for hero sections and coloured bands (matched to UNISON national), to **Purple Deep** (#341259) for the utility strip and footer, and to **Purple Strong** (#491A82) on button hover.
- **Purple Soft / Mist** (#E7DBF7 / #F3EDFB): tints for soft brand surfaces, badge fills, and section washes. **Lilac 200** (#CBB4ED) is the only purple light enough to use as body text *on* a dark purple ground (the hero subhead).

### Secondary
- **UNISON Green** (#00843D): the second heritage colour. Carries the secondary button, eyebrow/category labels, and "we won this for you" moments. Darkens to **Green Strong** (#006B33) on hover. **Green Mist** (#E0F2E8) for soft success/positive surfaces.

### Tertiary
- **Spark Green** (#1FB866): one bright rallying highlight — the hero's primary CTA, key stat figures, selection highlight. Used sparingly; it is the brightest thing on the page on purpose.
- **NHS Blue** (#005EB8): functional/clinical accent and the focus-ring colour (#005EB8, 3px). Reads as "official / clinical," never as a third brand colour.
- **Emergency Red** (#D5281B): the 999 register — the UNISON Direct help bar, true `alert` states, emergency badges. Deepens to **Red Strong** (#A81B10) on hover.
- **Warning Amber** (#E08600): caution/warning only.
- **Hi-Vis Yellow** (#FFD200): the ambulance battenburg motif **only**.

### Neutral
- **Ink Strong** (#16121C): headings and strong text. A near-black warmed toward purple — never pure black.
- **Ink Body** (#2A2433): default body copy.
- **Ink Muted** (#5C5468) / **Ink Subtle** (#7A7287): secondary text and meta. Both verified ≥4.5:1 on white and on the page bg — do not push muted text lighter than #5C5468 for body-sized copy.
- **Page BG** (#F8F7FA): the warm off-white page surface. **Surface Sunken** (#F0EEF3): recessed wells and hover fills. **White** (#FFFFFF): cards and raised surfaces.
- **Border Default** (#E2DFE8) / **Border Subtle** (#EAE7EF): hairline dividers and card edges.

### Named Rules
**The Earned-Red Rule.** Emergency Red (#D5281B) is reserved for the genuinely urgent — the help line and true alerts. Never use it for general emphasis, decoration, or a "look at this" accent. Its rarity is what gives it force.

**The Hi-Vis Rule.** Hi-Vis Yellow (#FFD200) appears only inside the battenburg motif. It is never a UI colour — not a button, not a highlight, not text.

**The One Heritage Rule.** Purple and green carry the identity. Blue, spark green, red and amber are *functional* — they mean something (clinical, highlight, emergency, warning). Never promote a functional colour to a decorative brand colour.

## 3. Typography

**Display Font:** Archivo (with 'Helvetica Neue', Arial fallback)
**Body Font:** Public Sans (with 'Helvetica Neue', Arial fallback)
**Label/Mono Font:** IBM Plex Mono

**Character:** A deliberate contrast pairing on the weight-and-voice axis. Archivo is a grotesque built to shout in the 800–900 weights — banner lettering for headlines. Public Sans is a calm, Helvetica-adjacent humanist sans that disappears into readable prose. IBM Plex Mono is the third voice: facts and figures, unambiguous. The two sans-serifs are close cousins, so they are kept apart by *role and weight*, never set at similar sizes side by side.

### Hierarchy
- **Display** (Archivo 900, `clamp(3rem, calc(2rem + 5vw), 4.75rem)`, line-height 1, -0.02em): hero headline only. Banner-loud, balanced wrapping.
- **Headline** (Archivo 800, `clamp(2.125rem, calc(1.6rem + 2.6vw), 3rem)`, 1.12, -0.015em): section heads.
- **Title** (Archivo 800, 1.5rem, 1.25, -0.015em): card titles, alert titles.
- **Body** (Public Sans 400, 1rem, 1.55): default prose. Hold measure to 65–75ch (the hero subhead is capped at ~520px).
- **Label** (Public Sans 700, 0.875rem, uppercase, +0.08em tracking): eyebrows, category kickers, badge text, the emergency-bar kicker.
- **Mono** (IBM Plex Mono 500, 1rem): pay rates, reference numbers, phone numbers.

### Named Rules
**The Banner Rule.** Headlines use Archivo 800–900 and never apologise. Letter-spacing on display sits at -0.02em — tight and confident, never looser, never tighter than letters touching.

**The Mono-for-Numbers Rule.** Anything a member might quote back — a pay figure, a case reference, the UNISON Direct number — is set in IBM Plex Mono so it reads as fact.

**The One-Eyebrow Rule.** The uppercase label/eyebrow is a *deliberate* category marker (a news category, the hero's "UK's biggest ambulance branch"). It is not scaffolding to drop above every section. Earn each one.

## 4. Elevation

The system uses real, layered shadows — but they are soft and tinted, never the hard grey drop-shadow of a 2014 app. Every shadow is built from `rgba(22, 18, 28, …)` — the ink-strong hue — at low opacity, so lifts read as warm and purple-adjacent rather than dirty grey. Cards sit flat-ish at rest (`shadow-sm`) and lift to `shadow-lg` with a -3px translate on hover; the hero photo and modals carry the heaviest `shadow-xl`. Depth is a response to state and importance, not a default coat of gloss.

### Shadow Vocabulary
- **xs** (`box-shadow: 0 1px 2px rgba(22,18,28,0.06)`): the header bar, hairline lift.
- **sm** (`0 1px 2px rgba(22,18,28,0.06), 0 2px 4px rgba(22,18,28,0.05)`): cards at rest.
- **md** (`0 4px 8px rgba(22,18,28,0.06), 0 8px 20px rgba(22,18,28,0.07)`): raised panels, popovers.
- **lg** (`0 12px 28px rgba(22,18,28,0.10), 0 4px 10px rgba(22,18,28,0.05)`): card hover.
- **xl** (`0 24px 56px rgba(22,18,28,0.16), 0 8px 18px rgba(22,18,28,0.06)`): hero photo, modals.

### Named Rules
**The Warm-Shadow Rule.** Shadows are tinted with the ink-strong hue (`rgba(22,18,28,…)`), never plain `rgba(0,0,0,…)`. If a shadow looks grey and dirty, it is wrong.

## 5. Components

### Buttons
- **Shape:** fully pill (`border-radius: 999px`) with a 2px border, even on filled variants (transparent border, so they share a footprint with outline). Sizes: sm (h 36px / 0.875rem), md (h 44px / 1rem), lg (h 54px / 1.125rem).
- **Primary:** UNISON Purple (#5E22A6) fill, white text; hover → Purple Strong (#491A82).
- **Highlight:** Spark Green (#1FB866) fill, **ink-strong** text (not white — verified for contrast); the hero's lead CTA.
- **Secondary:** UNISON Green fill, white text. **Accent:** NHS Blue fill. **Emergency:** Emergency Red fill — help/urgent CTAs only.
- **Outline / Ghost:** transparent fill, purple text and (outline) a purple border; hover fills Purple Soft.
- **Motion / Focus:** `transition: background-color 150ms ease-out`; `:active` nudges down 1px; focus-visible draws the shared 3px NHS-blue ring at 2px offset.

### Chips / Badges
- **Style:** small uppercase label (Public Sans 700, 0.75rem, +0.02em) in a soft-tint pill (`radius 6px`). Default = Purple Soft fill / Purple Strong text. Variants map to role tints (secondary/accent/success/warning), plus a solid **emergency** (red fill, white text).
- **Dot option:** a leading `currentColor` dot for status.

### Cards / Containers
- **Corner Style:** 14px (`rounded-lg`), `overflow: hidden`.
- **Background:** white on the page bg; optional top accent strip (1.5px) in a brand colour.
- **Shadow Strategy:** `shadow-sm` at rest → `shadow-lg` + `translateY(-3px)` on interactive hover (see Elevation).
- **Border:** 1px Border Subtle (#EAE7EF), strengthening to Border Default on hover.
- **Internal Padding:** 1.25rem, 1.5rem at the foot. Eyebrow (green) → title (Archivo 800) → meta → body → footer.

### Inputs / Fields
- **Style:** 1px Border Default on white, `radius 10px` (md). (Form fields are nascent; follow the button/card token language when building them.)
- **Focus:** the shared 3px NHS-blue (#005EB8) ring at 2px offset — the one global focus treatment, never removed.

### Navigation
- **Style:** sticky 3-tier header — a dismissible Notice Banner, a Purple-Deep utility strip (branch name + socials + My UNISON), then a white main bar with logo, nav links and the persistent "Join us" primary button.
- **Nav links:** Public Sans 700, 1rem, `radius 10px`; hover fills Surface Sunken; the active item (e.g. Campaigns) is purple. Collapses below `lg`.

### Emergency Bar (signature)
A drenched Emergency-Red (#D5281B) bar carrying the UNISON Direct help line: a circular phone glyph, an uppercase kicker, the number in **Archivo black** as a `tel:` link, and opening hours. It overlaps the hero by -2rem so help is the first solid thing below the fold. This is the one component allowed to own the red.

### Stat (signature)
A big figure in Archivo black (`text-5xl`) over a small label — "7,000 / LAS members", "£4M+ / Won since 1999". On dark surfaces the figure flips to Spark Green with white/lilac labels. The proof that solidarity is countable.

## 6. Do's and Don'ts

### Do:
- **Do** lead with the heritage: UNISON Purple grounds the page, green and spark green rally it.
- **Do** keep the emergency help line (UNISON Direct) reachable within seconds on every screen — help first, fast.
- **Do** set rates, reference numbers and phone numbers in IBM Plex Mono so they read as fact.
- **Do** use Spark Green text (#1FB866) and white on dark purple; on light surfaces keep body text at #2A2433 and muted no lighter than #5C5468 (verified ≥4.5:1).
- **Do** keep the one global focus ring (3px NHS-blue, 2px offset) on every interactive element, and honour `prefers-reduced-motion`.
- **Do** put Archivo 800–900 to work on headlines — confident, tight at -0.02em, balanced wrapping.

### Don't:
- **Don't** make it **corporate / SaaS slick** — no gradient-mesh heroes, no "book a demo" gloss, no glassmorphism by default.
- **Don't** make it a **dated gov template** — no grey-box GDS clone, no accordion soup, no hard grey drop-shadows.
- **Don't** make it **loud / agitprop** — no all-caps body shouting, no clip-art megaphones, no ransom-note layouts. Conviction shows in clarity, not volume.
- **Don't** spend the emergency red on anything but genuine urgency, and **never** use hi-vis yellow as a UI colour (battenburg motif only).
- **Don't** use gradient text (`background-clip: text`) — emphasis comes from Archivo weight and size, a single solid colour.
- **Don't** set the two sans-serifs (Archivo / Public Sans) at similar sizes side by side; separate them by role and weight.
- **Don't** drop an uppercase eyebrow above every section — it's a deliberate category marker, not scaffolding.

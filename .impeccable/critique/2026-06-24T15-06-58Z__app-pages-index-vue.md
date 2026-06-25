---
target: the homepage
total_score: 35
p0_count: 0
p1_count: 1
timestamp: 2026-06-24T15-06-58Z
slug: app-pages-index-vue
---
# Critique — LAS UNISON homepage (`app/pages/index.vue`)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | No active-page indicator in nav; fine for a marketing page |
| 2 | Match System / Real World | 4 | Plain union language; real terms (UNISON Direct, AfC, EOC, ECAs) |
| 3 | User Control and Freedom | 3 | Several nav/CTA links are `#` placeholders (scroll-to-top) |
| 4 | Consistency and Standards | 4 | Cohesive kit (buttons, badges, cards), clean heading order h1→h4 |
| 5 | Error Prevention | 3 | No forms on page; join/survey are external (low risk) |
| 6 | Recognition Rather Than Recall | 4 | Text labels everywhere, no icon-only nav, clear CTAs |
| 7 | Flexibility and Efficiency | 3 | Help reachable fast (emergency bar + triage + mobile menu) |
| 8 | Aesthetic and Minimalist Design | 4 | Strong hierarchy; eyebrow-on-every-section tell removed this pass |
| 9 | Error Recovery | 3 | N/A on homepage (no forms/errors here) |
| 10 | Help and Documentation | 4 | Help-first: UNISON Direct, member support, contact the branch |
| **Total** | | **35/40** | **Good (top of band)** |

## Anti-Patterns Verdict
**LLM:** Does not read as AI-generated. Real branch photography (solidarity, AGM, ambulance, member banner), committed heritage purple/green, banner Archivo headlines, mono for facts. The one genuine tell — a tiny uppercase tracked eyebrow above *every* section (6 of them) — has been removed (hero keeps its single branded kicker).
**Deterministic scan:** `detect.mjs` clean (0 findings) after fixing one `border-l-4` side-tab in `ui/Alert.vue`. The NewsCard featured left-accent is a positioned 6px bar (not a border utility) — borderline but not detector-flagged; owned by the parallel news work.

## What's Working
- **Help-first architecture** — red UNISON Direct bar overlapping the hero, then a scannable triage strip; the number is one tap away in the mobile menu too.
- **Solidarity made visible** — real members-with-placards hero, AGM banner, ambulance campaign lead. Earns the brand's "Branch Banner" north star without stock-photo gloss.
- **Earned red** — red now appears only on UNISON Direct and the genuinely-urgent news flag (collection `urgent` field); the campaign badge was recoloured spark-green.

## Priority Issues
- **[P1] Light text contrast on green (FIXED)** — Join body + link were `text-white/90` on `#00843D` (4.23:1, under AA). Switched to full white (4.81:1). 
- **[P2] Placeholder `#` links** — QuickHelp tiles, "All member support", "Compare benefits", branch events/get-involved, "Already a member", footer, socials all point to `#`. A first-timer or keyboard user lands on a scroll-to-top no-op. Expected at this build stage (destination pages come from the content migration), but should be wired or disabled before launch.
- **[P2] Eyebrow scaffolding (FIXED)** — uppercase kicker above all 6 sections (the AI-grammar tell). Removed from 5 sections; hero keeps the one branded "UK's biggest ambulance branch".
- **[P3] Non-functional search button** — header search icon has an accessible name but no behaviour; activating it does nothing (Sam/Riley).
- **[P3] Featured news placeholder** — the homepage featured card shows a large branded image placeholder until the CMS image lands; prominent but intentional.

## Persona Red Flags
**Jordan (first-timer):** Clear Join CTAs and plain language, but tapping "About Us"/"Resources" (nav) or a QuickHelp tile leads to a `#` no-op — confusing until those pages exist.
**Casey (mobile, mid-shift):** UNISON Direct is in the hamburger menu and the emergency bar; Join is always visible. The emergency bar scrolls away (not sticky) — acceptable since the menu carries the number, but a persistent help affordance would be stronger.
**Sam (a11y / keyboard):** Heading order is clean, focus ring global, images have real alt text, contrast now passes. Remaining: the dead search button and `#` links are focusable no-ops.

## Minor Observations
- "£4 million" appears three times (notice banner, hero stat as £4M+, benefits) — reinforcement, but could vary one.
- The featured-news placeholder dominates at tablet width when the media stacks on top.
- Nav has 6 top-level items (Miller's-law edge, but matches the real branch IA).

## Questions to Consider
- Should the UNISON Direct number be persistently reachable (sticky/floating) on mobile, not just in the menu and the top bar?
- Which destination pages exist first, so the `#` placeholders can become real links rather than scroll-to-top no-ops?
- Does the featured news slot want a text-forward fallback when an article has no image yet?

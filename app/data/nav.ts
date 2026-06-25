/**
 * Nav — the site's information architecture in one place.
 *
 * The WordPress migration brought the *content* across but left most pages
 * reachable only by search. This file is the single source of truth for the
 * primary navigation: it drives the header dropdowns, the `/support` and
 * `/get-involved` hub pages, and the catch-all's "In this section" cross-links,
 * so they can never drift apart.
 *
 * Structure, not prose — kept here (matching app/data/links.ts) rather than
 * hardcoded in components, and a candidate to graduate to a Nuxt Studio Content
 * collection when Studio is connected so editors can reorder the menu directly.
 *
 * Each content path lives in exactly ONE group, so `navGroupForPath` is
 * unambiguous and "In this section" shows a page's true siblings.
 */

export interface NavItem {
  /** Menu / card label. */
  label: string
  /** Site-relative destination, e.g. "/welfare". */
  path: string
  /** Short descriptor shown under the label in dropdowns and on hub cards. */
  note?: string
  /** UiIcon name for the dropdown / card glyph. */
  icon?: string
}

export interface NavGroup {
  id: string
  /** Top-level menu label, e.g. "Your Branch". */
  label: string
  /** The clickable parent route (also the hub/landing page for the group). */
  hub: string
  /** Lead-in shown on the hub page header. */
  intro?: string
  /**
   * Children. Empty ⇒ a plain top-level link with no dropdown (News, Resources).
   */
  items: NavItem[]
}

/* ------------------------------------------------------------------ *
 * Primary navigation
 * ------------------------------------------------------------------ */

export const navGroups: NavGroup[] = [
  {
    id: 'your-branch',
    label: 'Your Branch',
    hub: '/branch',
    intro: 'Who runs the branch, how to reach us, and the rules we work to.',
    items: [
      { label: 'Officers & committee', path: '/branch', note: 'The people elected to run the branch', icon: 'users' },
      { label: 'Find your rep', path: '/find-a-rep', note: 'Your workplace rep by station & sector', icon: 'mapPin' },
      { label: 'About the branch', path: '/about-us', note: 'Who we are and what we do', icon: 'flag' },
      { label: 'Branch rules', path: '/branch-rules', note: 'How the branch is constituted and run', icon: 'scale' },
      { label: 'Calendar & meetings', path: '/calendar', note: 'Branch meetings, AGM and key dates', icon: 'calendar' },
      { label: 'Contact the branch', path: '/about-us/contact-us', note: 'Get in touch with the branch office', icon: 'mail' },
    ],
  },
  {
    id: 'membership-pay',
    label: 'Membership & Pay',
    hub: '/membership',
    intro: 'Joining, your subscription, keeping your details current — and the pay and pension that come with the job.',
    items: [
      { label: 'Join UNISON', path: '/membership', note: 'Why join, and how — in a few minutes', icon: 'userPlus' },
      { label: 'Subscription rates', path: '/subscription-rates', note: 'What membership costs, by salary band', icon: 'banknote' },
      { label: 'Update your details', path: '/update-your-details', note: 'Tell us if your job or address changes', icon: 'users' },
      { label: 'Pay & Agenda for Change', path: '/pay', note: 'NHS pay rates and the AfC bands', icon: 'banknote' },
      { label: 'NHS pension scheme', path: '/nhs-pension-scheme', note: 'Your NHS pension, explained', icon: 'clock' },
      { label: 'Private ambulance staff', path: '/private-ambulances', note: 'You can join UNISON too', icon: 'shield' },
    ],
  },
  {
    id: 'support',
    label: 'Support',
    hub: '/support',
    intro: 'Whatever has happened at work, start here. Representation, legal help, safety, welfare and learning — the support your membership gives you.',
    items: [
      { label: 'Legal services', path: '/legal/legal-services', note: 'Free legal help for you and your family', icon: 'scale' },
      { label: 'Health & safety', path: '/health-safety', note: 'Reporting concerns and your right to a safe job', icon: 'shield' },
      { label: 'Welfare & wellbeing', path: '/welfare', note: 'Hardship grants, debt advice and breaks', icon: 'lifebuoy' },
      { label: 'Education & training', path: '/education', note: 'Courses, learning and rep training', icon: 'graduationCap' },
      { label: 'Book grants', path: '/book-grants', note: 'Help with the cost of course books', icon: 'bookOpen' },
    ],
  },
  {
    id: 'get-involved',
    label: 'Get Involved',
    hub: '/get-involved',
    intro: 'The branch is its members. Become a rep, join a self-organised group, or get active on the issues you care about.',
    items: [
      { label: "Stewards' zone", path: '/stewards-zone', note: 'Tools and resources for reps', icon: 'briefcase' },
      { label: 'Young members', path: '/young-members', note: 'Members aged 27 and under', icon: 'users' },
      { label: 'Environment', path: '/environment', note: 'Greening the NHS and our workplaces', icon: 'heart' },
      { label: 'International', path: '/international', note: 'Solidarity beyond our borders', icon: 'flag' },
      { label: 'Labour Link', path: '/labour-link', note: 'UNISON’s political voice', icon: 'megaphone' },
      { label: 'Retired members', path: '/retired-members', note: 'Staying connected after work', icon: 'award' },
    ],
  },
  { id: 'news', label: 'News', hub: '/news', items: [] },
  { id: 'resources', label: 'Resources', hub: '/resources', items: [] },
]

/* ------------------------------------------------------------------ *
 * Social links — the branch's real accounts, shared by header + footer.
 * (Instagram omitted until a real handle is confirmed.)
 * ------------------------------------------------------------------ */

export interface SocialLink {
  /** UiIcon name, also used as the accessible label. */
  name: string
  href: string
}

export const socials: SocialLink[] = [
  { name: 'facebook', href: 'https://www.facebook.com/lasunison/' },
  { name: 'x', href: 'https://twitter.com/LASUNISON' },
  { name: 'youtube', href: 'https://www.youtube.com/user/UNISONTV' },
]

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

/** Normalise a route path: drop a trailing slash, keep "/". */
function clean(path: string): string {
  return path.replace(/\/+$/, '') || '/'
}

/**
 * The nav group a path belongs to — by exact item match, then by item or hub
 * prefix (so `/pay/high-cost-area-supplements` resolves to Membership & Pay).
 * Returns undefined for pages outside the primary IA.
 */
export function navGroupForPath(path: string): NavGroup | undefined {
  const p = clean(path)
  for (const g of navGroups) {
    if (clean(g.hub) === p) return g
    for (const it of g.items) {
      const ip = clean(it.path)
      if (ip === p || p.startsWith(ip + '/')) return g
    }
  }
  // Second pass: hub-prefix match (e.g. a child page under a hub route).
  for (const g of navGroups) {
    if (g.hub !== '/' && p.startsWith(clean(g.hub) + '/')) return g
  }
  return undefined
}

/**
 * The other pages in this page's section, for "In this section" cross-links.
 * Excludes the current page; returns [] when the page has no group.
 */
export function siblingsForPath(path: string): NavItem[] {
  const group = navGroupForPath(path)
  if (!group) return []
  const p = clean(path)
  return group.items.filter((it) => clean(it.path) !== p)
}

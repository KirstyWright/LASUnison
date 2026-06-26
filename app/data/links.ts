/**
 * Links — the curated link directory for the Resources hub.
 *
 * `quickLinks` are the operational staff tools that used to be buried in the
 * old site's header mega-menu (GRS, The Pulse, ESR …) — the fast-access set a
 * member reaches for mid-shift. `relatedLinks` are the slower reference links
 * from the old Links Page (sister UNISON branches, NHS bodies, ambulance
 * trusts). `resourcePages` are on-site destinations, included so the hub
 * search can act as wayfinding.
 *
 * Structure, not prose — kept here (matching app/data/stations.ts) rather than
 * hardcoded in components. A candidate to graduate to a Nuxt Studio Content
 * collection when Studio is connected, so editors can manage links directly.
 */

export interface SiteLink {
  label: string
  /**
   * Destination. An absolute URL (`https://…`) is treated as external and
   * opens in a new tab; a site-relative path (`/news/…`) is treated as an
   * internal link and routed in-app via NuxtLink.
   */
  url: string
  /** Short descriptor shown under the label on a tile. */
  note?: string
  /** UiIcon name for the tile glyph. */
  icon?: string
}

export interface LinkGroup {
  id: string
  title: string
  intro?: string
  links: SiteLink[]
}

export interface ResourcePage {
  label: string
  path: string
  note?: string
}

/* ------------------------------------------------------------------ *
 * Quick links — staff tools (the header-declutter set)
 * ------------------------------------------------------------------ */

/** The daily-driver tools, rendered as the prominent tiles. */
export const staffTools: LinkGroup = {
  id: 'staff-tools',
  title: 'Staff tools',
  intro: 'The systems you use on shift — straight to the login.',
  links: [
    { label: 'GRS Web', url: 'https://grsext.londonambulance.nhs.uk/', note: 'Rosters & shift swaps', icon: 'calendar' },
    { label: 'LAS Connect', url: 'https://londonambulanceservice.workvivo.com/', note: 'Staff community (Workvivo)', icon: 'users' },
    { label: 'NHS Mail', url: 'https://email.nhs.net/owa', note: 'Webmail (OWA)', icon: 'mail' },
    { label: 'ESR', url: 'https://my.esr.nhs.uk/', note: 'Payslips & e-learning', icon: 'banknote' },
    { label: 'My UNISON', url: 'https://my.unison.org.uk/', note: 'Your membership account', icon: 'userPlus' },
  ],
}

/**
 * Member benefits — the "Benefits" menu copied from the live lasunison.co.uk
 * site, plus the NHS injury/pension links, surfaced at the top of the hub.
 * Items that map to a migrated page (Book Grants, Legal Services, Tax Relief)
 * use an internal path so they route in-app rather than bouncing to the old
 * domain; the rest are the union's external benefit providers.
 */
export const benefits: LinkGroup = {
  id: 'benefits',
  title: 'Member benefits',
  intro: 'Schemes, discounts and entitlements that come with your NHS job and your UNISON membership.',
  links: [
    { label: 'Book Grants', url: '/book-grants', note: 'Branch help towards the cost of course books', icon: 'bookOpen' },
    { label: 'Cashback Shopping', url: 'https://www.unisonrewards.com/', note: 'Earn cashback with UNISON Rewards', icon: 'gift' },
    { label: 'Croyde Bay', url: 'https://www.croydeunison.co.uk/', note: 'UNISON’s Devon holiday resort', icon: 'mapPin' },
    { label: 'Dental Plan', url: 'https://union-benefits.co.uk/youbenefit/', note: 'UNISON dental & health plan', icon: 'heart' },
    { label: 'Latest Discounts', url: 'https://unison.org.uk/benefits', note: 'Exclusive member deals & offers', icon: 'ticket' },
    { label: 'Legal Services', url: '/legal/legal-services', note: 'Free legal help for you and your family', icon: 'scale' },
    { label: 'Member insurance deals', url: 'https://unison.org.uk/benefits/insurance', note: 'Car, home & travel cover for members', icon: 'shield' },
    { label: 'Travel Club', url: 'https://www.unisontravelclub.co.uk/', note: 'Member holiday & travel discounts', icon: 'mapPin' },
    { label: 'Tax relief on UNISON subscriptions', url: '/news/tax-relief-on-unison-subsciptions', note: 'Claim 70% tax relief on your subs', icon: 'banknote' },
    { label: 'UNISON Benefits', url: 'https://benefits.unison.org.uk/', note: 'All member benefits in one place', icon: 'handshake' },
    { label: 'NHS Injury Benefits Scheme', url: 'https://www.nhsbsa.nhs.uk/nhs-injury-benefits-scheme', note: 'Support if you’re injured or made ill at work', icon: 'lifebuoy' },
    { label: 'NHS Pension Scheme', url: 'https://unison.org.uk/get-help/nhs-pension-scheme', note: 'UNISON’s guide to your NHS pension', icon: 'clock' },
  ],
}

/** Secondary quick-link groups, rendered as a compact tile row. */
export const quickLinks: LinkGroup[] = [
  {
    id: 'getting-around',
    title: 'Getting around London',
    links: [
      { label: 'TfL Journey Planner', url: 'https://tfl.gov.uk/plan-a-journey/', note: 'Plan a journey', icon: 'mapPin' },
      { label: 'TfL service status', url: 'https://tfl.gov.uk/tube-dlr-overground/status/', note: 'Live line & road status', icon: 'clock' },
      { label: 'Tube map (PDF)', url: 'https://content.tfl.gov.uk/standard-tube-map.pdf', note: 'Standard map', icon: 'mapPin' },
    ],
  },
  {
    id: 'official-sites',
    title: 'Official sites',
    links: [
      { label: 'London Ambulance Service', url: 'https://www.londonambulance.nhs.uk/', note: 'Trust website', icon: 'shield' },
      { label: 'UNISON Knowledge Base', url: 'https://www.unison.org.uk/get-help/', note: 'Your rights & advice', icon: 'bookOpen' },
      { label: 'UNISON national', url: 'https://www.unison.org.uk/', note: 'Main UNISON site', icon: 'flag' },
      { label: 'NHS.uk', url: 'https://www.nhs.uk/', note: 'NHS UK', icon: 'heart' },
    ],
  },
]

/* ------------------------------------------------------------------ *
 * Related links — reference directory (the old Links Page)
 * ------------------------------------------------------------------ */

export const relatedLinks: LinkGroup[] = [
  {
    id: 'unison-ambulance-branches',
    title: 'UNISON ambulance branches',
    intro: 'Our sister branches across the UK ambulance services.',
    links: [
      { label: 'Scottish Ambulance Service', url: 'https://www.unisonsas.com/' },
      { label: 'Welsh Ambulance Service', url: 'https://welshambulance.unison.site/' },
      { label: 'North West Ambulance Service', url: 'https://www.nwasunison.co.uk/' },
      { label: 'East of England Ambulance', url: 'https://eeas.unison.site/' },
      { label: 'South Western Ambulance Service', url: 'https://swaahb.co.uk/' },
      { label: 'South Central Ambulance Service', url: 'https://southcentralambulance.unison.site/' },
      { label: 'South East Coast Ambulance Service', url: 'https://secamb.unison.site/' },
      { label: 'Yorkshire Ambulance Service', url: 'https://www.uyab.co.uk/' },
      { label: 'West Midlands Ambulance Service', url: 'https://www.wmambo.co.uk/' },
      { label: 'North East Ambulance Service', url: 'https://www.facebook.com/groups/UnisonNEAS/' },
    ],
  },
  {
    id: 'unison-and-unions',
    title: 'UNISON & the wider movement',
    links: [
      { label: 'UNISON home', url: 'https://www.unison.org.uk/' },
      { label: 'UNISON Health', url: 'https://www.unison.org.uk/at-work/health-care/' },
      { label: 'About UNISON', url: 'https://www.unison.org.uk/about/' },
      { label: 'UNISON members’ magazine', url: 'https://magazine.unison.org.uk/' },
      { label: 'TUC — Trades Union Congress', url: 'https://www.tuc.org.uk/' },
    ],
  },
  {
    id: 'health-bodies',
    title: 'Health & NHS bodies',
    links: [
      { label: 'NHS', url: 'https://www.nhs.uk/' },
      { label: 'NHS 111', url: 'https://111.nhs.uk/' },
      { label: 'Health & Care Professions Council (HCPC)', url: 'https://www.hcpc-uk.org/' },
      { label: 'Department of Health & Social Care', url: 'https://www.gov.uk/government/organisations/department-of-health-and-social-care' },
      { label: 'NHS Jobs', url: 'https://www.jobs.nhs.uk/' },
    ],
  },
  {
    id: 'ambulance-trusts',
    title: 'Ambulance services (NHS trusts)',
    links: [
      { label: 'East Midlands Ambulance Service', url: 'https://www.emas.nhs.uk/' },
      { label: 'East of England Ambulance Service', url: 'https://www.eastamb.nhs.uk/' },
      { label: 'London Ambulance Service', url: 'https://www.londonambulance.nhs.uk/' },
      { label: 'North West Ambulance Service', url: 'https://www.nwas.nhs.uk/' },
      { label: 'South Central Ambulance Service', url: 'https://www.scas.nhs.uk/' },
      { label: 'South East Coast Ambulance Service', url: 'https://www.secamb.nhs.uk/' },
      { label: 'South Western Ambulance Service', url: 'https://www.swast.nhs.uk/' },
      { label: 'West Midlands Ambulance Service', url: 'https://wmas.nhs.uk/' },
      { label: 'Yorkshire Ambulance Service', url: 'https://www.yas.nhs.uk/' },
      { label: 'Welsh Ambulance Service', url: 'https://www.ambulance.wales.nhs.uk/' },
      { label: 'Scottish Ambulance Service', url: 'https://www.scottishambulance.com/' },
    ],
  },
]

/* ------------------------------------------------------------------ *
 * On-site destinations — for hub search wayfinding
 * ------------------------------------------------------------------ */

export const resourcePages: ResourcePage[] = [
  { label: 'Forms', path: '/forms', note: 'Commonly used UNISON forms to download' },
  { label: 'Pay rates', path: '/pay', note: 'Ambulance pay rates & Agenda for Change' },
  { label: 'NHS Pension Scheme', path: '/nhs-pension-scheme', note: 'Pensions guidance' },
  { label: 'Find a rep', path: '/find-a-rep', note: 'Your branch reps by station & sector' },
  { label: 'News & updates', path: '/news', note: 'Statements, negotiations & campaigns' },
  { label: 'Branch officers', path: '/branch', note: 'Who runs the branch' },
  { label: 'Join UNISON', path: '/#join', note: 'Become a member' },
]

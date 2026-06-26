/**
 * Stewards' zone — the editable lists behind /stewards-zone.
 *
 * Structure, not prose — kept here (matching app/data/nav.ts and links.ts)
 * rather than hardcoded in the page template, so the rep roles, external tool
 * links, claim forms and software list can be reordered/edited in one place and
 * are a candidate to graduate to a Nuxt Studio Content collection later.
 *
 * Copy is grounded in the migrated content (content/about-us.md,
 * education.md, health-safety.md) and the old stewards-zone page.
 */
import type { SiteLink } from '~/data/links'

/** A rep role tile: SiteLink + the label for its "learn more" action. */
export interface RepRole extends SiteLink {
  /** Action label, e.g. "Find your rep". Falls back to "Learn more". */
  cta?: string
}

/* The reps the zone is for — each links to where its work lives on the site. */
export const repRoles: RepRole[] = [
  {
    label: 'UNISON rep',
    note: 'Your first point of contact at the station. They represent you at work and help sort out problems when they arise.',
    icon: 'users',
    url: '/find-a-rep',
    cta: 'Find your rep',
  },
  {
    label: 'Health & safety rep',
    note: 'Trained to keep your workplace safe and your job sustainable. Report concerns to them and your local management team.',
    icon: 'shield',
    url: '/health-safety',
    cta: 'Health & safety',
  },
]

/* Negotiating & bargaining — UNISON national tools for activists. */
export const bargainingLinks: SiteLink[] = [
  {
    label: 'Bargaining guides',
    note: 'In-depth UNISON guides for negotiating with employers',
    icon: 'bookOpen',
    url: 'https://www.unison.org.uk/get-involved/in-your-workplace/key-documents-tools-activists/bargaining-guides/',
  },
  {
    label: 'Training courses for activists',
    note: 'Get the skills to represent and organise',
    icon: 'graduationCap',
    url: 'https://www.unison.org.uk/get-involved/',
  },
  {
    label: 'Key documents & tools',
    note: 'How bargaining works, explained',
    icon: 'handshake',
    url: 'https://www.unison.org.uk/get-involved/in-your-workplace/key-documents-tools-activists/',
  },
  {
    label: 'UNISON knowledge & advice',
    note: 'Legally checked guidance on rights at work',
    icon: 'scale',
    url: 'https://www.unison.org.uk/get-help/',
  },
]

/* Claim forms — online forms (not downloads), so they stay link tiles. */
export const claimForms: SiteLink[] = [
  {
    label: 'Retirement Grant claim',
    note: 'Apply for the branch retirement function grant',
    icon: 'award',
    url: 'https://www.cognitoforms.com/lasunison/lasunisonretirementfunctionclaim',
  },
  {
    label: 'Education Expenses claim',
    note: 'Claim educational grant expenses',
    icon: 'graduationCap',
    url: 'https://www.cognitoforms.com/lasunison/educationalgrantclaimform',
  },
  {
    label: 'Individual Expenses claim',
    note: 'Submit activist expenses via OLBA',
    icon: 'banknote',
    url: 'https://expenses.olba.org.uk/',
  },
]

/* Free office software — folded in from the old /stewards-zone/free-software. */
export const freeSoftware: SiteLink[] = [
  {
    label: 'Apache OpenOffice',
    note: 'Free office suite that opens our Word templates',
    icon: 'file',
    url: 'https://www.openoffice.org/',
  },
  {
    label: 'GIMP',
    note: 'Free, cross-platform image editor',
    icon: 'image',
    url: 'https://www.gimp.org/',
  },
  {
    label: 'AVG AntiVirus Free',
    note: 'Free virus protection for home computers',
    icon: 'shield',
    url: 'https://www.avg.com/en-gb/free-antivirus-download',
  },
  {
    label: 'Microsoft 365 (Home Use)',
    note: 'Discounted for LAS staff through the HUP; see the Pulse for details',
    icon: 'ticket',
    url: 'https://www.microsoft.com/en-gb/microsoft-365',
  },
]

/* Related on-site destinations for reps — replaces the catch-all "In this section". */
export const relatedLinks: SiteLink[] = [
  { label: 'Find your rep', url: '/find-a-rep', note: 'Your workplace rep by station & sector', icon: 'mapPin' },
  { label: 'Branch officers', url: '/branch', note: 'Who runs the branch, and who to ask', icon: 'users' },
  { label: 'Health & safety', url: '/health-safety', note: 'Reporting concerns and your right to a safe job', icon: 'shield' },
  { label: 'Education & training', url: '/education', note: 'Courses, learning and rep training', icon: 'graduationCap' },
  { label: 'Welfare & wellbeing', url: '/welfare', note: 'Hardship grants, debt advice and breaks', icon: 'lifebuoy' },
  { label: 'All resources', url: '/resources', note: 'The full branch document library', icon: 'file' },
]

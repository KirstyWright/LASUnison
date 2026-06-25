/**
 * Forms — the commonly-used UNISON forms surfaced on /forms.
 *
 * The old WordPress /forms page was a hand-kept bullet list of national UNISON
 * forms (CASE, legal forms, benefits/welfare claims). It's structure, not prose,
 * so it lives here (matching app/data/links.ts) and renders as cards on the page.
 * A candidate to graduate to a Nuxt Studio Content collection once Studio is
 * connected, so editors can manage the list directly.
 *
 * Dates from the old page were inconsistent migration artefacts and have been
 * left off rather than shown wrong; add accurate ones here when known.
 */

export interface FormItem {
  /** Form name, shown as the card title and the link. */
  title: string
  /** Where the form opens (UNISON national site / catalogue / shop). */
  url: string
  /** What the form is for — one or two sentences. */
  description?: string
  /** Optional secondary link, e.g. a guide to completing the form. */
  guide?: { label: string, url: string }
}

export const formsIntro
  = 'Most branch documents live in the document library. These are the national UNISON forms members reach for most often — open or download them directly here.'

export const forms: FormItem[] = [
  {
    title: 'CASE Form',
    url: 'https://www.unison.org.uk/get-involved/in-your-workplace/key-documents-tools-activists/case-form/',
    description:
      'Now an online form. One of the most important documents in UNISON — it should be completed as fully as possible by your local branch.',
  },
  {
    title: 'UNISON legal application form P1',
    url: 'https://shop.unison.site/content/uploads/2019/05/25044.pdf',
    description: 'For cases of injury, illness or disease in the workplace.',
  },
  {
    title: 'Legal form RTA',
    url: 'https://www.unison.org.uk/content/uploads/2013/08/On-line-Catalogue217293.pdf',
    description: 'Road traffic accident claims.',
  },
  {
    title: 'Legal form CR',
    url: 'https://www.unison.org.uk/content/uploads/2022/11/Legal-form-CR.pdf',
    description: 'Criminal injuries and related claims.',
  },
  {
    title: 'Legal form FLA',
    url: 'https://www.unison.org.uk/catalogue/25046',
    description: 'Advice on matters outside employment.',
  },
  {
    title: 'Legal form — conveyancing and wills',
    url: 'https://www.unison.org.uk/catalogue/25047',
    description: 'Free assistance with conveyancing and wills.',
  },
  {
    title: 'Application form for financial assistance',
    url: 'https://www.unison.org.uk/catalogue/22579',
    description:
      'If you are facing unexpected hardship or difficulty. As well as financial assistance we offer debt advice, wellbeing breaks, and a signposting and referral service.',
    guide: {
      label: 'Guide to completing the form',
      url: 'https://www.unison.org.uk/content/uploads/2018/11/Financial-Assistance-Form-information-guide-08-08-18-for-website.docx',
    },
  },
  {
    title: 'UNISON ‘There for You’ application for financial assistance',
    url: 'https://www.unison.org.uk/content/uploads/2014/10/On-line-Catalogue225792.pdf',
    description: 'Apply to the UNISON welfare charity, There for You, for financial assistance.',
  },
  {
    title: 'Benefits — death claim form, guidance & form',
    url: 'https://shop.unison.site/content/uploads/2020/04/Death-Benefit-Claim-Form-Mar-2020-June-2023.docx',
    description: 'Claim the UNISON death benefit.',
  },
  {
    title: 'Benefits — fatal accident claim, guidance & form',
    url: 'https://www.unison.org.uk/content/uploads/2014/11/On-line-Catalogue228572.pdf',
    description: 'Guidance and A4 claim form for the fatal accident benefit.',
  },
  {
    title: 'Political Fund transfer form',
    url: 'https://www.unison.org.uk/catalogue/25446',
    description: 'Transfer between the UNISON political funds.',
  },
]

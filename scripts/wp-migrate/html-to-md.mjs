// WordPress post/page HTML → clean Markdown.
//
// The corpus mixes Gutenberg blocks, classic-editor content (raw text where paragraphs
// are just blank-line-separated — WordPress wraps them with wpautop() at render time),
// and Word-pasted markup. So the pipeline is: strip comments/shortcodes → re-apply
// wpautop so paragraphs survive → flatten layout tables in the DOM → Turndown (+GFM for
// real data tables) → whitespace post-clean.
import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'
import domino from '@mixmark-io/domino'
import he from 'he'

// Block-level tags wpautop must not wrap, and that mark a chunk as already-structured.
const BLOCKS =
  'table|thead|tfoot|caption|col|colgroup|tbody|tr|td|th|div|dl|dd|dt|ul|ol|li|pre|form|map|area|blockquote|address|math|style|p|h[1-6]|hr|fieldset|legend|section|article|aside|hgroup|header|footer|nav|figure|figcaption|details|menu|summary|iframe'
const BLOCK_OPEN = new RegExp(`^<(?:${BLOCKS})[\\s/>]`, 'i')

// ---- pre-clean (string level, before the DOM parse) ------------------------

function stripWrappers(html) {
  let s = html || ''
  s = s.replace(/\r\n|\r/g, '\n')
  s = s.replace(/<!--\s*more\s*-->/gi, '') // classic "read more" marker
  s = s.replace(/<!--\s*\/?wp:[\s\S]*?-->/gi, '') // Gutenberg block delimiters
  s = s.replace(/<!--[\s\S]*?-->/g, '') // any other HTML comments
  s = s.replace(/<(script|style)[\s\S]*?<\/\1>/gi, '') // drop scripts/styles

  // [caption ...]<img ...>Caption text[/caption] -> <figure><img><figcaption>text
  s = s.replace(/\[caption[^\]]*\]([\s\S]*?)\[\/caption\]/gi, (_, inner) => {
    const img = /<img[^>]*>/i.exec(inner)
    if (!img) return '' // caption that only referenced an attachment id — drop
    const text = inner.replace(/<img[^>]*>/i, '').replace(/<[^>]+>/g, '').trim()
    return text ? `<figure>${img[0]}<figcaption>${text}</figcaption></figure>` : img[0]
  })

  // Known media shortcodes -> a plain link/URL so the reference survives.
  s = s.replace(/\[embed[^\]]*\]([\s\S]*?)\[\/embed\]/gi, (_, u) => `\n\n${u.trim()}\n\n`)
  s = s.replace(/\[youtube[^\]]*id=["']?([\w-]+)["']?[^\]]*\]/gi,
    (_, id) => `\n\nhttps://www.youtube.com/watch?v=${id}\n\n`)
  // Strip other shortcodes but keep inner text (e.g. [su_button]Text[/su_button]).
  s = s.replace(/\[(\w[\w-]*)[^\]]*\]([\s\S]*?)\[\/\1\]/gi, (_, _t, inner) => inner)
  s = s.replace(/\[\/?[a-z][\w-]*[^\]]*\]/gi, '')
  return s
}

// A pragmatic port of WordPress wpautop(): blank-line-separated chunks become <p>, and
// single newlines inside text chunks become <br>. Chunks that are already block-level
// (or contain a leading block tag) are left untouched.
function wpautop(html) {
  let s = (html || '').trim()
  if (!s) return ''
  // ensure block tags start/end on their own lines so the split below sees them
  s = s.replace(new RegExp(`(</?(?:${BLOCKS})[^>]*>)`, 'gi'), '\n$1\n')
  const chunks = s.split(/\n\s*\n/).map((c) => c.trim()).filter(Boolean)
  return chunks
    .map((c) => {
      if (BLOCK_OPEN.test(c)) return c // already structured
      return '<p>' + c.replace(/\n/g, '<br>\n') + '</p>'
    })
    .join('\n\n')
}

// ---- layout-table flattening (DOM level) -----------------------------------
// Old posts nest single-cell tables purely for layout. Flatten those to their content
// (so they don't become ugly 1-cell pipe tables); leave genuine data tables for GFM.

const BLOCK_IN_CELL = 'p, div, ul, ol, table, h1, h2, h3, h4, h5, h6, blockquote'

function isLayoutTable(node) {
  if (node.querySelector('table')) return true // nested table => layout
  const rows = Array.from(node.querySelectorAll('tr'))
  if (rows.length < 2) return true
  let maxCols = 0
  for (const tr of rows) {
    const cells = Array.from(tr.querySelectorAll('th, td'))
    if (cells.length > maxCols) maxCols = cells.length
    for (const c of cells) if (c.querySelector(BLOCK_IN_CELL)) return true
  }
  return maxCols < 2
}

// Presentational attributes that only add noise to the Markdown — stripped from every node.
const DROP_ATTRS = [
  'style', 'class', 'width', 'height', 'border', 'cellspacing', 'cellpadding',
  'valign', 'align', 'dir', 'bgcolor', 'color', 'face', 'lang',
]

// Promote a headerless data table's first row from <td> to <th> so GFM emits a pipe table
// (turndown-plugin-gfm only converts tables that have a heading row).
function promoteHeaderRow(doc, table) {
  if (table.querySelector('th')) return
  const firstRow = table.querySelector('tr')
  if (!firstRow) return
  for (const td of Array.from(firstRow.querySelectorAll('td'))) {
    const th = doc.createElement('th')
    while (td.firstChild) th.appendChild(td.firstChild)
    td.parentNode.replaceChild(th, td)
  }
}

function prepareDom(html) {
  const doc = domino.createDocument(`<!DOCTYPE html><html><body>${html}</body></html>`)
  for (const el of Array.from(doc.querySelectorAll('*')))
    for (const attr of DROP_ATTRS) el.removeAttribute(attr)

  // Flatten layout tables (innermost first); leave genuine data tables for GFM.
  let changed = true
  while (changed) {
    changed = false
    for (const table of Array.from(doc.querySelectorAll('table'))) {
      if (table.querySelector('table')) continue
      if (!isLayoutTable(table)) continue
      const container = doc.createElement('div')
      for (const cell of Array.from(table.querySelectorAll('th, td'))) {
        const block = doc.createElement('div')
        while (cell.firstChild) block.appendChild(cell.firstChild)
        container.appendChild(block)
      }
      table.parentNode.replaceChild(container, table)
      changed = true
    }
  }

  // Remaining tables are genuine data tables — ensure each has a heading row.
  for (const table of Array.from(doc.querySelectorAll('table'))) promoteHeaderRow(doc, table)

  return doc.body.innerHTML
}

// ---- Turndown setup --------------------------------------------------------

function makeTurndown(media) {
  const td = new TurndownService({
    headingStyle: 'atx',
    hr: '---',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
    strongDelimiter: '**',
    linkStyle: 'inlined',
  })
  td.use(gfm)
  // Keep only super/subscript (real semantic content with no Markdown form). small,
  // address, u, abbr are processed so their text shows and inner links get rewritten.
  td.keep(['sup', 'sub'])
  td.remove(['script', 'style', 'noscript'])

  // Wrap a URL in <> when it contains spaces or parens, so Markdown link parsing survives
  // (common in legacy /wp-content/uploads/... document paths).
  const mdUrl = (u) => (/[\s()]/.test(u) ? `<${u}>` : u)

  td.addRule('image', {
    filter: 'img',
    replacement: (_c, node) => {
      const src = node.getAttribute('src') || ''
      if (!src) return ''
      const alt = (node.getAttribute('alt') || '').trim()
      return `![${alt}](${mdUrl(media.rewrite(src, 'inline'))})`
    },
  })

  td.addRule('link', {
    filter: (node) =>
      node.nodeName === 'A' && node.getAttribute('href') && node.getAttribute('href') !== '#',
    replacement: (content, node) => {
      const text = content.trim()
      if (!text) return ''
      return `[${text}](${mdUrl(media.rewrite(node.getAttribute('href'), 'link'))})`
    },
  })

  td.addRule('figure', {
    filter: 'figure',
    replacement: (content) => '\n\n' + content.trim() + '\n\n',
  })
  td.addRule('figcaption', {
    filter: 'figcaption',
    replacement: (content) => {
      const t = content.trim()
      return t ? `\n*${t}*\n` : ''
    },
  })

  td.addRule('iframe', {
    filter: 'iframe',
    replacement: (_c, node) => {
      const src = node.getAttribute('src') || ''
      const url = src.startsWith('//') ? 'https:' + src : src
      return url ? `\n\n[Embedded media](${url})\n\n` : ''
    },
  })

  return td
}

// ---- post-clean (Markdown level) -------------------------------------------

function postClean(md) {
  let s = md || ''
  s = s.replace(/ /g, ' ') // nbsp -> space
  s = s.replace(/\*\*\*\*/g, '') // merge adjacent bold runs (turndown butts ** together)
  s = s.replace(/^(\s*)-\s{2,}/gm, '$1- ') // turndown pads bullets with 3 spaces
  s = s.replace(/[ \t]+\n/g, '\n') // trailing whitespace
  s = s.replace(/\n{3,}/g, '\n\n') // collapse blank runs
  s = s.replace(/\\([.\-+#()\[\]])/g, '$1') // undo turndown over-escaping
  s = s
    .split('\n')
    .filter((line) => !/^\s*(\*\*?|-)\s*$/.test(line)) // drop empty emphasis/bullet noise
    .join('\n')
  return s.trim() + '\n'
}

// ---- public API ------------------------------------------------------------

export function htmlToMarkdown(html, media) {
  const td = makeTurndown(media)
  const prepared = prepareDom(wpautop(stripWrappers(html)))
  return postClean(td.turndown(prepared))
}

// Plain text (entities decoded, tags + shortcodes stripped) — used for excerpts.
export function plainText(html) {
  const s = stripWrappers(html).replace(/<[^>]+>/g, ' ')
  return he.decode(s).replace(/\s+/g, ' ').trim()
}

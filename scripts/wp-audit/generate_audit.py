#!/usr/bin/env python3
"""
Generate the migration-audit CSV inventories from the SQLite DB built by
parse_to_sqlite.py.

Writes into docs/migration/:
  pages.csv      every WordPress page (post_type=page)
  posts.csv      every news post (post_type=post)
  categories.csv every taxonomy term (category, post_tag, member_*)
  documents.csv  the document library (post_type=mdocs-posts)
  people.csv     the officers/reps/stewards directory (post_type=member)

Each row carries a pre-filled "Suggested" disposition plus empty decision
columns (Decision / Target / Notes) for a human to fill in a spreadsheet.

Usage:
    python3 generate_audit.py <audit.sqlite> <out_dir> [site_url]
"""
import csv
import html
import os
import re
import sys

SITE = "https://lasunison.com"
FRONT_PAGE_ID = "1539"  # options.page_on_front

# News categories whose posts are more reference-like / likely worth keeping.
EVERGREEN = {
    "pensions", "welfare", "education", "benefits", "membership",
    "stewards-resources", "healthandsafety",
}

TAG_RE = re.compile(r"<[^>]+>")
WS_RE = re.compile(r"\s+")


def u(s):
    """Decode HTML entities for human-readable display (WP stores '&amp;' etc.)."""
    return html.unescape(s) if s else s


def text_of(markup):
    if not markup:
        return ""
    t = TAG_RE.sub(" ", markup)
    return WS_RE.sub(" ", html.unescape(t)).strip()


def wordcount(html):
    t = text_of(html)
    return len(t.split()) if t else 0


def first_line(html):
    t = text_of(html)
    return t[:80]


def year_of(date):
    return date[:4] if date else ""


def fetch(cur, q, args=()):
    cur.execute(q, args)
    return cur.fetchall()


def main():
    import sqlite3
    db, out = sys.argv[1], sys.argv[2]
    site = sys.argv[3] if len(sys.argv) > 3 else SITE
    os.makedirs(out, exist_ok=True)
    con = sqlite3.connect(db)
    cur = con.cursor()

    # Static front page, read from the DB (falls back to the 2020 dump's value).
    fp = fetch(cur, "SELECT option_value FROM options WHERE option_name='page_on_front'")
    front_page_id = (fp[0][0] if fp and fp[0][0] else FRONT_PAGE_ID)

    # ---- lookups -----------------------------------------------------------
    # post_name + parent for every post (for hierarchical page URLs)
    name_parent = {r[0]: (r[1] or "", r[2] or "0")
                   for r in fetch(cur, "SELECT ID, post_name, post_parent FROM posts")}

    def page_url(pid):
        parts = []
        seen = set()
        cur_id = pid
        while cur_id and cur_id != "0" and cur_id in name_parent and cur_id not in seen:
            seen.add(cur_id)
            slug, parent = name_parent[cur_id]
            if not slug:
                break
            parts.append(slug)
            cur_id = parent
        return site + "/" + "/".join(reversed(parts)) if parts else ""

    # featured images
    featured = {r[0] for r in fetch(
        cur, "SELECT post_id FROM postmeta WHERE meta_key='_thumbnail_id'")}
    # page templates
    template = {r[0]: r[1] for r in fetch(
        cur, "SELECT post_id, meta_value FROM postmeta WHERE meta_key='_wp_page_template'")}

    # terms per object, split by taxonomy
    def terms_by_object(taxonomy):
        out_map = {}
        rows = fetch(cur, """
            SELECT tr.object_id, t.name
            FROM term_relationships tr
            JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
            JOIN terms t ON tt.term_id = t.term_id
            WHERE tt.taxonomy = ?
        """, (taxonomy,))
        for oid, name in rows:
            out_map.setdefault(oid, []).append(name)
        return out_map

    cats = terms_by_object("category")
    tags = terms_by_object("post_tag")
    mcat = terms_by_object("member_category")
    mloc = terms_by_object("member_location")

    cat_slugs = {}  # post_id -> set of category slugs
    for oid, names in cats.items():
        cat_slugs[oid] = set()
    slug_rows = fetch(cur, """
        SELECT tr.object_id, t.slug
        FROM term_relationships tr
        JOIN term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
        JOIN terms t ON tt.term_id = t.term_id
        WHERE tt.taxonomy = 'category'
    """)
    for oid, slug in slug_rows:
        cat_slugs.setdefault(oid, set()).add(slug)

    # ---- pages.csv ---------------------------------------------------------
    rows = fetch(cur, """
        SELECT ID, post_title, post_name, post_status, post_parent,
               post_date, post_modified, post_content
        FROM posts WHERE post_type='page' ORDER BY post_status, post_title
    """)
    with open(os.path.join(out, "pages.csv"), "w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["ID", "Title", "Slug", "Old URL", "Status", "Parent",
                    "Template", "Words", "Featured img", "Modified",
                    "Suggested", "Decision", "New route", "Priority", "Notes"])
        for (pid, title, slug, status, parent, pdate, pmod, content) in rows:
            parent_title = ""
            if parent and parent != "0" and parent in name_parent:
                pt = fetch(cur, "SELECT post_title FROM posts WHERE ID=?", (parent,))
                parent_title = pt[0][0] if pt else parent
            if pid == front_page_id:
                sug = "Keep (homepage)"
            elif status == "publish":
                sug = "Keep"
            elif status == "private":
                sug = "Review (private)"
            elif status == "draft":
                sug = "Review (draft)"
            elif status == "trash":
                sug = "Drop (trashed)"
            else:
                sug = "Review"
            w.writerow([pid, u(title), slug, page_url(pid), status, u(parent_title),
                        template.get(pid, "default"), wordcount(content),
                        "Y" if pid in featured else "", pmod[:10] if pmod else "",
                        sug, "", "", "", ""])

    # ---- posts.csv ---------------------------------------------------------
    rows = fetch(cur, """
        SELECT ID, post_title, post_name, post_status, post_date, post_content
        FROM posts WHERE post_type='post' ORDER BY post_date DESC
    """)
    with open(os.path.join(out, "posts.csv"), "w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["ID", "Title", "Slug", "Old URL", "Date", "Year",
                    "Categories", "Tags", "Words", "Featured img",
                    "Suggested", "Decision", "Target collection", "Notes"])
        for (pid, title, slug, status, pdate, content) in rows:
            yr = year_of(pdate)
            wc = wordcount(content)
            pcats = cat_slugs.get(pid, set())
            if status != "publish":
                sug = "Drop (%s)" % status
            elif wc < 15:
                sug = "Drop (stub)"
            elif yr >= "2019":
                sug = "Keep (recent)"
            elif pcats & EVERGREEN:
                sug = "Keep (evergreen)"
            elif yr >= "2017":
                sug = "Review"
            else:
                sug = "Archive"
            w.writerow([pid, u(title), slug, site + "/" + (slug or ""), pdate[:10] if pdate else "",
                        yr, " | ".join(u(c) for c in cats.get(pid, [])),
                        " | ".join(u(t) for t in tags.get(pid, [])),
                        wc, "Y" if pid in featured else "", sug, "", "", ""])

    # ---- categories.csv ----------------------------------------------------
    rows = fetch(cur, """
        SELECT t.name, t.slug, tt.taxonomy, tt.parent, tt.count
        FROM term_taxonomy tt JOIN terms t ON tt.term_id = t.term_id
        WHERE tt.taxonomy IN ('category','post_tag','member_category','member_location')
        ORDER BY tt.taxonomy, CAST(tt.count AS INT) DESC
    """)
    parent_name = {r[0]: r[1] for r in fetch(
        cur, "SELECT term_id, name FROM terms")}
    with open(os.path.join(out, "categories.csv"), "w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["Name", "Slug", "Taxonomy", "Posts", "Suggested",
                    "Decision", "New section / merge into", "Notes"])
        for (name, slug, tax, parent, count) in rows:
            c = int(count) if str(count).isdigit() else 0
            if tax == "category":
                if slug == "uncategorized":
                    sug = "Drop"
                elif c >= 10:
                    sug = "Keep"
                else:
                    sug = "Review / merge"
            elif tax == "post_tag":
                sug = "Review (consolidate)"
            elif tax == "member_category":
                sug = "Keep (station)"
            else:
                sug = "Review"
            w.writerow([u(name), slug, tax, count, sug, "", "", ""])

    # ---- documents.csv -----------------------------------------------------
    # The 2020 site stored documents as the `mdocs-posts` CPT; the live site
    # dropped that plugin, so its documents are now PDF/Office files in the media
    # library (post_type=attachment). Use whichever the dump actually has.
    KEEP_HINTS = ("form", "application", "template", "claim", "poster",
                  "grant", "agm", "constitution", "policy")
    DOC_MIME = ("pdf", "msword", "wordprocessing", "spreadsheet", "excel",
                "presentation", "officedocument", "opendocument")
    attached = {r[0]: r[1] for r in fetch(
        cur, "SELECT post_id, meta_value FROM postmeta WHERE meta_key='_wp_attached_file'")}

    doc_rows = fetch(cur, """
        SELECT ID, post_title, post_name, post_status, post_date, ''
        FROM posts WHERE post_type='mdocs-posts' ORDER BY post_date DESC
    """)
    doc_source = "mdocs-posts CPT"
    if not doc_rows:
        doc_source = "media attachments (pdf/office)"
        mime_clause = " OR ".join("post_mime_type LIKE '%%%s%%'" % m for m in DOC_MIME)
        doc_rows = fetch(cur, """
            SELECT ID, post_title, post_name, post_status, post_date, post_mime_type
            FROM posts WHERE post_type='attachment' AND (%s)
            ORDER BY post_date DESC
        """ % mime_clause)

    with open(os.path.join(out, "documents.csv"), "w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["ID", "Title", "Slug", "Date", "Type", "File / URL",
                    "Suggested", "Decision", "Notes"])
        for (pid, title, slug, status, pdate, mime) in doc_rows:
            low = (title or "").lower()
            if any(h in low for h in KEEP_HINTS):
                sug = "Keep (form/reference)"
            elif (pdate or "")[:4] >= "2019":
                sug = "Keep (recent)"
            else:
                sug = "Review by date"
            rel = attached.get(pid, "")
            file_url = (site + "/wp-content/uploads/" + rel) if rel else ""
            kind = (mime or "").split("/")[-1] if mime else "document"
            w.writerow([pid, u(title), slug, pdate[:10] if pdate else "",
                        kind, file_url, sug, "", ""])
    print("  documents source:", doc_source, "(%d rows)" % len(doc_rows))

    # ---- people.csv (officers / reps / stewards) ---------------------------
    emails = {r[0] for r in fetch(
        cur, "SELECT post_id FROM postmeta WHERE meta_key='_pta_member_directory_email' AND meta_value<>''")}
    phones = {r[0] for r in fetch(
        cur, "SELECT post_id FROM postmeta WHERE meta_key='_pta_member_directory_phone' AND meta_value<>''")}
    rows = fetch(cur, """
        SELECT ID, post_title, post_status, post_content
        FROM posts WHERE post_type='member' ORDER BY post_title
    """)
    with open(os.path.join(out, "people.csv"), "w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["ID", "Name", "Role (from content)", "Station / group",
                    "Has email", "Has phone", "Suggested", "Decision", "Notes"])
        for (pid, title, status, content) in rows:
            station = " | ".join(u(x) for x in (mcat.get(pid, []) + mloc.get(pid, [])))
            w.writerow([pid, u(title), first_line(content), station,
                        "Y" if pid in emails else "", "Y" if pid in phones else "",
                        "Review (still active?)", "", ""])

    con.close()
    print("Wrote pages.csv, posts.csv, categories.csv, documents.csv, people.csv to", out)


if __name__ == "__main__":
    main()

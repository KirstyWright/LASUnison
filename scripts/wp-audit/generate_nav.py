#!/usr/bin/env python3
"""
Reconstruct the WordPress navigation menus from the audit SQLite DB and write a
human-readable tree to docs/migration/navigation.md.

WP stores each menu entry as a `nav_menu_item` post; its position is `menu_order`,
its parent entry is postmeta `_menu_item_menu_item_parent`, and its target is
described by `_menu_item_type` / `_menu_item_object` / `_menu_item_object_id` /
`_menu_item_url`. Menu membership is the `nav_menu` taxonomy.

Usage:
    python3 generate_nav.py <audit.sqlite> <out_md>
"""
import html
import sys
import sqlite3


def u(s):
    return html.unescape(s) if s else (s or "")


def main():
    db, out = sys.argv[1], sys.argv[2]
    con = sqlite3.connect(db)
    cur = con.cursor()

    title_by_id = {}
    slug_by_id = {}
    type_by_id = {}
    for pid, t, s, pt in cur.execute(
            "SELECT ID, post_title, post_name, post_type FROM posts"):
        title_by_id[pid] = u(t)
        slug_by_id[pid] = s or ""
        type_by_id[pid] = pt
    term_name = {tid: u(n) for tid, n in cur.execute("SELECT term_id, name FROM terms")}

    # postmeta for menu items
    meta = {}
    for post_id, k, v in cur.execute(
            "SELECT post_id, meta_key, meta_value FROM postmeta WHERE meta_key LIKE '_menu_item_%'"):
        meta.setdefault(post_id, {})[k] = v

    # menu_order + title for nav_menu_item posts
    item_info = {}
    for pid, t, mo in cur.execute(
            "SELECT ID, post_title, menu_order FROM posts WHERE post_type='nav_menu_item'"):
        try:
            order = int(mo)
        except (TypeError, ValueError):
            order = 0
        item_info[pid] = {"title": u(t), "order": order}

    # menus: term_taxonomy rows with taxonomy=nav_menu, plus their items via
    # term_relationships. Materialise both queries first — a nested query on the
    # same cursor would truncate the outer iteration.
    menu_rows = cur.execute(
        "SELECT term_taxonomy_id, term_id, count FROM term_taxonomy WHERE taxonomy='nav_menu'"
    ).fetchall()
    items_by_ttid = {}
    for ttid, oid in cur.execute(
            "SELECT term_taxonomy_id, object_id FROM term_relationships").fetchall():
        items_by_ttid.setdefault(ttid, []).append(oid)

    menus = []
    for ttid, term_id, count in menu_rows:
        name = term_name.get(term_id, "menu %s" % term_id)
        items = [i for i in items_by_ttid.get(ttid, []) if i in item_info]
        menus.append((name, int(count) if str(count).isdigit() else len(items), items))

    menus.sort(key=lambda m: -m[1])

    def target(pid):
        m = meta.get(pid, {})
        typ = m.get("_menu_item_type", "")
        obj = m.get("_menu_item_object", "")
        oid = m.get("_menu_item_object_id", "")
        if typ == "custom":
            return m.get("_menu_item_url", "")
        if typ == "taxonomy":
            return "[term] %s" % term_name.get(oid, oid)
        if typ == "post_type":
            t = title_by_id.get(oid, "")
            s = slug_by_id.get(oid, "")
            kind = type_by_id.get(oid, obj)
            return "[%s] %s  →/%s" % (kind, t, s)
        return ""

    def label(pid):
        lbl = item_info[pid]["title"]
        if lbl:
            return lbl
        m = meta.get(pid, {})
        oid = m.get("_menu_item_object_id", "")
        return title_by_id.get(oid, "(item %s)" % pid)

    lines = ["# Old site navigation (reconstructed)", "",
             "Reconstructed from the `nav_menu` taxonomy + `nav_menu_item` posts in the",
             "WordPress export. This is the **intended information architecture** of the old",
             "site — use it to design the new nav. The old theme used a mega-menu, so several",
             "of these menus were combined visually.", "",
             "_%d menus with items._" % len([m for m in menus if m[2]]), ""]

    for name, count, items in menus:
        if not items:
            continue
        lines.append("## %s  (%d items)" % (name, len(items)))
        # build tree by parent
        parent_of = {}
        for pid in items:
            parent_of[pid] = meta.get(pid, {}).get("_menu_item_menu_item_parent", "0")
        children = {}
        for pid in items:
            par = parent_of[pid]
            if par not in item_info:  # top level (parent 0 or outside this menu)
                par = "0"
            children.setdefault(par, []).append(pid)
        for kids in children.values():
            kids.sort(key=lambda p: item_info[p]["order"])

        def emit(pid, depth):
            indent = "  " * depth
            lines.append("%s- **%s** — %s" % (indent, label(pid), target(pid)))
            for c in children.get(pid, []):
                emit(c, depth + 1)

        for pid in children.get("0", []):
            emit(pid, 0)
        lines.append("")

    with open(out, "w") as fh:
        fh.write("\n".join(lines) + "\n")
    print("Wrote", out)
    con.close()


if __name__ == "__main__":
    main()

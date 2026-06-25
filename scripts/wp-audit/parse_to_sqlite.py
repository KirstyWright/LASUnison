#!/usr/bin/env python3
"""
Load selected WordPress tables from a phpMyAdmin/MariaDB SQL dump into a local
SQLite database.

The big dump uses MySQL escaping (\\', \\\\, \\n ...) and batched multi-row
INSERTs whose string values can contain literal newlines, commas, parens and
semicolons. A naive line/regex split corrupts that data, so this tokenizes the
INSERT VALUES char-by-char with full awareness of MySQL string escapes, then
inserts the parsed rows into SQLite via parameter binding (no dialect issues).

Usage:
    python3 parse_to_sqlite.py <input.sql> <output.sqlite> [table-prefix]

`table-prefix` defaults to gEYLYEmF (the 2020 lasunison.com dump); pass
l19465s5l3 for the live lasunison.co.uk dump (db821367137).

Only tables whose name (after the prefix) is in TABLES below are imported.
"""
import re
import sys
import sqlite3

PREFIX = sys.argv[3] if len(sys.argv) > 3 else "gEYLYEmF"
TABLES = {
    "posts", "postmeta", "terms", "term_taxonomy", "term_relationships",
    "termmeta", "options", "users", "name_directory", "name_directory_name",
    "connections", "connections_meta", "formmaker", "ap_qameta", "ap_activity",
    "wpbdp_listings", "wpbdp_form_fields",
}

# Matches the start of an extended INSERT at the beginning of a line, in BOTH
# dialects we see:
#   phpMyAdmin:  INSERT INTO `pfxposts` (`ID`, `post_author`, ...) VALUES
#   mysqldump:   INSERT INTO `pfxposts` VALUES            (no column list)
# The column group is optional; when absent we fall back to the CREATE TABLE order.
INSERT_RE = re.compile(
    r"(?m)^INSERT INTO `(?P<tbl>" + re.escape(PREFIX) + r"\w+)`"
    r"(?:\s*\((?P<cols>[^)]*)\))?\s+VALUES\s+",
)

# Captures the body of each CREATE TABLE so we can recover column order for
# mysqldump's column-less INSERTs. Column lines start with a backtick; key /
# constraint lines (PRIMARY KEY, KEY, UNIQUE KEY, ...) do not.
CREATE_RE = re.compile(
    r"(?ms)^CREATE TABLE `(?P<tbl>" + re.escape(PREFIX) + r"\w+)` \((?P<body>.*?)\n\) ",
)


def create_columns(data):
    """short table name -> ordered column list, parsed from CREATE TABLE."""
    out = {}
    for m in CREATE_RE.finditer(data):
        short = m.group("tbl")[len(PREFIX):]
        cols = []
        for line in m.group("body").splitlines():
            s = line.strip()
            if s.startswith("`"):
                end = s.find("`", 1)
                if end > 0:
                    cols.append(s[1:end])
        out[short] = cols
    return out

ESCAPES = {
    "n": "\n", "r": "\r", "t": "\t", "0": "\0",
    "\\": "\\", "'": "'", '"': '"', "Z": "\x1a", "b": "\b",
}


def parse_value_tuples(s, i):
    """Parse `(...),(...),...;` starting at index i.
    Returns (rows, end_index, clean) where clean is True iff parsing stopped at a
    terminating ';' (i.e. the whole statement was consumed without a malformed
    tuple forcing an early break)."""
    rows = []
    n = len(s)
    clean = False
    while i < n:
        while i < n and s[i] in " \t\r\n,":
            i += 1
        if i >= n:
            break
        if s[i] == ";":
            clean = True
            break
        if s[i] != "(":
            break
        i += 1  # consume '('
        row = []
        while True:
            while i < n and s[i] in " \t\r\n":
                i += 1
            c = s[i]
            if c == "'":
                i += 1
                buf = []
                while i < n:
                    ch = s[i]
                    if ch == "\\":
                        nxt = s[i + 1]
                        buf.append(ESCAPES.get(nxt, nxt))
                        i += 2
                    elif ch == "'":
                        if i + 1 < n and s[i + 1] == "'":  # doubled '' -> '
                            buf.append("'")
                            i += 2
                        else:
                            i += 1
                            break
                    else:
                        buf.append(ch)
                        i += 1
                row.append("".join(buf))
            else:
                j = i
                while i < n and s[i] not in ",)":
                    i += 1
                tok = s[j:i].strip()
                row.append(None if tok == "NULL" else tok)
            while i < n and s[i] in " \t\r\n":
                i += 1
            if i < n and s[i] == ",":
                i += 1
                continue
            if i < n and s[i] == ")":
                i += 1
                break
            # malformed / unexpected end of tuple
            break
        rows.append(row)
    return rows, i, clean


def main():
    src, dst = sys.argv[1], sys.argv[2]
    with open(src, "r", encoding="utf-8", errors="replace") as fh:
        data = fh.read()

    con = sqlite3.connect(dst)
    cur = con.cursor()
    create_cols = create_columns(data)
    created = set()
    totals = {}
    stmts = {}
    dirty = {}

    for m in INSERT_RE.finditer(data):
        full_tbl = m.group("tbl")
        short = full_tbl[len(PREFIX):]
        if short not in TABLES:
            continue
        if m.group("cols"):  # phpMyAdmin: explicit column list
            cols = [c.strip().strip("`") for c in m.group("cols").split(",")]
        else:                # mysqldump: recover order from CREATE TABLE
            cols = create_cols.get(short)
            if not cols:
                print(f"  WARN {short}: column-less INSERT and no CREATE TABLE — skipped",
                      file=sys.stderr)
                continue
        rows, _, clean = parse_value_tuples(data, m.end())
        stmts[short] = stmts.get(short, 0) + 1
        if not clean:
            dirty[short] = dirty.get(short, 0) + 1
            print(f"  WARN {short}: INSERT did not terminate cleanly on ';'",
                  file=sys.stderr)
        if not rows:
            continue
        if short not in created:
            col_defs = ", ".join(f'"{c}"' for c in cols)
            cur.execute(f'DROP TABLE IF EXISTS "{short}"')
            cur.execute(f'CREATE TABLE "{short}" ({col_defs})')
            created.add(short)
        placeholders = ", ".join("?" for _ in cols)
        # guard against any tuple whose arity drifted from the column list
        good = [r for r in rows if len(r) == len(cols)]
        bad = len(rows) - len(good)
        if bad:
            print(f"  WARN {short}: skipped {bad} malformed tuple(s)", file=sys.stderr)
        cur.executemany(
            f'INSERT INTO "{short}" VALUES ({placeholders})', good
        )
        totals[short] = totals.get(short, 0) + len(good)

    con.commit()
    print("Imported row counts (rows / INSERT stmts / stmts that broke early):")
    for t in sorted(totals):
        print(f"  {t}: {totals[t]} rows / {stmts.get(t,0)} stmts / {dirty.get(t,0)} broke")
    con.close()


if __name__ == "__main__":
    main()

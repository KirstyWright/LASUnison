#!/usr/bin/env bash
# Slice only the tables needed for the content audit out of the full WordPress
# SQL dump. The full dump is ~1.3 GB (Wordfence logs, Jetpack backups, sessions,
# etc.); this keeps the downstream parse to seconds.
#
# Usage: bash slice.sh <full-dump.sql> <output-subset.sql> [table-prefix]
#   table-prefix defaults to gEYLYEmF (the 2020 lasunison.com dump). For the live
#   lasunison.co.uk dump (db821367137) pass l19465s5l3.
set -euo pipefail

SRC="${1:?usage: slice.sh <full-dump.sql> <output-subset.sql> [prefix]}"
OUT="${2:?usage: slice.sh <full-dump.sql> <output-subset.sql> [prefix]}"
PREFIX="${3:-gEYLYEmF}"   # real table prefix in this export (not the default wp_)

# LC_ALL=C: dumps contain binary blobs (Wordfence IP logs etc.); without a byte
# locale, BSD awk aborts with "multibyte conversion failure" and truncates output.
LC_ALL=C awk -v pfx="$PREFIX" '
BEGIN{
  # tables to keep (without prefix). Core WP tables drive the audit; the directory
  # plugin tables (name_directory/connections/...) are kept for ad-hoc inspection.
  split("posts postmeta terms term_taxonomy term_relationships termmeta options users \
         name_directory name_directory_name connections connections_meta formmaker \
         ap_qameta ap_activity wpbdp_listings wpbdp_form_fields", a, " ");
  for(i in a) want[pfx a[i]]=1;
  cap=0;
}
/^-- Table structure for table `/{
  t=$0; sub(/^-- Table structure for table `/,"",t); sub(/`.*/,"",t);
  cap=(t in want)?1:0;
}
cap{print}
' "$SRC" > "$OUT"

echo "Wrote subset: $OUT"
grep -aoE 'CREATE TABLE `[^`]+`' "$OUT" || true

#!/bin/sh
# Print the repository licence (GitHub licence API, SPDX id) of every upstream project used.
for r in nodejs/node microsoft/playwright GoogleChrome/lighthouse dequelabs/axe-core GoogleChrome/web-vitals firebase/firebase-tools mysql/mysql-server adoptium/temurin21-binaries WebKit/WebKit mozilla-firefox/firefox chromium/chromium google/osv-scanner PostgREST/postgrest supabase/auth theseus-rs/postgresql-binaries postgres/postgres google/libphonenumber publicsuffix/list wooorm/dictionaries LibreOffice/dictionaries supabase/postgres endoflife-date/endoflife.date geonames/geonames web-platform-dx/web-features pemistahl/lingua-rs; do
  printf "%s " "$r"
  gh api "repos/$r/license" --jq '[.license.spdx_id, .license.name, .path] | join(" | ")' 2>&1 | head -1
done

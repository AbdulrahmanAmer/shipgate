#!/bin/sh
# Independent re-check (curl + sha256sum) of a few manifest entries. Usage: sh verify-sample.sh <repoRoot>
# Prints OK/DIFF per entry with manifest vs recomputed sha256 and byte count.
ROOT="$1"
HERE=$(dirname "$0")
check() {
  line=$(node "$HERE/manifest-get.mjs" "$ROOT/toolchain/manifest.json" "$1" "$2") || { echo "MISSING $1 $2"; return; }
  url=$(echo "$line" | cut -d' ' -f1); want=$(echo "$line" | cut -d' ' -f2); wsize=$(echo "$line" | cut -d' ' -f3)
  got=$(curl -sSL "$url" | tee /tmp/wp102-verify.bin | sha256sum | cut -d' ' -f1)
  n=$(wc -c < /tmp/wp102-verify.bin)
  rm -f /tmp/wp102-verify.bin
  if [ "$got" = "$want" ] && [ "$n" = "$wsize" ]; then echo "OK   $1 $2 $got $n"; else echo "DIFF $1 $2 manifest=$want/$wsize recomputed=$got/$n"; fi
}
check firefox windows-x64
check mysql linux-x64-gnu
check jre linux-x64-musl
check public-suffix-list any
check libphonenumber-metadata any
check axe-core any
check osv-scanner linux-x64-musl

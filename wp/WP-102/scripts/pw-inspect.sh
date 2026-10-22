#!/bin/sh
# Fetch playwright-core's tarball into an empty dir and extract browsers.json + the registry source.
set -e
D="$1"
rm -rf "$D"; mkdir -p "$D"
curl -sSL -o "$D/pwc.tgz" "https://registry.npmjs.org/playwright-core/-/playwright-core-$2.tgz"
cd "$D"
tar -xzf pwc.tgz package/browsers.json package/package.json package/lib/server/registry/index.js
ls -R package | head -20

# WP-102 — spec problems and proposals

Each item: the spec line, what I observed, the change I propose. Nothing here was worked around silently; where the test forced a shape I say so. Facts are in `wp/WP-102/sourcing.md`.

## 1. 03 § 19 shape: `extensions`, `unavailable.json`, `unpackTo` for single files

- Spec line: `{ formatVersion, items: [{ name, version, platform, url, sha256, size, licence, purpose, refresh?, unpackTo, requires: [] }] }`; the same section says PostgreSQL/MySQL "(with `extensions[]`)".
- Observed: the shape omits `extensions`, which the test and § 19's prose require on PostgreSQL items; `toolchain/unavailable.json` is not described anywhere in the spec; "otherwise a single file stored as is" does not say whether `unpackTo` names the file or its directory.
- Proposal: add `extensions?: string[]` to the item shape; specify `unavailable.json` as `{ items: [{ name, platform, version?, locale?, reason, fallback }] }` (I added optional `version` and `locale`, because PostgreSQL 15 lacks only windows-arm64 and Hunspell lacks only fi/ja/zh); state that for single-file items `unpackTo` is the file path (what the draft does: e.g. `osv-scanner/osv-scanner`, `firebase-emulators/cloud-firestore-emulator-v1.22.0.jar`).

## 2. No rule for "managed Chromium / Node / JRE absent on this OS"

- Spec lines: TR-001 "where builds exist"; TST-008 `skipped(no-browser)` for a *secondary* browser without a managed build; AEO-013 / search-engines "no browser → `skipped(no-browser)`" for specific rules.
- Observed: Playwright has no musl/Alpine build of Chromium, Firefox or WebKit (all four musl-less rows in `unavailable.json`). Lighthouse, RTE-017, SE-*, UX and several packs need a browser; there is no single statement of what a Linux-musl host gets. The `unavailable.json` `fallback` for these entries cites TST-008 and the per-rule outcomes, which is the nearest text, not a rule for the primary browser.
- Proposal: add one sentence to § 19 (or 04 § 6): on a platform with no managed Chromium every rule with gate/tool `browser` or `lighthouse` is `skipped(no-browser)` and `doctor` names the platform; or declare linux-musl unsupported for browser rules.

## 3. Data snapshots that cannot be a downloaded artifact (`npm-deprecations`, `registry-publish-times`, `wordpress-vulnerabilities`)

- Spec lines: § 19 "Data snapshots ... `fetch` downloads the current `snapshots.json` ... signed with the vendor release key"; "npm `deprecated` metadata for packages in the project's lockfiles only"; SEC-052 "deprecated according to the offline registry snapshot fetched by `shipgate fetch`"; SEC-053 `age` "per the registry snapshot fetched by `shipgate fetch`"; SEC-073 "offline WordPress vulnerability snapshot fetched by `shipgate fetch`".
- Observed:
  - npm deprecation flags and publish times exist only per package in registry packuments. The only bulk sources are the npm CouchDB replica (not usable as a snapshot) and ecosyste.ms's packages dump (63,693,845,834 bytes, CC-BY-SA-4.0, last built 2026-02-05, so stale and share-alike). A manifest item (fixed URL, sha256, size) cannot represent "query the registry for the packages in this project's lockfiles".
  - Wordfence Intelligence's free feed is v3 only and requires an account API key (v2: 410 Gone; v3: 401 "API key must be supplied using a Bearer token"; terms bar sharing the key). No keyless public feed exists; WPScan is commercial. So this snapshot is **BLOCKED** until the Operator owns a key and has confirmed redistribution terms.
- Proposal (decision for the Operator): (a) make the registry snapshots project-scoped, built by `shipgate fetch` from live registry queries for the lockfile packages and stored in the cache (not part of the signed `snapshots.json`), keeping SEC-052/053's `*-unknown` W parts for what could not be fetched; or (b) have the vendor release pipeline build and sign a top-N-packages snapshot (the popular-packages lists of WP-104 are a ready index) and host it. Same for WordPress: the vendor builds and signs the snapshot from an Operator-held Wordfence key, after a terms check. Until decided, the three items are in `unavailable.json` with reasons.

## 4. OSV is eight archives, not one `osv-db`

- Spec/test: a single `osv-db` snapshot; `snapshots.json` items are keyed by `name`.
- Observed: osv-scanner's offline mode reads one `all.zip` per ecosystem (`<ecosystem>/all.zip`: npm 218,817,334 bytes; PyPI 36.8 MB; Maven 10.4 MB; Go 12.6 MB; Packagist 11.0 MB; RubyGems 5.2 MB; crates.io 3.6 MB; NuGet 2.7 MB). The all-ecosystems `all.zip` is 2,786,370,430 bytes (includes Linux, Debian, Ubuntu...), too big to be the default.
- What I did: `osv-db` = the **npm** archive (the test needs that name); the other seven are `osv-db-pypi`, `osv-db-crates-io`, `osv-db-go`, `osv-db-packagist`, `osv-db-rubygems`, `osv-db-maven`, `osv-db-nuget`. Proposal: rename the test's `osv-db` entry to the eight real names (or define `osv-db` as a group), and add the per-ecosystem names to § 19's list. The versions in these entries are the object's hourly Last-Modified; sha256/size are today's bytes and go stale within the hour (they are seed values that `fetch` replaces).

## 5. npm packages: one tarball is not an installable package

- Spec line: § 19 "npm packages are fetched from the npm registry by exact version and integrity hash at `fetch` time".
- Observed: the manifest item for `lighthouse` is one tarball; its closure is 114 packages. `firebase-tools` 633, `@firebase/rules-unit-testing` 87 (+ `firebase` 86), `playwright` 2, `axe-core` 1, `web-vitals` 1 (`npm install --package-lock-only --ignore-scripts`). The npm registry publishes sha512 integrity, never sha256, so the manifest's sha256 for each tarball is my own hash (matched against the registry sha512).
- Proposal: decide how WP-401 installs these: (a) ship a pinned `package-lock.json` per tool in the release (integrity hashes inside) and `npm ci` it with the managed Node; manifest items then name the lockfile (data) instead of a tarball; or (b) keep top-level tarball items and let WP-401 resolve the rest by lockfile at `fetch` time. Either way the lockfiles need a source step that I can add on request (generate with `--package-lock-only`, commit under `toolchain/`). Not done here because the brief limits my outputs to the three files.

## 6. `supabase-schema-ddl` has no vendor URL (04 § 4.4 says the DDL is shipped by shipgate)

- Spec line: 04 § 4.4 "Shipped as versioned DDL in the toolchain"; owner WP-704 ("schema prep DDL").
- Observed: shipgate's own DDL does not exist yet, so it has no URL/sha256. The test requires an item.
- What I did: the item points at the **upstream reference** (supabase/postgres commit `6abbd33892a9...` archive; its `migrations/db/init-scripts/` hold the initial, auth and storage schema scripts and post-setup). When WP-704 authors the shipgate DDL, this entry should be re-pointed at the release asset. Note the managed Supabase Auth binary runs its own `auth` schema migrations; the DDL only needs the roles, schemas, functions and publication of 04 § 4.4.

## 7. D-010 locale set vs Hunspell availability (CQ-007)

- D-010 lists ar, cs, da, de, en, es, fi, fr, it, ja, ko, nb, nl, pl, pt, ro, ru, sv, tr, zh.
- Observed: Hunspell dictionaries exist for 17 of 20: 16 in wooorm/dictionaries (`hunspell-dictionaries`, one archive), Arabic only in LibreOffice/dictionaries (two files, items `hunspell-ar-aff`/`hunspell-ar-dic`, because an item is a single URL). Finnish, Japanese and Chinese have none. CQ-007 already says a locale without a dictionary falls to 04 § 15 *Page locale* (no entry); I cite that in `unavailable.json`.
- Proposal: nothing to change in CQ-007; update § 19's list with the dictionaries and the `-ar-` pair, and tell the WP-410 builder that `hunspell-dictionaries` unpacks to `hunspell/dictionaries-<commit>/dictionaries/<locale>/index.{aff,dic}` (the archive keeps its top-level directory) and Arabic to `hunspell/ar/index.{aff,dic}`. If Finnish matters, a Voikko-derived Hunspell file (GPL) is the lead to follow; I did not find or fetch one.

## 8. Tree-sitter grammars: which are downloaded

- Spec lines: § 19 lists "tree-sitter grammars" in the manifest; 02 § 4 says the code languages (TS/JS, Python, Ruby, PHP, Go, Java, Kotlin, C#, Rust, HTML, CSS) run through `ast-grep-core` and the template grammars (vue, svelte, astro, embedded-template, twig, blade, jinja2) are separate.
- Observed: prebuilt wasm exists for vue and embedded_template (and most code languages) in the npm package `tree-sitter-wasms` 0.1.13 (36 files); svelte, twig, blade, jinja2 ship C source only; no astro package exists. The draft manifest has the one `purpose: "grammar"` item `tree-sitter-wasms`; the five missing ones are in `unavailable.json` with the regexSinks fallback of 02 § 4.
- Proposal: WP-103 records which grammars it needs as wasm; the release pipeline builds the missing ones from pinned sources (versions in sourcing.md) and the manifest gains one `grammar` item each. Also decide whether `tree-sitter-wasms`' mixed grammar licences need an audit (I did not).

## 9. `deny.toml` / 05 § 8 allow-list vs the root store crate (SEC-056)

- Spec line: 05 § 8 compiled-in dependencies must be MIT, Apache-2.0, BSD, ISC, Zlib, Unicode-3.0, PostgreSQL; SEC-056 "bundled Mozilla root store".
- Observed: `webpki-roots` 1.0.10 (and `webpki-root-certs`) are **CDLA-Permissive-2.0**, outside the list. `rustls-native-certs` would use the host store, not a bundled one.
- Proposal (Operator): add CDLA-Permissive-2.0 to 05 § 8 and `deny.toml` (it is a permissive data licence with a notice requirement), or vendor the curl.se Mozilla extract. Needed before WP-414 adds the crate.

## 10. Platform and extension coverage facts that the spec's wording assumes away

- Managed-binary gaps by platform (all verified, see `unavailable.json`): PostgREST and Supabase Auth have no Windows ARM64 build; Supabase Auth has no Windows or macOS x64 build at all; MySQL has no Windows ARM64 and no musl build; PostgreSQL 15 has no Windows ARM64 build; no browser on musl. 04 § 4.4 already says Auth is "where builds exist for the OS". Note that a Windows host therefore never has a managed Supabase Auth, and a macOS Intel host neither.
- PostgreSQL extensions (04 § 4.2 step 2: "Missing in the pinned build → BLOCKED"): the theseus-rs builds contain only the contrib set (48 to 51 extensions per build). Absent in all builds: `vector` (pgvector), `postgis`, `pg_cron`, `pg_graphql`, `pgsodium`, `pg_net`, `pgjwt`, `pg_jsonschema`, `supabase_vault`, `plv8`, `timescaledb`, `pg_partman`, `pgaudit`. `uuid-ossp` is absent on **both Windows builds for PostgreSQL 16-18** and on Windows x64 for 15, although migrations written for Supabase use it routinely (`pgcrypto`'s `gen_random_uuid()` is present). Consequence: Supabase-style projects that create `vector`, `pg_graphql`, `pg_net`, `supabase_vault` will be BLOCKED on every platform, and any project that creates `uuid-ossp` on Windows. Decide whether that is acceptable, or add a second PostgreSQL source with those extensions (I found none that is portable and checksummed).
- Windows ARM64 browsers are the x64 builds under emulation (Playwright's own behaviour). The `macos-*` platform id cannot select WebKit by macOS version.

## 11. Firebase emulator jars are proprietary

`firebase-emulators`, `-database`, `-storage-rules` are Google-owned binaries distributed under Firebase terms (no licence file ships with them). They are fetched from Google's bucket with vendor-published SHA-256 and never redistributed, so 05 § 8 ("Runtime-fetched tools come from official sources, not redistributed") covers shipgate, but the licence field is `LicenseRef-Firebase-Terms-of-Service` and the Operator should confirm that running them on a customer's behalf in `verify` is within those terms. Also: `@firebase/rules-unit-testing` 6.0.0 requires Node >= 24.12 (the pinned Node 24.22.1 satisfies it); `firebase-tools` needs Java >= 21 (hence JRE 21).

## 12. Items the test pinned that are not what their name suggests

- `firebase-emulators` = the Cloud Firestore emulator jar; the Realtime Database jar and the Storage rules runtime are separate items, as are `firebase-tools`, `firebase-rules-unit-testing` and `firebase` (its peer dependency). The Auth emulator lives inside `firebase-tools`.
- `playwright` is the `playwright` npm tarball; `playwright-core` is a separate required item.

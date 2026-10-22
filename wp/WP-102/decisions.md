# WP-102 — orchestrator decisions on the builder's open points

| Point | Decision |
|---|---|
| OSV ships as 8 per-ecosystem archives | Accepted: one data item per ecosystem (`osv-db` = npm, the others named per ecosystem). |
| npm packages (Lighthouse, Playwright, firebase-tools) need their full dependency closure | Assigned to WP-401: the toolchain installs each npm tool from a pinned lockfile committed under `toolchain/npm/<tool>/` with `npm ci --ignore-scripts` (integrity-checked); the manifest item is the lockfile's root package. |
| `npm-deprecations`, `registry-publish-times`: no bulk artifact exists | Accepted as listed in `unavailable.json`: `fetch` queries the registry per package for the packages in the project's lockfiles only (03 § 19 already scopes npm deprecation to lockfile packages); SEC-052/053 report `deprecated-unknown`/`age-unknown` (W) for packages it couldn't fetch. Spec text aligned in the WP-104 batch. |
| `wordpress-vulnerabilities`: Wordfence v2 gone (410), v3 needs a per-account API key | **BLOCKED on the Operator**: create a Wordfence Intelligence API key and confirm its terms allow a derived offline snapshot (or pick another feed). Until then SEC-073 reports `version-unknown`-style W only, never a pass. |
| Postgres builds have only contrib extensions (no `vector`, `postgis`, `pg_graphql`, `pg_net`, `supabase_vault`; no `uuid-ossp` on Windows) | Known limitation, already specified: 04 § 4.2 step 2 blocks with the missing list and points to `external` databases (BUILD_MAP § 8 risk row). WP-403/WP-704 decide whether shipgate builds its own bundles. |
| `webpki-roots` is CDLA-Permissive-2.0 | Accepted (permissive data licence): added to `deny.toml` (D-008). |
| `supabase-schema-ddl` points at upstream scripts | WP-704 writes shipgate's own DDL. |
| No managed Chromium for a platform (musl) | Covered: a missing toolchain is an operator-owned BLOCKED environment cause (04 § 15), and reduced runs need the signed policy (04 § 1.6). |
| Hunspell: no fi, ja, zh dictionaries | Covered by 04 § 15 *No entry* for CQ-007 (operator-owned W finding, since CQ-007 is W). |
| UNPROVEN: Windows ARM64 browsers are the x64 builds; Temurin/MySQL licence strings from knowledge; Firebase emulator jars proprietary (fetched, not redistributed, 05 § 8) | Accepted with the record; WP-401's `doctor` runs each tool once per platform in CI before release. |

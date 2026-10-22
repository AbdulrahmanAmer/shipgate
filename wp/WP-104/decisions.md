# WP-104 — orchestrator decisions on the parts' spec questions

Applied to the spec in one batch when WP-104 closes (one `spec/CHANGES.md` entry), together with any data-file edits listed here. Nothing below is open: each item is accepted (with the edit) or rejected (with the reason).

## Part b (`spec-changes-b.md`)
| # | Decision | Spec edit | Data edit |
|---|---|---|---|
| 1 | accept: drop `formatVersion` from the 04 § 13 `secret-patterns.json` shape (03 § 1 exempts `rules/**`) | 04 § 13 shape → `{ patterns: [{ id, provider, regex }] }` | remove `formatVersion` from `rules/secret-patterns.json` |
| 2 | accept the shape `[{ provider, kind: "literal"\|"regex", pattern }]` | CFG-004: name `live-key-prefixes.json` and its shape | — |
| 3 | accept `[{ vendor, host }]` (03 § 3.3 host pattern) | A11-018 | — |
| 4 | accept `host: "*"` (any host) and `queryPattern?` (Rust regex over the query string) | 05 § 3.2 `writeApi` shape | — |
| 5 | accept `{path}` = the protected path | SEC-021 `override-headers` rewrite mode | — |
| 6 | accept: `ecosystem` ids are the 03 § 15 `dependencies.json` ecosystems | SEC-027 | — |
| 7 | reject a spec change: package-manager pins are read from the fixed fields OPS-009 itself names (`packageManager`, lockfile version), not from `runtime-pins.json` | — | — |
| 8 | accept: for cargo, the source string `registry+https://github.com/rust-lang/crates.io-index` (and the sparse `sparse+https://index.crates.io/`) is crates.io; `github.com` is never a cargo registry host | SEC-053 `registry` | `registries.json` cargo entry notes it if needed |
| 9 | no change (spec string verified live) | — | — |
| 10 | accept: path-style regional S3 `s3.*.amazonaws.com` | SEC-079 shipped list | add to `object-storage-hosts.json` |
| 11 | accept a field type `array` (value `["sg-ma-{n}"]`) | SEC-036 types | `permissions` → `array` in `mass-assignment-fields.json` |
| 12 | accept the provider/check vocabulary the part used | SEC-066 | — |
| 13 | accept: `jsonPath` is evaluated on the lockfile parsed to JSON (YAML lockfiles included); both pnpm v9 paths stay | SEC-053 `install-scripts` | — |

Part b UNPROVEN items (authored without a fetched source: EqualWeb/Max Access hosts, three debug-path signatures, Braintree/Adyen sandbox markers, Wix host and IndexNow endpoints in `write-apis.json`): accepted as experimental data — every rule ships `experimental` until its corpus passes (04 § 14), so a wrong entry surfaces as a corpus or dogfood false positive, not a release blocker. Listed in `rules/provenance.json` as `LicenseRef-shipgate-authored`.
`wp-lockout-signatures.json`: the strings are short factual messages, not copyrightable expression; no plugin code is copied. Accepted.

## Part a (`spec-changes-a.md`)
All "state the shape / rule in the spec" proposals are accepted as written by the part (items 1, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13): the spec text is amended to the shape the data uses, in the batch. Specific decisions:
- 2 `schemaorg.json` (CC-BY-SA-3.0): kept as a separate data file under its own licence with attribution (names and relations only, no descriptions); distributed as a fetched data snapshot (03 § 19 `purpose: "data"`, `refresh: "fetch"`) rather than compiled into the binary, so the closed binary isn't an adaptation of it. WP-102's manifest gets a `schemaorg` data item (I add it if WP-102 doesn't).
- 8 `geo-headers.json`: `ip-api` is not an npm package → removed from the shipped `packages` list (the spec example is corrected); `x-country-code` stays as a header some apps read, described as "custom header set by reverse proxies".
- 9 SE-107: reworded — `shippingDetails` and `hasMerchantReturnPolicy` are recommended (SE-101 `recommended`); SE-107 owns only the organisation-level return-policy fallback. SE-101 `recommended` skips entries covered by a satisfied `anyOf`.
- 11 `engine-crawlers.json`: add `honoursRobots` (default true); SE-010 `decision` skips rows with `false`.
- 13 `placeholder-handles.json`: one leading `@` is stripped before comparison (MET-011 `social`); the `@` duplicates are removed from the file.
- `gsc-indexed-states.json`: `da`, `ko`, `nb`, `ro` are empty because no source exists; an empty list is the 04 § 15 *No entry* outcome for that locale (ROL-003 then reports `notConfigured(indexing-export-locale)` unless another locale matches), never a silent pass. Recorded, not hidden.
- SE-501 example "Google Fonts": GreatFire reports both Fonts hosts reachable → the example list in SE-501 is changed to hosts the shipped `china-blocked-hosts.json` actually lists.
- UNPROVEN rows (special-announcement, vehicle-listing, Bing property lists, Bytespider `honoursRobots`, social-host handle segments, local-listing regions) ship as experimental data (04 § 14), listed in provenance as authored/inferred.

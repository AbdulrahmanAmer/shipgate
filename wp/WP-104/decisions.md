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

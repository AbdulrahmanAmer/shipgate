# Cross-file requests — from privacy-a11y-perf — round 06 pass A

Each request: target file · location · exact edit · finding it serves.

## X1 — spec/03-formats.md § 3.5 (pack keys table, `privacy` row, "No default" column)
Old: `` `legalPages`, `consent.banner`, `ccpa.gpcIndicator`, `accountData`, `audience.ageGate` ``
New: `` `legalPages`, `consent.banner`, `ccpa.gpcIndicator`, `accountData`, `audience.ageGate`, `digitalProductPaths` ``
Serves: concreteness-privacy-a11y-perf.md #16 (PRV-025 digital exemption now keyed on Operator-owned `privacy.digitalProductPaths`).

## X2 — spec/03-formats.md § 10 (flow step table, `expectEmail` row)
Old: `` | `expectEmail` | `{ to, subjectContains, linkMatches? }` → `{email.link}` | ``
New: `` | `expectEmail` | `{ to, subjectContains, linkMatches?, attachment?: bool }` → `{email.link}`; with `attachment: true` the first attachment is captured to the run dir like an `expectDownload` file (PRV-016 export) | ``
Serves: #10 (PRV-016 part `export` reads an `expectEmail` attachment; 03 § 10 had no capture mechanism).

## X3 — spec/03-formats.md § 14 (Business facts; the sentence after the `business.json` shape)
Insert after: "`postalAddress` has the same shape as `locations[].address` and is compared with LOC-001's normalised containment (PRV-022 `imprint`, OPS-005 `postal`)."
Text: " `manufacturers[].address` and `manufacturers[].euResponsible.address` have the same shape and comparison (PRV-025); `contact` is an email address or absolute URL; `country` is ISO 3166-1 alpha-2."
Serves: #17 (manufacturer address/contact shapes undefined).

## X4 — spec/03-formats.md § 14 (Business facts, `prices[]` shape inside the `business.json` code span)
Old: `kind?: "item"|"fee" (default item),`
New: `kind?: "item"|"fee" (default item), feeType?: "mandatory"|"delivery"|"optional" (fees only; default mandatory; PRV-026 drip),`
Serves: coverage-r05-carryover.md #3 (`uk-consumer` drip pricing, PRV-026 part `drip`).

## X5 — spec/04-algorithms.md § 1.2 (Required-facts rules heading sentence)
Old: `**Required-facts rules (PRV-022 parts `kr-ecommerce`, `jp-sct`, `cn-icp`; PRV-025):**`
New: `**Required-facts rules (PRV-022 parts `imprint`, `controller`, `kr-ecommerce`, `jp-sct`, `cn-icp`; PRV-025):**`
Serves: #12 (absent `postalAddress`/`emails`/`legalName` for `imprint`/`controller` now a blocking operator-owned finding).

## X6 — spec/03-formats.md § 10 (flow step table, `measure` row)
Old: `` | `measure` | `"inp"` | ``
New: `` | `measure` | `"inp"`: records the flow's INP so far in the report (PRF-002 judges the final value at flow end) | ``
Serves: #38 (PRF-002 now states that every flow is measured and what a `measure` step does).

## X7 — spec/01-core.md § TR-111 bullet (line ~264)
Old: `the timing budget rules (PRF-001, PRF-002, PRF-006, PRF-011, PRF-016) are `skipped(slow-host)``
New: `the timing budget rules (PRF-001 parts `lcp` and `tbt`, PRF-002, PRF-006, PRF-011, PRF-016) are `skipped(slow-host)``
Serves: #36 (PRF-001 split into parts; CLS and SEO are not host-calibrated).

## X8 — spec/02-adapters.md (Templates bullet, line ~58)
Old: `(SEC-001 raw sinks, TPL-001, PRF-005)`
New: `(SEC-001 raw sinks, TPL-001)`
Serves: #41 (PRF-005 is now a browser-channel rule over loaded stylesheets; it has no template/ast part).

(Ruleset data files go to the orchestrator via the resolution file, not here.)

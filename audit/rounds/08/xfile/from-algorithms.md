# Cross-file requests from the algorithms fixer (spec/04-algorithms.md) — round 08 pass A

Two kinds of request:
- **New** — edits needed only because of a 04 change made in this pass (exact text below).
- **Mirror** — consistency rows whose Location includes both 04 and your file. Their 04 half is applied (04 lines given); your half is the Fix cell of that row, verbatim, for your file. The row is also in your own pass-A input, so apply it once; if you already did (or adapted it), mark it "already applied" in pass B.

## New

### spec/05-integrations.md (§ 1 CLI surface, line 12 bullet) — serves concreteness-algorithms#6, #7
Old: "- `--gate`, `--pack`, `--service` and `--changed` only narrow the scope, so those runs are partial (04 § 1.6)."
New: "- `--gate`, `--pack`, `--service` and `--changed` only narrow the scope, so those runs are partial (04 § 1.6). A subset run (`--gate`, `--pack`, `--service`) first runs the infrastructure its selected gates need (builds, database lifecycle, the G4 crawl) without reporting the unselected gates (04 § 1.5 *Subset runs*). `--changed` runs the gate set of 04 § 8 (G0–G2; G3 for affected services; G4/G6 on affected routes; G5 for changed families; G7 when a baseline applies; G8 `SKIPPED(scope)`; G9 on affected audit targets)."

### spec/03-formats.md § 6 adapter manifest table — serves concreteness-algorithms#19
Insert a row after the `bundleManifest` row:
"| `generatedPatterns` | glob[] of untracked paths a G3 build creates that are excluded from treeHash (04 § 8.1 `generated.json`; added to the built-in list there) | | `[]` |"

### spec/03-formats.md § 3.4 VerifyEnv, `databases[]` row — serves concreteness-algorithms#22
Old: "`databases[]` `{ id, engine: postgres\|mysql\|sqlite, version, provider: embedded\|external, url?, extensions[] }`"
New: "`databases[]` `{ id, engine: postgres\|mysql\|sqlite, version, provider: embedded\|external, url?, extensions[], migrateExternal?: bool (default `false`; with `external`, run migrations and seeds against it, 04 § 4.2 step 1a) }`"

### spec/03-formats.md § 3.1 Top level, `baseBranch` row — serves concreteness-algorithms#8
Old: "| `baseBranch` | string | `\"main\"` |"
New: "| `baseBranch` | string — resolved as the local branch, else `origin/<baseBranch>`; unresolved or no merge-base → 04 § 5 `no-base` | `\"main\"` |"

### spec/03-formats.md § 5 metadata defaults, `groupKey` component list — serves concreteness-algorithms#2
04 § 9.2 *Serialisation* now renders a `locale` component as `locale:<tag>`. consistency#106 already proposes adding `migrationFile`, `table`, `locale` to the component list; no further edit if that lands.

## Mirror (04 half applied in this pass)

| Consistency row | 04 half (spec/04-algorithms.md line) | Your file(s) — apply that row's Fix cell segment for them |
|---|---|---|
| #21 | :423 live-mode snapshot | spec/packs/programmatic.md:257 (programmatic § 6 *live*); spec/01-core.md:133 (delete `snapshot` from CFG-002 list, add the CFG-001 sentence) |
| #28 | :209 SEC-037 `expired` stage | spec/packs/security.md:115 and :63 |
| #32 | :35 SEC-032 in required-facts list | spec/packs/security.md:113 |
| #42 | :35 RES-008 in required-facts list | spec/packs/resilience.md:28 |
| #43 | :214 delivery faults after the control click probe | spec/packs/resilience.md:28 (insert the "Form keys are the G6 UX-001 result …" sentence) |
| #44 | :230 remote fault stages `skipped(remote)` (RES-007 added to the list) | spec/packs/resilience.md:28 |
| #46 | :508 alias-host wildcard; :35 URL-011 added to the required-facts list | spec/packs/web-delivery.md:162 (URL-011) |
| #52 | :485 hub query pagination (04 wording: "a `programmatic.hubs[]` entry whose `pagination.style` is `\"query\"`") | spec/packs/web-delivery.md:153 |
| #53 | :484 `products.discontinued` | spec/packs/web-delivery.md:122, :130 |
| #54 | :391 complete crawl | spec/packs/programmatic.md:242 |
| #62 | :219 seed contract | spec/01-core.md:218 |
| #64 | :145 REF-010 edge sample | spec/packs/refactor.md:59 |
| #66 | :200 `data-api.db.service` | spec/packs/data-api.md (after :24), spec/01-core.md:133, spec/03-formats.md:298 |
| #70 | :69 early stop | spec/01-core.md:171 |

## Mirror (04 is only cited; no 04 edit needed — the whole fix is yours)

| Consistency row | Your file(s) |
|---|---|
| #24 | spec/packs/ops.md:33 |
| #25 | spec/packs/testing.md:28 |
| #29 | spec/packs/security.md:167 |
| #38 | spec/packs/privacy.md:106, :122 (04 :35 now lists PRV-023's operator-owned outcome, consistency#79) |
| #39 | spec/packs/privacy.md:132 |
| #45 | spec/packs/resilience.md:21, :17; spec/packs/web-delivery.md:133 (RTE-007) |
| #50 | spec/packs/web-delivery.md:165 |
| #67 | spec/03-formats.md:109; spec/01-core.md:149 |
| #71 | spec/packs/ops.md:28; spec/packs/security.md:134 |
| #72 | spec/packs/security.md:123 |
| #76 | spec/packs/security.md:88 |
| #83 | spec/packs/ux.md:12 |
| #84 | spec/packs/ux.md:64 |
| #86 | spec/packs/web-delivery.md:130 |
| #91 | spec/packs/resilience.md:28 |
| #92 | spec/packs/web-delivery.md:276 |
| #96 | spec/packs/programmatic.md:190 |
| #97 | spec/packs/search-engines.md:90, :104 |
| #99 | spec/03-formats.md:441, :444 (04 :488 half applied) |
| #101 | spec/01-core.md:161 |
| #103 | spec/03-formats.md:521, :534 |
| #104 | spec/03-formats.md:534 |
| #105 | spec/03-formats.md:479 |
| #106 | spec/03-formats.md:195 |
| #112 | spec/05-integrations.md:232 |

## Orchestrator's (round-07 passB-notes #5: BUILD_MAP / ownership.tsv). Not requested from a fixer
- consistency#51 (BUILD_MAP WP-504 goal), #60 (WP-504 goal/Depends, ownership.tsv:221), #65 (ownership.tsv:417, WP-607/WP-414).

## Pass B additions (algorithms fixer, round 08)

### spec/01-core.md — TR-103 *Lock-digest PRNG* bullet, **Value streams** sentence (line ~253) — serves xfile-security#X4 (concreteness-security#15)
04 § 15 *Lock-digest PRNG* *Values* (the only definition) now pads nonces; 01 restates the old text.
Old: "a nonce is the lowercase hex of value k."
New: "a nonce is the lowercase hex of value k, zero-padded to 16 digits (04 § 15 *Lock-digest PRNG*)."

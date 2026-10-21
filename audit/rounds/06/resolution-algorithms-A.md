# Resolution — algorithms — pass A — round 06

Input: `audit/rounds/06/concreteness-algorithms.md` rows 1–39, plus the orchestrator instruction to add one *Hidden content* and one *Disclosure exemption* definition to 04 § 15. DECISIONS D-001 (#3) and D-002 (#32) applied. Line numbers refer to `spec/04-algorithms.md` after this pass.

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| concreteness-algorithms#1 | Handoffs | fixed | 04:118 | "Builder findings first" paragraph under the § 1.9 table, as proposed. |
| concreteness-algorithms#2 | Handoffs | fixed | 04:113 | `reduced-environment` row requires reduced/slow-host to be the only partial causes; also excludes the two new partial causes (#4, #24). `planned` row tightened the same way (only partial cause = planned services). |
| concreteness-algorithms#3 | Budgets | fixed | 04:279, 04:71 | D-001 applied with the auditor's text (incl. the ≥ 90 % clause). § 1.6 step 1 now says "every BLOCKED gate has owner `builder`", which covers builder-owned `BLOCKED(budget)`. |
| concreteness-algorithms#4 | Host emulation | adapted | 04:167, 04:87 | "SEC header rules" made decidable: security-pack rules with failure class `missing-header`/`header-value`. Checks run in G8 against the same paths. New partial cause in § 1.6 step 2. |
| concreteness-algorithms#5 | Skeleton | adapted + xfile | 04:387, 04:362; xfile X2, X3 | Generic hash added after § 11 step 8 as proposed. Adapted for § 10 route groups: the full generic hash would put every page with a different paragraph/list count into its own group, so route groups use the generic hash of the tree cut below depth 3 with runs of equal adjacent siblings collapsed. RTE-010 inlines a slightly different recipe (no merging of adjacent text nodes) → X3 asks it to reference § 11; AEO-014 `agent-parity` → X2. "TCL-004" in the proposed text is not a defined rule (spec-lint dangling), so dropped. |
| concreteness-algorithms#6 | Gate status | adapted | 04:496–498 | NOT_CONFIGURED owner rule as proposed (mixed → `builder`). Missing extensions adapted to mirror § 4.3: `builder` when a migration requiring the extension is changed/added in the diff, else `operator` (an agent could otherwise add a migration needing an unavailable extension to get a handoff). `blocked(no-git)` and `BLOCKED(stopped: …)` → `operator`. |
| concreteness-algorithms#7 | Gate status | fixed | 04:41 | Precedence = listed order; `blocking`/`exhausted` findings count whatever the gate status. |
| concreteness-algorithms#8 | Rule outcome → gate | fixed | 04:42, 04:48 | `†` `blocked(reason)` → `BLOCKED`; non-† → warnings; `noAdapterSupport` never changes gate status. |
| concreteness-algorithms#9 | Prerequisites | adapted | 04:63, 04:71 | Per-service prerequisite blocking as proposed, but BLD-004 blocks G4–G7 (not G8): per the § 1.5 table G8 needs only G0 and runs against `previewUrl`/production, not the local build. Step 1 now names BLD-004/BLD-005 only. |
| concreteness-algorithms#10 | Early stop | fixed | 04:65 | As proposed. |
| concreteness-algorithms#11 | Handoffs | fixed | 04:120 | As proposed. |
| concreteness-algorithms#12 | Channel → gate | fixed + xfile | 04:28; xfile X6 | Paragraph under the § 1.1 table; validation also rejects a detector in an unlisted gate. 03 § 5 key `gates` requested (X6). |
| concreteness-algorithms#13 | Channel → gate | fixed | 04:21 | Row replaced; gates for ARC-003 (G1), PRF-010 (G3/G6), UX-009 (G6) named; valid `ci` signature required (03 § 12). |
| concreteness-algorithms#14 | Samples | adapted | 04:364, 04:129, 04:144, 04:152, 04:210, 04:439 | "Fixed-size samples" added to § 10 with named samples `preview-20`, `comparison-10`, `fault-20`, and an "edge sample" definition in § 2 step 5 (first 5 = lowest position). The proposal relied on an undefined "lock-digest PRNG stream", so a normative **Lock-digest PRNG** (SHA-256 ranking keyed by lock digest + stream id + candidate key) was added to § 15. Edge sample for non-`live` stage defined (IDX-011 sample exists only when live). |
| concreteness-algorithms#15 | Passes | fixed | 04:129, 04:152, 04:196 | Both passes placed as stages on a fresh template restore; § 4.2 step 8 order updated to show them. |
| concreteness-algorithms#16 | Mutating stages | fixed | 04:188, 04:196 | As proposed; fault injection also marked one stage per dependency × fault (#33). |
| concreteness-algorithms#17 | Supabase | fixed | 04:205 | As proposed; owner `operator` via the § 15 NOT_CONFIGURED rule (the `external` setting is in signed policy). |
| concreteness-algorithms#18 | Aggregation | fixed | 04:245 | As proposed (`performance.lighthouse.runs`, `performance.routes`, `performance.defaults` exist in performance.md). |
| concreteness-algorithms#19 | File roles | fixed | 04:265 | As proposed, plus "first matching pattern in this order wins". |
| concreteness-algorithms#20 | Changed scope | fixed | 04:276 | As proposed, plus definition of *affected service*. |
| concreteness-algorithms#21 | Tree hash | adapted | 04:284, 04:438 | As proposed, restricted to **untracked** files: excluding tracked files that a build script rewrites would let an agent exempt a source file from the seal. Tracked files changed by G3 → W `build-modified-tracked-file`, stay in the hash. Exclusion applies everywhere treeHash is computed (seal, stop hook, attempts). |
| concreteness-algorithms#22 | Attempts | adapted | 04:351 | Proposed wording "reverse-import closure of its route group or file" was inverted relative to § 8; rephrased as "changes a file that affects the finding's route group or file under the § 8 `verify --changed` mapping". |
| concreteness-algorithms#23 | Sampling | adapted | 04:358, 04:363 | Exact sizes as proposed; remote share made numeric (family's share of discovered URLs × `crawl.remoteMaxUrls`, floor, ≥ 1); strata spread round-robin; `programmatic.hubs` and `web-delivery.trackingParams` keyed. |
| concreteness-algorithms#24 | Incomplete crawl | fixed | 04:86, 04:365 | Partial cause added; § 10 graph-rules bullet points to it. |
| concreteness-algorithms#25 | TPL-004 | fixed | 04:385 | As proposed. |
| concreteness-algorithms#26 | Parity | fixed | 04:399 | As proposed (link overlap over sets of normalised absolute hrefs). |
| concreteness-algorithms#27 | SEC-007 | fixed | 04:402 | Marker list as proposed. |
| concreteness-algorithms#28 | AGT-004 | fixed | 04:409 | As proposed. |
| concreteness-algorithms#29 | ARC-009 | adapted | 04:416 | Proposed text ended in "…" and referred to undefined "§ 7.1 source extensions"; the file-name exclusion is now an explicit extension list, and the sentence is completed with the existing exclusions. |
| concreteness-algorithms#30 | Hidden content | adapted + xfile | 04:472, 04:482; xfile X1, X4, X5 | Done together with the orchestrator instruction (row below). Colour test kept as § 15 had it (contrast < 1.1); AEO-014's ΔE 3 test is replaced. Pack inline lists removed via xfile (AEO-014 X1, SE-123 X4); CNT-009 already references 04 § 15 *Hidden content* (X5 optional precision). CHANGES.md entry requested (X8). |
| orchestrator: hidden content + disclosure exemption | Hidden content | fixed | 04:472–490 | *Hidden content*: superset of CNT-009 and AEO-014 (`hidden`, `aria-hidden="true"`, `display:none`, `visibility:hidden/collapse`, `opacity:0` on element or ancestor, font-size < 2 px, clipped ≤ 1×1 px with the clip computation stated, wholly outside the page box with the box stated, contrast < 1.1 with the background measured from a screenshot so background images/overlays can't evade it). *Disclosure exemption*: union of CNT-009 and AEO-014 exemptions (closed `<details>`, `aria-expanded="false"` targets, inactive tabpanels, closed dialog/popover, inactive carousel slides via `carousel-markers.json` + `carousel-controls.json`, `<template>`, `<noscript>`), **verified by activating the control** — content that doesn't become visible within 1 s is not exempt (closes the C10 gap of exemptions keyed on agent-written ARIA). |
| concreteness-algorithms#31 | MET-011 `copyright` | fixed | 04:459 | As proposed; comparison values normalised the same way. |
| concreteness-algorithms#32 | Caching | fixed | 04:505–506, 04:499 | D-002 applied: environment hash and definition-of-done run defined; `--resume` also keyed on environment hash; sealed PASS never from cached results. |
| concreteness-algorithms#33 | Fault injection | fixed | 04:210 | Delay = `upstreamMs` + 5,000 ms; one dependency at a time; 5xx made concrete as 503 (RES-001/002/003 accept 5xx/503). Sample named `fault-20`. |
| concreteness-algorithms#34 | Sensitive paths | fixed | 04:224 | Patterns from 05 § 3 (line 79) listed. |
| concreteness-algorithms#35 | Supervisor | fixed | 04:174 | Polls `verifyEnv.health.<service>.url` every `intervalMs` (03 § 3.4 default 500). |
| concreteness-algorithms#36 | brief | fixed | 04:258 | As proposed. |
| concreteness-algorithms#37 | SEC-046 | fixed + xfile | 04:213; xfile X7 | Canaries on `127.0.0.1`, `[::1]` and alias `10.255.255.1`; unbindable alias reported. SEC-046 has no target at the alias, so X7 adds one. |
| concreteness-algorithms#38 | Debt keys | fixed | 04:338 | Row added. |
| concreteness-algorithms#39 | Soft-404 | fixed | 04:400 | Whole-word = UAX #29 boundaries, NFKC + case folding on both sides. |

## Ownership rows
None — no new rule IDs or parts. (New W finding codes `host-directive-unsupported` and `build-modified-tracked-file` are Verifier diagnostics, like the existing `generated-file-not-ignored`, not rules. New § 15 definitions belong to the WPs that already own § 15/§ 10/§ 11 per BUILD_MAP § 5.)

## Ruleset data
None new. The disclosure exemption uses `carousel-markers.json` and `carousel-controls.json`, both already listed in BUILD_MAP WP-104 (Accessibility bullet).

## Policy keys added (key · type · default · file)
None. Rule-metadata key requested via xfile X6: `gates` · gate[] · `[]` (required for `db`/`contract` rules) · `spec/03-formats.md` § 5.

## spec-lint (last three lines)
```
spec-lint: {"requirements":526,"rules":507,"toolRequirements":19,"rulesWithParts":138,"errors":5,"warnings":70}
  errors by check: ownership=5
  warnings by check: ruleset-unsourced=64 ruleset-unnamed=1 channel-infra=5
```
None of the 5 errors is in `spec/04-algorithms.md`: `AGT-006 channel:html (ownership.tsv:31) is not a channel of the rule [diff]` and `REF-014`, `SEC-067`, `UX-022`, `CQ-010` "has no owning work package" — new IDs from other fixers awaiting orchestrator ownership rows. The one error this pass caused (dangling `TCL-004` from the proposed #5 text) was fixed. Warnings are pack-file ruleset checks (not 04).

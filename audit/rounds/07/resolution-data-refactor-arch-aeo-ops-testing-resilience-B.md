# Resolution — data-refactor-arch-aeo-ops-testing-resilience — pass B — round 07

Inputs: every request in `audit/rounds/07/xfile/from-*.md` whose target is one of my files (data-api, refactor, architecture, answer-engines, ops, testing, resilience), including the "already applied / no request needed" rows that name my files, plus `audit/rounds/07/passB-notes.md` decisions 1–5 swept over my files. `from-algorithms.md`, `from-web-delivery.md` and `from-privacy-a11y-perf.md` have no request targeting my files. `from-data-refactor-arch-aeo-ops-testing-resilience.md` is my own pass-A output (requests to other files only). Line numbers are those after this pass.

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| xfile-security#X2 | TST-010 logout flow | adapted | testing.md:32 | Inserted: when `auth.strategy` ≠ `"none"`, ≥ 1 flow has `journey: "logout"` and a non-null `account` (03 § 10). Owner adapted per passB-notes #3: a missing one is reported only by SEC-028, as a blocking `missing-element` owned by `operator` (flows live in Operator-owned `quality/flows/`), so there's no duplicate finding. SEC-028 still says "owned by the builder" on disk; the security fixer changes that under note #3. |
| xfile-security#consistency-76 | API-003 (c) | rejected (already fixed) | data-api.md:51 | Listed by security as already applied. On disk: "other-tenant requests answer 403 or 404 (whether access is refused at all: SEC-021/SEC-023)" and "Kinds (a) and (e) on SEC-030 fuzz requests are reported by SEC-030 `behaviour` only". |
| xfile-security#consistency-79 | API-007 | rejected (already fixed) | data-api.md:55 | On disk: "Operations whose request media type is not `application/json` are excluded (multipart and other upload limits: SEC-032 `size`)." |
| xfile-formats-integrations#4 | TST-007 Operator-owned sources | adapted | testing.md:29 | Pass A already wrote the paths (`testing.flows` = `quality/flows/`; `data-api.contracts[].path`, `examples`, `released` under `quality/contracts/`; flow `upload` files under `quality/fixtures/`; `schema-violation` owned by `operator`), more specific than the proposed text. Added the 03 § 8 *Operator-owned sources* citation (passB-notes #4) and didn't restate the definition. |
| xfile-formats-integrations#5 | TST-008 browsers | rejected (already fixed) | testing.md:30 | On disk: "each flow matched by `crossBrowser.flows` … runs in each browser of its own `browsers` (03 § 10) ∪ `crossBrowser.browsers`". The proposal hard-codes `{firefox, webkit}`; the policy list (default `["firefox", "webkit"]`) is the correct source. |
| xfile-formats-integrations#12 | RES-006 `upstreamMs` | adapted | resilience.md:26 | The literal ≤ `upstreamMs` check is already part `bound` (P1). The "non-literal value: W" clause became a separate part, `bound-unknown` (W · ast), because part severities are static (04 § 1.8; xfile-security#X5 / formats#9). |
| xfile-formats-integrations#14 | REF-002 / REF-011 remote baseline | fixed | refactor.md:50 | "REF-011 is `notApplicable` because a remote baseline has no `redirects.jsonl` (03 § 12); old-site redirect sources become recorded routes, judged by REF-010." Matches 05 § 2.1 (my pass-A Z1) and 03 § 12. |
| xfile-formats-integrations#15 | REF-001 | rejected (already fixed) | refactor.md:49 | On disk: "(for a rebuild of a live site, a signed remote baseline of its origin; the `commit` condition does not apply to a remote baseline)". |
| xfile-formats-integrations#23 | ARC-010 | rejected (already fixed) | architecture.md:55 | On disk: "… is reported only by AGT-001 (protected keys, 05 § 3.1) and AGT-003 (suppressions); ARC-010 reports only the state at the diff base." and "When a pointer is off on the diff base too, the finding is owned by `operator`". |
| xfile-formats-integrations#24 | API-004 declared | rejected (already fixed) | data-api.md:52 | On disk: forms (a) `api-field-removed`, (b) `api-status` whose `from` equals the latest released contract's status, (c) `- removed:`/`- changed:` under a `## <semver>` heading whose major equals the current one; "Removals, narrowed types and new required inputs also need the current contract's major > the latest released major". |
| xfile-core-adapters-ux#X16 | REF-009 vs UX-009 | rejected (already fixed) | refactor.md:57 | On disk: "Owner of visual equivalence in refactor runs: UX-009 does not run when a signed `quality/refactor.json` exists or `--against` is given." |
| xfile-programmatic-search#consistency-26 | AEO-014 `hidden-text` vs SE-109 | rejected (already fixed) | answer-engines.md:43 | On disk: "SE-109 (SE-109 `owns` `AEO-014#hidden-text` for them) only on pages where the signed `search-engines.features` contains `paywalled-content`". |
| xfile-programmatic-search#consistency-65 | AEO-009 `pdf` vs SE-006 | rejected (already fixed) | answer-engines.md:37 | On disk: "This part owns title equality; `rel=alternate` pairing and the document's canonical or `noindex` are SE-006's." |
| xfile-programmatic-search#consistency-133 | AEO-001 vs SE-103 | rejected (already fixed) | answer-engines.md:29 | On disk: "SE-103 part `preview` `owns` `AEO-001#large-preview` (P1 there) and this part is not reported." |
| passB-notes#1 | page locale with no ruleset entry | fixed | answer-engines.md:33, :44; testing.md:32 | Local fallbacks replaced with the 04 § 15 *Page locale* pointer (lookup and no-entry outcome): AEO-014 `ai-addressed` (was "`ll-CC` → `ll` → `en`"; the `en` list on every page stays), AEO-005 CLDR/`attribution-phrases.json` (was "per locale"), TST-010 `cancel` `cancel-labels.json` (was "fallback `ll-CC` → `ll`"). None of my files had "PARTIAL with a `reduced-environment` handoff" text. |
| passB-notes#2 | indexable / page locale defined once | rejected (nothing to change) | — | Swept all 7 files: "indexable" is only used, never defined (AEO-001/002/003/005/008/009/014, REF-010). No local page-locale definition remains after the #1 edits. |
| passB-notes#3 | SEC-028 logout owner `operator` | fixed | testing.md:32 | Applied in the xfile-security#X2 row. |
| passB-notes#4 | cite 03 § 8 *Operator-owned sources* | fixed | testing.md:29 | TST-007 cites it. Other "Operator-owned" mentions in my files (data-api.md:17 `examples` comment, refactor.md:31 `refactor.json`, testing.md:3 summary) describe ownership and don't define oracle eligibility, so no change. |
| passB-notes#5 | orchestrator-owned targets | rejected (not mine) | — | No request to my files targets CHANGES.md, BUILD_MAP.md, ownership.tsv or tools/. |

## Ownership rows
None new. New part RES-006 `bound-unknown` (W · ast) stays with the rule's `*` owner (WP-703).

## Ruleset data
None.

## Policy keys added (key · type · default · file)
None.

## spec-lint (after this pass)
```
spec-lint: {"requirements":549,"rules":530,"toolRequirements":19,"rulesWithParts":176,"errors":0,"warnings":65}
  errors by check: none
  warnings by check: ruleset-unsourced=64 ruleset-unnamed=1
```
None of these lint lines are in my files. My first draft of the AEO-005 edit caused one `ruleset-unnamed` warning at answer-engines.md:33 (the words "per-locale ruleset lists"); I reworded it and it's gone. The remaining `ruleset-unnamed` is in spec/packs/privacy.md:57, and all 64 `ruleset-unsourced` warnings are in other fixers' files. Other fixers are still editing, so the counts may move between runs.

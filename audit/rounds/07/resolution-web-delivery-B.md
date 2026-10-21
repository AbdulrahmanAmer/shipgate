# Resolution — web-delivery — pass B — round 07

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| xfile-algorithms#X1 | § 2 *Indexable page* → pointer to 04 § 15 only | fixed | spec/packs/web-delivery.md:70 | Pass A had already made it a pointer, but it still restated the deciding inputs (`indexRules`, `staticPaths`, … "the declared query parameters"), which is a second partial definition. Replaced with the requested text; kept the sentence tying item 5 to URL-001. Items 1–5 not changed, so nothing goes back to algorithms. |
| xfile-algorithms#X2 | § 1 *Locale segment*: page locale points to 04 § 15 | adapted | spec/packs/web-delivery.md:54 | Pass A had already added the pointer. Added what was missing: 04 § 15 also defines the per-locale list lookup and the no-entry outcome, and a URL with no locale segment takes `defaultLocale` for lookups (04:464 "none matches → `web-delivery.defaultLocale`") and is still a MET-007 finding. Said "list" rather than "ruleset" because spec-lint `ruleset-unnamed` flags "ruleset" when no file name follows it. |
| xfile-formats-integrations#22 | CQ-010 cross-reference 05 § 3.3 → 03 § 16 | rejected (already fixed) | spec/packs/web-delivery.md:289 | Current text: "only sessions of hosts whose 03 § 16 row reports no fetches (05 § 3.3) → `skipped(no-fetch-store)`". |
| xfile-privacy-a11y-perf#X11 | informational: `ca-qc` documented for I18-010 | rejected (already fixed; no edit needed) | spec/packs/web-delivery.md:276 | I18-010 exists and keys on it: "French for Quebec (with `ca-qc` in `privacy.jurisdictions`, else `notApplicable` …)". The privacy group keeps `ca-qc`. |
| xfile-programmatic-search#X10 | RTE-010 `search-agents.json` token list | fixed | spec/packs/web-delivery.md:136 | Tokens checked against SE-002 (search-engines.md:37: Googlebot, Bingbot, YandexBot, Yeti, Baiduspider, SeznamBot, Applebot). The BUILD_MAP WP-104 half of consistency#61 belongs to the orchestrator. |
| xfile-data-refactor-arch-aeo-ops-testing-resilience ("already applied" list) | RTE-007 owner split (consistency#98, #99); RTE-010 head-signal comparison and paywall gate (consistency#28) | rejected (already fixed) | spec/packs/web-delivery.md:133, :136 | Checked: RTE-007 "`api`-surface routes are RES-001, and routes matching `resilience.degradable` … are judged by RES-003"; RTE-010 "Only when the Operator's `search-engines.features` contains `paywalled-content` …" and "identical `<title>`, meta description, robots directives …". |
| xfile-programmatic-search ("no request needed" list) | consistency#41, #42, #43, #54, #63 | rejected (already fixed) | spec/packs/web-delivery.md:195, :156, :153, :281, :110 | Checked each against the current text: active-feature `schemaTypes` and value types (#41); URL-004 `ProductGroup` variant canonicals under SE-111 (#42); URL-001 `variantParams` / `facets.indexable` (#43); CQ-002 excludes family/hub pairs (#54); RTE-001 "SE-501 owns this comparison with threshold 1.0" (#63). |
| passB-notes#1 | locale with no list entry → 04 § 15 *Page locale*, never a skip | fixed | spec/packs/web-delivery.md:286, :76 | CQ-007 said "locales without a toolchain dictionary are `skipped(no-dictionary)`", a skip that the decision forbids. It now points to the 04 § 15 no-entry outcome, with the Hunspell dictionary as the list (04:465 counts toolchain CLDR data as per-locale list data, and the dictionary is the same kind of data). Also added a § 2 pointer: every per-locale list in this pack is looked up, and a missing entry handled, as 04 § 15 says. No `reduced-environment` text exists in this file. Risk for the orchestrator: under 04:466 the check "runs with the `en` entry", so spelling a non-English page against the English dictionary will produce many W unknown-word findings next to the blocking Operator finding. That is how 04 is written today; it is not a local exception. |
| passB-notes#2 | indexable page and page locale defined once (04 § 15) | fixed | spec/packs/web-delivery.md:54, :70 | Done by X1 and X2. |
| passB-notes#3 | SEC-028 logout flow | rejected (not applicable) | — | No SEC-028 or logout text in web-delivery.md. |
| passB-notes#4 | Operator-owned sources: cite 03 § 8 | fixed | spec/packs/web-delivery.md:70 | The only restatement of Operator-owned inputs was the § 2 input list, which X1 removed. CQ-006 (`operator` owner, approvals) states ownership and does not restate the definition, so no edit was needed. |
| passB-notes#5 | orchestrator-owned targets | rejected (not applicable) | — | No request in my inputs targets those files. |

## Ownership rows
None (no new rule IDs or parts in pass B).

## Ruleset data
None new. `search-agents.json` now has to hold YandexBot, Yeti, Baiduspider, SeznamBot and Applebot entries as well; that is the orchestrator's existing WP-104 "Crawlers and agents" edit for consistency#61.

## Policy keys added (key · type · default · file)
None.

## spec-lint (`node tools/trace/spec-lint.mjs`, last three lines)
```
spec-lint: {"requirements":549,"rules":530,"toolRequirements":19,"rulesWithParts":176,"errors":30,"warnings":65}
  errors by check: ownership=23 channel-infra=7
  warnings by check: ruleset-unsourced=64 ruleset-unnamed=1
```
Expected errors in web-delivery: `ownership` for RTE-016, RTE-017, URL-014 and I18-010, plus `channel-infra` for SCH-006, SCH-010 and TRS-002 (browser channel → WP-410). The orchestrator clears both through the pass-A rows in resolution-web-delivery-A.md. None of these come from a pass-B edit. My first wording of line 54 added two `ruleset-unnamed` warnings; I reworded it and they are gone. The one `ruleset-unnamed` warning left is in privacy.md:57, not in this file.

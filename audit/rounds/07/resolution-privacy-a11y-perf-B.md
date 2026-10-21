# Resolution — privacy-a11y-perf — pass B — round 07

Inputs: the one `xfile/from-*.md` request whose target is in {FILES} (`from-core-adapters-ux.md` X18; no other from-* file names privacy.md, accessibility.md or performance.md), and `passB-notes.md` items 1–5 as they apply to these files.

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| xfile-core-adapters-ux#X18 (serves concreteness-core-adapters-ux#19) | PRV-026 part `total`: after ruleset `payment-amounts.json` add "(shape and matching: ux § 3)" | fixed | spec/packs/privacy.md:120 | Checked that ux § 3 (ux.md:79) defines the `payment-amounts.json` shape and the request-matching rule. Now reads "ruleset `payment-amounts.json` (shape and matching: ux § 3), minor units per ISO 4217". |
| passB-notes#1 (page locale with no ruleset entry → 04 § 15) | Pack text that gives a different no-entry outcome cites 04 § 15 | fixed | spec/packs/privacy.md:57, :61, :128; spec/packs/accessibility.md:30 | No "PARTIAL / `reduced-environment`" text exists in these files (grep). The silent "fall back to `en`" texts did conflict, because they drop the blocking operator-owned `missing-element` that 04 § 15 requires, so each now cites 04 § 15: privacy § 1 Definitions ("locale-keyed rulesets fall back to `en`" removed), privacy *Phrase match* ("(fallback `en`)" → "(lookup and no-entry outcome: 04 § 15 *Page locale*)"), PRV-033 CLDR region name ("(page locale or `en`)" → "(04 § 15 page locale)"), a11y § 1 *Phrase match*. Left as they are, because 04 § 15 says Operator-written per-locale values "follow their own pack text": privacy.md:75 `banner.*Label` locale map and accessibility.md:42 `genericAltWords` (policy key, a11y § 1). |
| passB-notes#2 (indexable page / page locale defined only in 04 § 15) | Remove second definitions; keep pointers | fixed | spec/packs/privacy.md:57, :84, :124; spec/packs/accessibility.md:30; spec/packs/performance.md:34 | privacy:57 had its own *Page locale* definition (primary subtag of `<html lang>` → `defaultLocale` → `en`), which contradicts 04 § 15 ("`<html lang>` … never used"). It is replaced by a pointer to 04 § 15 *Page locale* and *Indexable page*. a11y:30 had the same second definition and is replaced by a pointer. PRF-001 part `seo`: "indexable public pages" → "indexable pages, 04 § 15 *Indexable page*" (item 1 of that definition already limits the set to public surfaces). PRV-029 builder-written signals: "indexable pages (04 § 15 *Indexable page*)". PRV-006 used "indexable" in its own sense (served without `noindex`), which conflicts with the 04 § 15 set, where `legalPages` `index` values count as exact-path `indexRules` entries (item 3). The served-`noindex` check for those pages is already web-delivery MET-006 (1)–(2) (P0, both directions). PRV-006 now points to MET-006 and drops its duplicate `value-mismatch`, so one finding is no longer reported twice. Nothing is weakened: the check stays, under the stricter P0 owner. No other spec file cites PRV-006 `value-mismatch` (grep). |
| passB-notes#3 (SEC-028 logout flow) | — | rejected (not applicable) | — | SEC-028 is in security.md. No text in {FILES} refers to a logout flow (grep `logout`, `SEC-028`: 0 hits). |
| passB-notes#4 (Operator-owned sources: cite 03 § 8) | Rules cite 03 § 8 instead of restating it | adapted | spec/packs/privacy.md:124 | PRV-029 called the `merchantFeed` `shipping` countries an Operator-owned signal with no condition. That contradicts 03 § 8: feeds outside `quality/data/` are not Operator-owned. It now reads "Operator-owned signals (each from an Operator-owned source, 03 § 8 *Operator-owned sources*): … `merchantFeed` (03 § 14 Merchant feed) when the feed is an Operator-owned source (otherwise they count as builder-written signals)". A builder-written feed now gives the builder-owned `forbidden-value` path and no longer an operator handoff. privacy.md:117 "`privacy.digitalProductPaths` (Operator-owned list …)" is a signed policy key and does not restate 03 § 8, so it is unchanged. accessibility.md and performance.md have no Operator-owned restatements (grep). |
| passB-notes#5 (CHANGES / BUILD_MAP / ownership / tools requests are the orchestrator's) | — | rejected (not applicable) | — | No such request targets {FILES}. Nothing was written to orchestrator files. |

## Ownership rows
None. Pass B added no rule IDs and no parts.

## Ruleset data
None new.

## Policy keys added (key · type · default · file)
None.

## Cross-file requests filed
None. All edits were inside {FILES}.

## spec-lint (`node tools/trace/spec-lint.mjs`, last three lines)
```
spec-lint: {"requirements":549,"rules":530,"toolRequirements":19,"rulesWithParts":176,"errors":30,"warnings":65}
  errors by check: ownership=23 channel-infra=7
  warnings by check: ruleset-unsourced=64 ruleset-unnamed=1
```
Errors in {FILES}: the `ownership` errors for A11-030 and PRV-029…PRV-037 ("has no owning work package"). These are the pass-A IDs whose ownership rows were already listed in resolution-privacy-a11y-perf-A.md and are waiting for the orchestrator to add them to `trace/ownership.tsv`. Pass B did not cause them. All 7 `channel-infra` errors are in other packs (DAT-006, SE-002, SE-501, SCH-006, SCH-010, TRS-002). None comes from these files.

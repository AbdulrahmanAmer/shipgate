# Resolution — web-delivery — pass B — round 06

Inputs: all 8 `audit/rounds/06/xfile/from-*.md`, grepped for requests whose target is `spec/packs/web-delivery.md`. Four requests target it; the others are addressed to other files. `from-algorithms#X8` (spec/CHANGES.md) also lists web-delivery RTE-010, but it targets CHANGES.md, so it goes to the orchestrator and is skipped here. `from-web-delivery.md` holds this group's own outgoing requests; none of them target web-delivery.md.

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| xfile-algorithms#X3 | RTE-010 part `behaviour`: replace the inline masked-skeleton recipe with a reference to the generic `<main>` skeleton hash (04 § 11) (serves concreteness-algorithms #5) | fixed | spec/packs/web-delivery.md:126 | Applied the exact text. The new text is no weaker than the old. 04 § 11 step 1 already drops whitespace-only text, so "every text node" covers the old "every non-whitespace text node". The generic hash also merges adjacent text nodes first, which fixes the `a<!--x-->b` mismatch. RTE-010, AEO-014 `agent-parity` and 04 § 10 route groups now share one definition (04-algorithms.md:387). |
| xfile-formats-integrations#X3 | CQ-010: if the text names the path `fetches/<repo-id>/<session-id>.jsonl`, change it to "the session fetch store (03 § 15)" (information only) | rejected (already fixed) | spec/packs/web-delivery.md:266 | Pass A already wrote it this way: "occurs in a document of the **session fetch store** (03 § 15: the text of every web fetch, search result and browser-tool page …)". No raw path appears in the file (checked with grep for `fetches/`). |
| xfile-programmatic-search#X6 | Policy block: add `siteAlternateName` (serves concreteness-programmatic-search #22) | fixed | spec/packs/web-delivery.md:12 | Inserted after the `brand`/`siteName` line, exactly as requested. Matches SE-102 (search-engines.md:49: "`web-delivery.siteAlternateName` (string, default `null`)"). The 03 § 3.5 "Additional keys" entry is the formats fixer's job (from-programmatic-search X9). |
| xfile-programmatic-search#X11 | KW-002 / MET-013: replace `ruleset stop words` with ruleset `stop-words.json` | rejected (already fixed) | spec/packs/web-delivery.md:141, 172, 279 | Pass A already named the file everywhere it is used. URL-007: "stop words of the page locale (ruleset `stop-words.json`, as KW-002)". MET-013: "the page locale's stop words (ruleset `stop-words.json`)". Head term (used by KW-002): "minus the stop words of the target URL's locale (ruleset `stop-words.json`)". A grep finds no bare `ruleset stop words` left. |

No conflicts with pass-A text from other fixers. The RTE-010 wording points to the 04 § 11 definition the algorithms fixer wrote, so there is one definition and nothing for the two texts to disagree about.

## Ownership rows
None (no new rule IDs or parts).

## Ruleset data
None new. `stop-words.json` and `search-agents.json` were already referenced and are already reported as ruleset-unsourced (orchestrator, WP-104).

## Policy keys added (key · type · default · file)
- `siteAlternateName` · string | null · `null` · spec/packs/web-delivery.md (§ 1 policy block). The formats fixer adds the 03 § 3.5 entry (from-programmatic-search X9).

## spec-lint (`node tools/trace/spec-lint.mjs`, exit 1)
```
spec-lint: {"requirements":526,"rules":507,"toolRequirements":19,"rulesWithParts":142,"errors":5,"warnings":67}
  errors by check: ownership=5
  warnings by check: ruleset-unsourced=62 channel-infra=5
```
All 5 errors are `ownership` errors for rows the orchestrator has not added yet. The one in this file is `ERROR [ownership] CQ-010 (spec/packs/web-delivery.md:266) has no owning work package` (new in pass A). This pass added no lint errors. web-delivery warnings are all `ruleset-unsourced` (`search-agents`, `generic-anchors`, `stop-words.json`) and belong to the orchestrator (BUILD_MAP WP-104).

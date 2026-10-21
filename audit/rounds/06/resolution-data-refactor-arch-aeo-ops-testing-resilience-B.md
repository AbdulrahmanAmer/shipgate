# Resolution — data-refactor-arch-aeo-ops-testing-resilience — pass B — round 06

Inputs: every request in `audit/rounds/06/xfile/from-*.md` (8 files) whose target is one of data-api.md, refactor.md, architecture.md, answer-engines.md, ops.md, testing.md, resilience.md. Six such requests were found, plus one informational row on the 04 § 15 conflict; none targets refactor.md, architecture.md, ops.md or testing.md. Requests targeting other spec files, spec/CHANGES.md, BUILD_MAP.md, trace/ownership.tsv or tools/ are out of scope for this pass. That includes from-algorithms X8 (CHANGES) and this group's own X12 (tools/), which belong to the orchestrator. from-core-adapters-ux and from-privacy-a11y-perf have no requests for these files. This group's own pass-A file (from-data-refactor-…) targets only other files.

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| xfile-algorithms#X1 | AEO-014 main bullet | adapted | answer-engines.md:42 | Pass A had already replaced the inline list and the ΔE 3 test with references to 04 § 15. This pass makes the reference exact: "**Hidden** and its **exemptions**: 04 § 15 *Hidden content* and *Disclosure exemption* (each exemption verified by activating its control), the one definition shared with CNT-009, SE-109 and SE-123; no other hidden-content list or colour test applies." The item names match the 04 § 15 headings (04-algorithms.md:472, :482). |
| xfile-algorithms#X2 | AEO-014 `agent-parity` | fixed | answer-engines.md:45 | Now reads "generic `<main>` skeleton hash (04 § 11 …)". 04 § 11 (04-algorithms.md:387) names AEO-014 `agent-parity` as a user of that hash. |
| xfile-programmatic-search#X2 | AEO-014 main bullet + `hidden-text` ownership + `ai-addressed` | adapted | answer-engines.md:42, :43, :44 | Main bullet: same edit as xfile-algorithms#X1. `ai-addressed` now reads "04 § 15 *Hidden content*, the *Disclosure exemption* **not** applied". For `hidden-text`, the ownership wording was adapted to match the `owns` declarations already in CNT-009 (programmatic.md:189) and SE-123 (search-engines.md:67). Inside `<main>` of family and hub pages, CNT-009 owns the part. Elsewhere, a hidden element containing an `<a href>` (to any page, which is SE-123's scope) is owned by SE-123. The OR-link trigger was removed from the `hidden-text` condition, so the part reports only non-exempt hidden elements of ≥ 30 words that contain no link and are outside CNT-009's scope. This doesn't weaken anything: the link case is still blocking, and at a higher severity (SE-123 P0, versus `hidden-text` P1). |
| xfile-web-delivery#X9 | AEO-014 `agent-parity` (Bingbot UA source; text-masked skeleton) | adapted | answer-engines.md:45 | Edit 1 had already been applied in pass A: "desktop Bingbot user agent (both from `search-agents.json`, as RTE-010)". Edit 2 conflicts with xfile-algorithms#X2. Since X9 was written, 04 § 11 has gained the **generic `<main>` skeleton hash**: every text node becomes `⟦t⟧`, after adjacent text nodes are merged. RTE-010 `behaviour` now cites that hash too (web-delivery.md:126). So X9's concern (text masking) is met by the 04 § 11 definition. The inline steps-1/3/6 recipe would differ on `a<!--x-->b` (algorithms #5), so the single § 11 hash was chosen as the stricter, decidable version. The reference is now "that of the first desktop Chrome response", and the text normalisation is spelled out as "NFKC, whitespace-collapsed, as RTE-010". |
| xfile-formats-integrations#X2 | resilience.md policy comment l.10 | fixed | resilience.md:10 | As requested: "hosts[] entries whose purposes contain "dependency" (03 § 3.3)". This replaces this group's pass-A request X3/X9 (a `dependency: true` boolean). 03 § 3.3 (03-formats.md:94) and 04 § 4.5 (04-algorithms.md:210, `purpose: "dependency"`) agree on the purpose form, and this pack now does too. |
| xfile-security#X6 | data-api.md § 1 `contracts` comment | fixed | data-api.md:14 | As requested. It matches SEC-060 (security.md:160: "the `endpoint` path (default `/graphql`) of each `data-api.contracts` entry with `type: "graphql"`"). |
| xfile-algorithms#X1/#X2 + xfile-programmatic-search#X1 (info) | 04 § 15 definition conflict | rejected (not this file) | — | xfile-programmatic-search#X1 proposed a different § 15 text (opacity product < 0.05; background-image is never same-colour). The algorithms fixer's § 15 is what is on disk. AEO-014 only references it, so nothing in this group's files depends on which version wins. |

**Open, not ours:** RES-002 holds for `pageMs` + 5,000 ms (resilience.md:21). 04 § 4.5 (04-algorithms.md:210) still says `upstreamMs` + 5,000 ms. This group's pass-A request X3 for the algorithms fixer is still unapplied on disk. Until it is applied, the two files disagree. The pack text is the stricter one and is kept.

Counts: 7 rows — fixed 3, adapted 3, rejected 1 (informational, no edit in these files).

## Ownership rows
None (no new rule IDs or parts).

## Ruleset data
None new. `search-agents.json` (answer-engines.md:45) is the web-delivery fixer's ruleset and is listed in its resolution file.

## Policy keys added (key · type · default · file)
- `data-api.contracts[].endpoint` · string (path) · `"/graphql"` (graphql entries only) · data-api.md:14. The key was already defined by SEC-060; this pass documents it in the policy example.

## spec-lint (last three lines)
```
spec-lint: {"requirements":526,"rules":507,"toolRequirements":19,"rulesWithParts":142,"errors":0,"warnings":62}
  errors by check: none
  warnings by check: ruleset-unsourced=62
```
The warnings in these files are all expected `ruleset-unsourced` rows that are waiting for the orchestrator's BUILD_MAP WP-104 additions from pass A: `attribution-phrases`, `safe-type-changes`, `password-hash-patterns`, `error-reporting-providers`, `unsubscribe-labels`, and `search-agents.json` (web-delivery's).

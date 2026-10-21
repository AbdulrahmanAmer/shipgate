# Resolution — programmatic-search — pass B — round 06

Inputs: all 8 `audit/rounds/06/xfile/from-*.md` files were scanned for requests targeting `spec/packs/programmatic.md` or `spec/packs/search-engines.md` (by file name and by every rule prefix in the two packs: CNT, TPL, DAT, PCF, ROL, PLK, KW, URL, SE, LOC, SCH, IDX). 3 requests match: 2 in `from-algorithms.md`, 1 in `from-data-refactor-arch-aeo-ops-testing-resilience.md`. `from-core-adapters-ux.md`, `from-formats-integrations.md`, `from-privacy-a11y-perf.md`, `from-security.md`, `from-web-delivery.md` and `from-programmatic-search.md` (this group's own outbox) contain none for these files. The TPL-001 and IDX-013 mentions in `from-privacy-a11y-perf.md` X8 and `from-web-delivery.md` X2 are edits to 02 and 04, not to these packs.

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| xfile-programmatic-search#X1 (from-algorithms X4) | SE-123: point hidden links at 04 § 15 *Hidden content* (which includes zero-size, same-colour, off-screen) | adapted | spec/packs/search-engines.md:67 | The quoted old text was already gone: pass A (this group) had rewritten SE-123 to cite 04 § 15 *Hidden content*. Conflict resolved toward the stricter, decidable text. **Kept** from pass A: the decidable skip-link exception ("an `<a href="#id">` among the first 3 focusable elements whose target is on the page and which is visible when focused"), which is stricter than the request's "accessibility skip links excepted"; and the CNT-009/AEO-014 ownership sentence. **Taken** from the request: the explicit list of what *Hidden content* covers (added "zero-size, clipped, same-colour and off-screen links"). **Tightened**: pass A let any single-glyph link with an `aria-label` pass, while the request flagged every one. An agent could get round pass A by adding an `aria-label` to a hidden one-character link. The new text flags a single non-alphanumeric character link when it has no `aria-label` **or** sits inside a `<p>`, so a labelled hyphen in running text is still reported. Labelled pagination and carousel arrows outside `<p>` are not false positives. |
| xfile-programmatic-search#X2 (from-algorithms X5) | CNT-009: cite *Disclosure exemption* too | fixed | spec/packs/programmatic.md:189 | Now `04 § 15 *Hidden content* and *Disclosure exemption*, the only definitions, shared with AEO-014, SE-109 and SE-123`. Grammar adjusted from "the one definition" to "the only definitions", because two items are named. |
| xfile-programmatic-search#X3 (from-data-refactor… X11) | SE-008 `ua-reach`: one challenge-page definition shared with AEO-008 | fixed | spec/packs/search-engines.md:42 | Applied verbatim. The text now matches AEO-008 (`answer-engines.md:36`): `cf-mitigated: challenge` header, or body matching ruleset `error-pages` fingerprints. |

Skipped as orchestrator-owned, per instructions: from-algorithms X8 (`spec/CHANGES.md`, which already names SE-123 and CNT-009 in its R06 entry text) and from-data-refactor… X12 (`tools/trace/spec-lint.mjs`).

## Ownership rows
None (no new rule IDs or parts).

## Ruleset data
None new. `error-pages` is already listed in BUILD_MAP.md:121 (WP-104, "UX and analytics").

## Policy keys added (key · type · default · file)
None.

## spec-lint (last three lines)
```
spec-lint: {"requirements":526,"rules":507,"toolRequirements":19,"rulesWithParts":142,"errors":0,"warnings":62}
  errors by check: none
  warnings by check: ruleset-unsourced=62
```
0 errors. Pass B caused none of the 62 `ruleset-unsourced` warnings. The ones in these two packs are on lines this pass didn't touch: `stop-words` (programmatic.md:120/208/216), `advice-patterns` (programmatic.md:166), `clickbait-patterns` (search-engines.md:50), `tracking-param-expansions` (:94), `china-blocked-hosts` (:108) and `postal-patterns` (:127). Each one waits on the orchestrator to add the ruleset to BUILD_MAP WP-104. The lint run also includes the other pass-B fixers' edits, which are running at the same time.

# Resolution — orchestrator — pass B — round 06

Findings whose pass-A outcome was only "xfile": checked in the tree after pass B.

| Finding | Req | Outcome | Where | Note |
|---|---|---|---|---|
| concreteness-data-refactor-arch-aeo-ops-testing-resilience#2 | REF-002 | fixed | 03 § 11 `allowedChanges` kinds table (formats pass B) | every kind now has fields; removal-inside-selector limitation stated in the table |
| concreteness-data-refactor-arch-aeo-ops-testing-resilience#39 | ARC-008 | fixed | 04:415 | no `architecture.entryPoints` global key left; per-service entry points |
| concreteness-security#19 | SEC-026, SEC-049 | fixed | 03:436 | fixture = a JSON file or a directory of `*.json` at the route's `fixture` path |
| concreteness-web-delivery#3 | RTE-001, RTE-014, IDX-013 | fixed | 04:399 | single token-overlap definition, cited by RTE-001/RTE-014/IDX-013/RES-003 |

Orchestrator-owned requests also applied: lint `PRODUCT_FILES` (+ budgets, a11y, security baseline files; data-refactor X12); 29 ruleset names sourced in BUILD_MAP WP-104 "Round-6 named files"; ownership rows (UX-022, REF-014, SEC-067, CQ-010 new; AEO-009/SEC-003/URL-006/SE-109 browser slices; LNK-001 → WP-608; AGT-006 html slice removed; ROL-003/SE-103/SE-121/SE-501/KW-002 moved off WP-104); REF-009 viewports now cite 03 § 10 (formats §6); UX-022 duplicated `"failed"` removed (formats §5); resilience `dependency` marker already purpose-based (formats §4: no edit needed, line 10 reads "purposes contain \"dependency\"").

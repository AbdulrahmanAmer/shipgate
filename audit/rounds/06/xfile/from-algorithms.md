# Cross-file requests — from algorithms — round 06

Requests from the algorithms fixer (pass A) for files it doesn't own. Each gives target, location, exact edit, and the finding it serves. 04 § 15 now has two normative items, **Hidden content** and **Disclosure exemption**; § 11 now has the **Generic `<main>` skeleton hash**.

## X1 — spec/packs/answer-engines.md AEO-014 (main bullet)
Serves: concreteness-algorithms #30; orchestrator instruction (one hidden-content definition).

Old: `Hidden-content definition as CNT-009 (`hidden`, `aria-hidden="true"`, computed `display:none`, `visibility:hidden`, `opacity:0`, `font-size` < 2px, clipped to ≤ 1×1 px, positioned wholly outside the page box, text colour within ΔE 3 of its computed background). **Exempt** everywhere: user-revealable disclosure content (as CNT-009), closed `<dialog>`/popover content, menus controlled by a control with `aria-expanded="false"`, inactive slides of ruleset `carousel-markers`, `<template>`, and `<noscript>`.`
New: `**Hidden**: 04 § 15 *Hidden content* (the ΔE 3 colour test is replaced by its contrast < 1.1 test). **Exempt** everywhere: 04 § 15 *Disclosure exemption* (verified by activating the control).`

(Part `ai-addressed` keeps "hidden elements (the definition above, exemptions **not** applied)" — still correct.)

## X2 — spec/packs/answer-engines.md AEO-014 part `agent-parity`
Serves: concreteness-algorithms #5.

Old: `its `<main>` masked skeleton hash (04 § 11) equals the Chrome one`
New: `its generic `<main>` skeleton hash (04 § 11) equals the Chrome one`

## X3 — spec/packs/web-delivery.md RTE-010 part `behaviour`
Serves: concreteness-algorithms #5 (the inline recipe differs from the § 11 generic hash: it doesn't merge adjacent text nodes after comments are dropped, so `a<!--x-->b` hashes differently).

Old: `and an equal `<main>` masked skeleton hash: 04 § 11 steps 1 and 3, every non-whitespace text node replaced with `⟦t⟧`, then step 6.`
New: `and an equal generic `<main>` skeleton hash (04 § 11).`

## X4 — spec/packs/search-engines.md SE-123
Serves: concreteness-algorithms #30 (§ 15 item "Same-colour text" is now part of *Hidden content*).

Old: `No hidden links (computed styles; same-colour per 04 § 15): links whose text is a single non-alphanumeric character, links with zero-size or same-colour text, or links hidden off-screen on indexable pages (accessibility skip links excepted).`
New: `No hidden links: on indexable pages, links whose text is a single non-alphanumeric character, and links that are hidden (04 § 15 *Hidden content*, which includes zero-size, same-colour and off-screen text) (accessibility skip links excepted).`

## X5 — spec/packs/programmatic.md CNT-009
Serves: concreteness-algorithms #30. CNT-009 already points to "04 § 15 *Hidden content*" for "Hidden and its exemptions" — that resolves: *Hidden content* says text meeting the *Disclosure exemption* is not hidden. Optional precision edit:

Old: `**Hidden** and its exemptions: 04 § 15 *Hidden content*,`
New: `**Hidden** and its exemptions: 04 § 15 *Hidden content* and *Disclosure exemption*,`

## X6 — spec/03-formats.md § 5 Rule metadata (YAML block)
Serves: concreteness-algorithms #12.

Insert after the line `channels: [ast, http]          # gates derive from channels (04 § 1.1)`:
`gates: []                      # required for rules with a db or contract channel: the gates their detectors run in (04 § 1.1), e.g. [G2, G6]`

## X7 — spec/packs/security.md SEC-046 probe targets
Serves: concreteness-algorithms #37 (04 § 4.6 now names the alias canary `10.255.255.1`; without a target pointing at it, the alias canary observes nothing).

Old: `` `http://2130706433:{canary}/sg{n}`, ``
New: `` `http://2130706433:{canary}/sg{n}`, `http://10.255.255.1:{canary}/sg{n}` (only when the alias is bound, 04 § 4.6), ``

## X8 — spec/CHANGES.md (Round 06 list)
Serves: STANDARD "every finding fixed in the spec gets a CHANGES.md entry". Append (orchestrator assigns the R06 number):

- **R06-xx — 04 Algorithms concreteness (39 findings).** Handoffs require no unfixed builder-owned blocking finding; `reduced-environment` only when reduced/slow-host are the only partial causes; budget exhaustion is builder-owned (no handoff) when an earlier run on the same lock finished in budget (D-001); environment hash and definition-of-done run defined (D-002); unsupported host directives move checks to G8 and make G8-less runs partial; incomplete crawls make runs partial; per-service BLD-004/005 prerequisite blocking; early-stop statuses; gate-status precedence; owners of `NOT_CONFIGURED`; fixed-size samples and the lock-digest PRNG; generic `<main>` skeleton hash; one *Hidden content* and one *Disclosure exemption* definition (CNT-009, SE-123, AEO-014 reference them; AEO-014's ΔE 3 test replaced by contrast < 1.1); preview/comparison passes placed in the stage order; plus overlap, soft-404, SEC-007, AGT-004, ARC-009, copyright, file-role, attempt, tree-hash, fault-injection, SSRF-alias, readiness, brief-tag and debt-key definitions. Metadata key `gates` for `db`/`contract` rules. · `spec/04-algorithms.md` § 1–16; `spec/03-formats.md` § 5; `spec/packs/answer-engines.md` AEO-014; `spec/packs/web-delivery.md` RTE-010; `spec/packs/search-engines.md` SE-123; `spec/packs/programmatic.md` CNT-009; `spec/packs/security.md` SEC-046; `DECISIONS.md` D-001, D-002.

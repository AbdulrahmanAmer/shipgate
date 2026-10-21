# Cross-file requests — from programmatic-search — round 06 pass A

Requests from the fixer of `spec/packs/programmatic.md` and `spec/packs/search-engines.md`. Each names target file, location, exact old → new text, and the finding it serves (`concreteness-programmatic-search.md#N`).

---

## X1 — spec/04-algorithms.md § 15: the single "Hidden content" definition (serves #2 Blocker, #26, #32)

Owner: algorithms fixer. CNT-009, AEO-014, SE-109 and SE-123 now all cite `04 § 15 *Hidden content*`; this must be the only definition (AEO-014's ΔE 3 is dropped in favour of contrast < 1.1).

Location: the bullet beginning `- **Same-colour text (CNT-009, SE-123):**`.

Old:
```
- **Same-colour text (CNT-009, SE-123):** contrast ratio between text colour and computed background < 1.1.
```
New:
```
- **Hidden content (CNT-009, AEO-014, SE-109, SE-123 — the only definition):** evaluated in the rendered DOM 2 s after `load`, at the mobile and the desktop viewport (when no viewport is defined elsewhere in this spec: mobile 412 × 823 CSS px, DPR 1.75, touch; desktop 1350 × 940 CSS px, DPR 1 — Lighthouse's emulation). An element is **hidden** when any of these holds:
  - it or an ancestor has the `hidden` attribute or `aria-hidden="true"`, or computed `display: none`, `visibility: hidden|collapse` or `content-visibility: hidden`;
  - the product of computed `opacity` over it and its ancestors is < 0.05;
  - it has text and its computed `font-size` is < 2 px;
  - **clip/size:** its border box, intersected with the clip region of every ancestor with `overflow` other than `visible` and with its own and its ancestors' `clip`/`clip-path`, is ≤ 1 × 1 px (covers `width: 0`/`height: 0` with overflow hidden, `clip: rect(0 0 0 0)` and "sr-only" patterns);
  - **off-screen:** its border box (for `text-indent`, the box of its text) lies wholly outside the document's scrollable area: right ≤ 0, bottom ≤ 0, left ≥ the document element's `scrollWidth`, or top ≥ its `scrollHeight`;
  - **same-colour text:** its text colour, composited over its computed background (the nearest ancestor-or-self `background-color` with alpha > 0, composited over white), has a WCAG 2.2 contrast ratio < 1.1. Text over an ancestor-or-self `background-image`, or positioned over an `<img>`, `<video>` or `<canvas>`, is never same-colour.

  **Exempt** (user-revealable or inert content): the content of a closed `<details>` other than its `<summary>`; elements referenced by `aria-controls` of a control with `aria-expanded="false"`; `role="tabpanel"` elements not referenced by the selected `role="tab"`; closed `<dialog>` elements and `[popover]` elements not showing; inactive slides of ruleset `carousel-markers.json`; `<template>`; `<noscript>`. A rule that applies the definition without the exemptions says so (AEO-014 `ai-addressed`).
```

## X2 — spec/packs/answer-engines.md AEO-014 (serves #2 Blocker, #32)

Owner: answer-engines fixer.

Location: AEO-014 main bullet.

Old:
```
Hidden-content definition as CNT-009 (`hidden`, `aria-hidden="true"`, computed `display:none`, `visibility:hidden`, `opacity:0`, `font-size` < 2px, clipped to ≤ 1×1 px, positioned wholly outside the page box, text colour within ΔE 3 of its computed background). **Exempt** everywhere: user-revealable disclosure content (as CNT-009), closed `<dialog>`/popover content, menus controlled by a control with `aria-expanded="false"`, inactive slides of ruleset `carousel-markers`, `<template>`, and `<noscript>`.
```
New:
```
**Hidden** and its **exemptions**: 04 § 15 *Hidden content* (the one definition shared with CNT-009, SE-109 and SE-123). **Ownership:** inside `<main>` of programmatic family and hub pages, part `hidden-text` is owned by CNT-009 (CNT-009 `owns` `AEO-014#hidden-text` there); elsewhere, its hidden-link condition (a hidden element containing an `<a href>` to an indexable page) is owned by SE-123 (SE-123 `owns` it), so part `hidden-text` reports only non-exempt hidden elements of ≥ 30 words without such links.
```
And in part `ai-addressed`, replace `in hidden elements (the definition above, exemptions **not** applied)` with `in hidden elements (04 § 15 *Hidden content*, exemptions **not** applied)`.

## X3 — spec/03-formats.md § 13: inventory `facts` carries `attr` (serves #1 Blocker)

Owner: formats fixer.

Location: the `page` line shape.

Old: `facts{field:{value,text}}`
New: `facts{field:{value,text,attr}}` and append after the `page` bullet: "`attr` is the field's canonical machine value (programmatic TPL-003), which the app renders verbatim as `data-value`."

## X4 — spec/04-algorithms.md § 1.2: LOC-001 facts-oracle, LOC-003 required-facts (serves #3 Blocker)

Owner: algorithms fixer.

Old: `**Facts-oracle rules (UX-003, UX-013, UX-014, UX-019, UX-020 `social-proof` and `stock`):** when the page shows content of the kind the rule checks (claims, testimonials, people, trust marks, logo walls, social-proof widgets, stock counts)`
New: `**Facts-oracle rules (UX-003, UX-013, UX-014, UX-019, UX-020 `social-proof` and `stock`, LOC-001 `address` and `hours`):** when the page shows content of the kind the rule checks (claims, testimonials, people, trust marks, logo walls, social-proof widgets, stock counts, street addresses, opening hours)`

Old: `**Required-facts rules (PRV-022 parts `kr-ecommerce`, `jp-sct`, `cn-icp`; PRV-025):**`
New: `**Required-facts rules (PRV-022 parts `kr-ecommerce`, `jp-sct`, `cn-icp`; PRV-025; LOC-003 for `project.kinds` including `local-business`):**` and, in the same paragraph, after `(no matching `manufacturers[]` entry, a missing `legal` value)` insert `, no `business.json` or an empty `locations` for LOC-003`.

## X5 — CRW-001 is a TR-111 timing rule (serves #14)

Owner: core fixer (01-core.md) and performance fixer (performance.md).

- spec/01-core.md TR-111. Old: `the timing budget rules (PRF-001, PRF-002, PRF-006, PRF-011, PRF-016) are `skipped(slow-host)`` → New: `the timing budget rules (PRF-001, PRF-002, PRF-006, PRF-011, PRF-016, and the verify-environment measurement of programmatic CRW-001) are `skipped(slow-host)``.
- spec/packs/performance.md § Calibration (TR-111). Old: `Calibrated rules: PRF-001, PRF-002, PRF-006, PRF-011, PRF-016.` → New: `Calibrated rules: PRF-001, PRF-002, PRF-006, PRF-011, PRF-016, and CRW-001's verify-environment TTFB (programmatic pack; its edge-pass measurement is not calibrated).`

## X6 — spec/packs/web-delivery.md policy block: `siteAlternateName` (serves #22)

Owner: web-delivery fixer.

Location: line `"brand": "Acme", "siteName": "Acme Plumbing",`
Insert after it: `  "siteAlternateName": null,                    // optional alternate site name; SE-102 checks WebSite.alternateName against it`

## X7 — spec/03-formats.md § 14: merchant and agentic feeds (serves #28, #29)

Owner: formats fixer.

- Merchant feed. Old: `Fields read: `id`, `link`, `price`, `sale_price`, `availability`, `gtin`, `item_group_id` (SE-113).` → New: `Fields read: `id`, `link`, `price`, `sale_price`, `sale_price_effective_date` (ISO 8601 interval `start/end`), `availability`, `gtin`, `item_group_id` (SE-113). A missing or unparsable file is a blocking `parse-error` finding owned by `operator`.`
- Agentic feeds. Old: ``.json`/`.jsonl` (JSON) or `.csv`/`.tsv` (delimited).` → New: `` `.json`/`.jsonl` (JSON), `.csv`/`.tsv` (delimited) or `.xml` (XML; items located by the ruleset `items` XPath).``

## X8 — spec/04-algorithms.md § 15 *Facet probes* (serves #34)

Owner: algorithms fixer.

Old: `- **Facet probes (SE-130/131):** for each `facets.params` entry, a request with the value `shipgate-none` (expected 404),`
New: `- **Facet probes (SE-130/131):** against each facet probe base (search-engines § 3.3: the first 3 URLs in crawl order matching each `facets.routes` pattern, else the first 3 crawled URLs carrying a `facets.params` parameter), for each `facets.params` entry, a request with the value `shipgate-none` (expected 404),`

## X9 — spec/03-formats.md § 3.5 "Additional keys" line (serves #22, #34)

Owner: formats fixer.

Old: `search-engines `facets.defaults: { param: value }`;`
New: `search-engines `facets.defaults: { param: value }`, `facets.routes: [pattern]` (no default), `facets.indexable: [[param…]]`; web-delivery `siteAlternateName` (default `null`);`

## X10 — spec/04-algorithms.md § 11 skeleton identity: which rule reports (serves #9)

Owner: algorithms fixer.

- Step 6a: append `A violation is reported as TPL-005 (`skeleton-mismatch`).`
- Step 8: append `When the first differing node is a text node, the page is reported as TPL-006 (per-row prose) instead of TPL-004.`

## X11 — spec/packs/web-delivery.md KW-002 / MET-013: name the stop-word file (consistency; not a finding of this group)

Owner: web-delivery fixer. Programmatic and search-engines now name the per-locale lists ruleset `stop-words.json` and `verbs.json` (lint `ruleset-unnamed` fix). For one name across packs, web-delivery's lint warnings at lines 138 and 169 (`ruleset stop words …`) can be resolved the same way: replace `ruleset stop words` with `ruleset `stop-words.json``.

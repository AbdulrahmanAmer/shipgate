# Pack: targeting

> Checks the site against what it is meant to win: the Operator-approved targets and site plan (06 §§ 4–5). It is deterministic and offline: it reads only the signed `quality/targets.json`, `quality/plan/` and the site (06 G2). Applies when `quality/targets.json` exists; without it every rule is `notApplicable(no-targets)`, and the diagnosis says so. It replaces nothing in web-delivery § 12 (KW-*): a signed targets file also fills the web-delivery `targets` map (one entry per cluster: primary query → target page), so KW-001, KW-002 and LNK-005 run on it, and its cluster `questions` feed answer-engines `questions` (AEO-004).

---

## 1. Policy section

```jsonc
"targeting": {
  "minTermCoverage": 0.6,          // TGT-005: share of a brief's requiredTerms the page must cover
  "wordRangeSlack": 0.25,          // TGT-009: allowed shortfall below the brief's wordRange minimum
  "staleDays": 180,                // TGT-001: research older than this is stale
  "priorityPages": 20              // TGT-011: how many top clusters must have a built page
}
```

Channel `targets` runs in G5 (04 § 1.1) on the HTTP-sample pages and site graph of G4. Pages are matched to clusters through the signed site plan (`quality/plan/site.json`, 03 § 22); a planned page not found at its URL is TGT-002's.

## 2. Rules — `TGT-*`

- **TGT-001** · P1 (part `stale` W) · targets — The targets and plan are valid and traceable: `quality/targets.json` and `quality/plan/` parse against 03 §§ 21–22; both are signed in the lock (TR-235); every cluster has a primary query and an intent; every number carries `source`, `fetchedAt` and `cacheKey` (06 G1); every brief passes `plan --check` (TR-231). Part `stale` (W): the research run is older than `targeting.staleDays`.
- **TGT-002** · P1 · targets — Every planned page exists: each `site.json` page answers 200 at its planned URL, is indexable, and is in the site graph. A planned page that answers 404 or redirects is `missing-page`, with its cluster, value and priority.
- **TGT-003** · P1 · targets — No cannibalisation: no indexable page other than a cluster's planned page has a `<title>` or `<h1>` containing that cluster's primary-query head term (web-delivery § 12) with a page type compatible with the cluster's intent (06 § 9.7). Pages listed in the cluster's `alsoServes` (03 § 21.2) are exempt.
- **TGT-004** · P1 · targets — The planned page carries its query where engines and people look first: the `<title>` and `<h1>` (KW-002's check, at P1 here), the meta description, and the first paragraph of the main content (04 § 12) each contain the primary query's head term or one of the cluster's queries (whole words, NFKC, case-folded).
- **TGT-005** · W · targets — Term coverage: the page's main content covers at least `targeting.minTermCoverage` of its brief's `requiredTerms` (06 § 9.5), not counting terms the brief waived. The finding lists the missing terms.
- **TGT-006** · P1 · targets — Outline: every section of the brief's outline appears as a heading (`h2`–`h4`) of the planned page whose text contains the section's head term, in the brief's order. Sections the brief marks `optional` may be absent.
- **TGT-007** · P1 · targets — Planned internal links exist: for each `site.json` link `{ from, to, anchor }`, the raw HTML of `from` has an `a[href]` to `to` (04 § 10 normalisation) whose anchor text (LNK-004 definition) contains the planned anchor's head term. Hub pages link to every spoke.
- **TGT-008** · P1 · targets — The brief's schema type is on the planned page: a JSON-LD node of that type, or a subtype of it per ruleset `schemaorg.json` (the schema.org type hierarchy), is in the page's graph. SCH-* rules judge its validity.
- **TGT-009** · W · targets — Depth: the main-content word count of the planned page is at least the brief's `wordRange` minimum × (1 − `targeting.wordRangeSlack`). The finding gives the count, the range and the winning pages it came from.
- **TGT-010** · P1 · targets — The brief's proof facts are on the page: each proof fact (a `business.json` or dataset value, 03 § 22.2) appears in the main content, formatted by 04 § 15 *Default field formats*, unchanged (P1).
- **TGT-011** · W · targets — Coverage of priority demand: the top `targeting.priorityPages` clusters by priority (06 § 9.4) each have a built planned page. The finding lists the unbuilt ones with their value.
- **TGT-012** · P1 · targets — Intent fit: the planned page's type (06 § 9.3, applied to the page) is compatible with its cluster's intent (03 § 22.2 table): for example a `transactional` cluster's page has a product, offer, or a form or CTA from the brief, and an `informational` cluster's page is not a bare product grid. The finding names the intent and the page type found.

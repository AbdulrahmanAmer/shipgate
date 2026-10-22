# shipgate — 06 Growth

> The stages before and after the gate that decide whether a site gets found, ranks, reaches the right people and gets cited: intake, research, plan, measure, iterate. They feed the gate its targets and turn production results into the next plan. Formats: 03 §§ 20–25. Site rules that check a site against the approved targets and plan: `packs/targeting.md`. Post-launch findings: `packs/measure.md`. CLI and connectors: 05 §§ 1 and 10.

---

## 1. Stage model

A site is built the way an enterprise agency builds one: discovery first, then a plan drawn from demand, then the build, then the quality gate, then measurement, and back to the plan.

| Stage | Command | Reads | Writes | Approved by |
|---|---|---|---|---|
| Intake | `intake` | policy, the live site (remote read), the Operator's answers | `quality/proposals/business.json`, `quality/growth/intake.json` | Operator signs `business.json` (03 § 14) |
| Research | `research` | intake, connected sources (§ 4) | `quality/growth/research/<run>/`, `quality/proposals/targets.json` | — |
| Plan | `plan` | targets (proposal or signed), research run | `quality/proposals/plan/` (site plan, briefs, priorities, off-site plan) | Operator: `approve targets`, `approve plan` (TR-235) |
| Build | agents | `brief` with the page's brief (TR-240) | the project's code | — |
| Gate | `verify` | everything above + the site | report; targeting pack findings | — |
| Measure | `measure` | signed targets and plan, connected sources, production origins | `quality/growth/measure/<date>/`; measure pack findings | — |
| Iterate | `iterate` | the last two measure runs, the research run | `quality/proposals/targets.json`, `quality/proposals/plan/` deltas | Operator, as for Plan |

**Principles (in addition to 01 § 1):**
- **G1 — Every external number is sourced and dated.** Each value from a provider carries `{ source, fetchedAt, cacheKey }` (03 § 20.1). A value without them is invalid in every growth file. An estimate (for example, traffic a provider models) carries `estimate: true` and its method. P1 applies: no source, no value.
- **G2 — The gate stays offline and deterministic.** `verify` never calls a growth provider. Targeting rules read only signed files and the site. Research and measure are online commands whose results reach a verdict only through files the Operator approved and signed.
- **G3 — Agents judge, shipgate computes and checks.** Steps that need judgement (cluster labels, brief prose, outreach angles) are drafted by agents into proposal files. shipgate computes every number (clusters, intents, gaps, priorities, diffs), validates each proposal against the data it came from (`plan --check`, TR-231), and the Operator approves (P6).
- **G4 — Bring your own data access.** Provider credentials live in the OS keychain (03 § 7.1), added by the Operator with `sources add`, never in the repo or a report. A missing provider makes only the parts that need it BLOCKED, each naming its unblock step (TR-210). Nothing is filled from memory or from a model.
- **G5 — Calls are budgeted and cached.** Every provider call is cached by request (03 § 20.2). A re-run within `growth.cacheDays` reuses the cache. `--budget <calls>` caps the calls of one run, and each run's report lists the calls made per provider.

---

## 2. Entry modes and their stage sequences

Every way into shipgate runs the same pipeline from a different starting point. `start <mode>` (CLI, or the MCP tool `start`, 05 § 4) records the sequence in `quality/growth/state.json` (03 § 25), runs the stages not yet done in order, and stops at the first stage that needs an Operator approval or a missing input.

| Mode | For | Stage sequence | Ends with |
|---|---|---|---|
| `audit` | an existing repo | intake → research → gate (`verify --adopt`) → diagnosis | diagnosis (TR-260) |
| `audit --url <url>` | a live site, no code | intake (remote) → research → gate in remote mode (`remote: read` rules only, TR-005) → diagnosis | diagnosis (TR-260) |
| `refactor` | improving an existing site | audit → plan → baseline (refactor pack) → build → gate (`verify --against`) → measure | PASS, plus the first measure run |
| `new` | a site built from scratch | intake → research → plan → `init --new` → build → gate → measure | launch PASS, plus the first measure run |
| `compare <a> <b>` | old vs new, or us vs competitors | intake per site → one shared research run → gate per site (remote) → side-by-side diagnosis | comparison (TR-261) |
| `research` | discovery only | intake → research | targets proposal + research report |
| `measure` | after launch | measure → iterate | measure report + proposals |

**Stage loading.** Each stage gets a brief built only from `state.json`, that stage's inputs (the § 1 table), and the requirements of that stage; it never carries the whole pipeline (P8). A stage whose input is missing ends `BLOCKED(missing-input: <file>)` and names the stage that produces it. A stage can be re-run alone (`start --stage <name>`); later stages whose inputs changed are marked stale in `state.json` and re-run on the next `start`.

---

## 3. Intake — `TR-20x`

- **TR-201** `intake` drafts the business profile from the policy, the live site when one exists (remote read: names, phones, addresses, opening hours, services and products from structured data and visible pages), and the Operator's answers. It asks once, in one batch, only for fields it couldn't find, and each found value cites the URL it came from. It writes `quality/proposals/business.json` (03 § 14 shape) and `quality/growth/intake.json` (03 § 20.3): markets, offerings, audiences, goals with their conversion signal, known competitors, constraints and existing assets.
- **TR-202** Seeds: per market, the offering names, each crossed with the market's place names (ruleset `gazetteer/<country>.json`) when an offering is local, and with the locale's intent modifiers (ruleset `intent-modifiers.json`), plus the Operator's own seeds. Stored in `intake.json` `seeds[]`, each with its origin. Deterministic: the same intake gives the same seeds.

---

## 4. Research — `TR-21x`

- **TR-210** `sources doctor` lists each capability with its provider (05 § 10), its status (`connected`, `needs-auth: <exact step>`, `not-configured`) and its last successful call. Capabilities: `keywords` (volume, difficulty, CPC, related terms, questions), `serp` (top organic results with SERP features, AI Overview included), `backlinks` (referring domains, link intersect), `gsc` (Search Console), `bing` (Bing Webmaster), `crux` (field Core Web Vitals), `analytics` (conversions), `ai` (answer engines that return their citations). `research` and `measure` run it first; each part that needs a capability without a `connected` provider ends `BLOCKED(source: <capability>)`, reported with its unblock step.
- **TR-211** Demand: per market, the seeds are expanded through `keywords` (related terms, matching terms, questions) to depth `growth.research.expandDepth`, plus the site's Search Console queries of the last 90 days with ≥ 1 impression when `gsc` is connected. Queries are deduplicated after NFKC and lowercasing, and the run stops at `growth.research.maxKeywords` by descending volume. Each row: `{ query, market, volume, difficulty, cpc, origin, source, fetchedAt, cacheKey }`.
- **TR-212** Intent: every query gets exactly one of `informational`, `commercial`, `transactional`, `local`, `navigational`, by § 9.2.
- **TR-213** SERP capture: for each query with volume ≥ `growth.research.minVolume`, in descending value order (§ 9.4) up to `growth.research.serpBudget` queries, the top 10 organic URLs, the SERP features present (featured snippet, AI Overview with its cited URLs, local pack, People Also Ask questions, video, images, shopping, news), and the page type of each result (§ 9.3).
- **TR-214** Clusters: queries are grouped into the clusters one page should rank for, by § 9.1. Each cluster has a primary query, an intent (the primary query's), a value and a priority (§ 9.4).
- **TR-215** Competitors: the domains with the most top-10 appearances across the priority clusters (excluding the site's own hosts, and with directories and marketplaces from ruleset `directory-domains.json` flagged, not dropped), plus `intake.json` `competitorsKnown`. For each competitor: its top pages (provider traffic estimate, labelled as an estimate), the clusters where it ranks top 10 and the site has no page (content gap), and its referring-domain count.
- **TR-216** Winning-page profile: for each priority cluster, the top 3 organic results are fetched under the remote-read crawl rules (04 § 10, politeness included) and profiled: page type, main-content word count, heading outline, terms (§ 9.5), schema types, media counts, and the questions they answer. The profile gives `winningFormat` (the most common page type), `requiredTerms` (terms on ≥ 2 of the 3) and `wordRange` (min–max of the 3).
- **TR-217** Adjacent demand: related queries from `keywords` for the audience terms in `intake.json`, that match no offering's head term (web-delivery § 12), are clustered separately and flagged `adjacent: true`: what the same people search outside the niche, as candidates for linkable assets and guides.
- **TR-218** Authority: referring domains of the site and of each competitor, and the link intersect (domains linking to ≥ 2 competitors and not the site, from `backlinks`). For local offerings: presence on the business directories of ruleset `citation-sources.json` for each market's country, with name, address and phone compared to `business.json` (exact match after normalisation, 04 § 15).
- **TR-219** AI-answer sampling: for each priority cluster, up to `growth.ai.questionsPerCluster` questions (its People Also Ask and question-form queries, by volume), asked to every connected `ai` provider by the § 9.6 protocol. Recorded per answer: the provider and model, the date, the answer's hash, every cited URL, whether a site origin host is cited, and which competitor domains are. The citation rate per question is over `growth.ai.samples` answers.
- **TR-220** The run writes `quality/growth/research/<run>/` (03 § 21): `report.md` plus the tables `keywords.jsonl`, `serps.jsonl`, `clusters.json`, `competitors.json`, `authority.json`, `ai-citations.jsonl`; and `quality/proposals/targets.json` (03 § 21.2), with clusters in priority order. Every number in the report cites its table row.

---

## 5. Plan — `TR-23x`

- **TR-230** Site plan: each cluster maps to exactly one page. That is an existing page when one matches by § 9.7, else `new`, with a URL proposed in the service's URL style (03 § 3.2). Clusters whose primary queries share a parent topic (the head term minus place names and intent modifiers), at least 3 of them, get a hub page that links to each. The internal-link plan: hub ↔ spoke, each spoke → 2 sibling spokes chosen by shared terms, and every planned page within `web-delivery.maxClickDepth` clicks of the homepage. Written to `quality/proposals/plan/site.json` (03 § 22).
- **TR-231** Briefs: one per planned page, `quality/proposals/plan/briefs/<pageId>.json` (03 § 22.2). shipgate writes the computed fields: primary query and queries, intent, required terms, questions, word range, schema type (from `winningFormat`, 03 § 22.2 table), links in and out, CTA (from the cluster's goal), and the proof facts available in `business.json` and the datasets. The agent drafts the prose fields: title, H1, meta description, outline. `plan --check` validates every brief: the title and H1 contain the primary query's head term, the lengths are within MET limits, every outline section is a string, every proof fact resolves to a source value (P1), and every required term appears in the outline or is waived by the agent with a reason.
- **TR-232** Programmatic candidates: clusters whose primary queries differ only by one gazetteer place or one value of a dataset entity field form a family candidate, written with the demand per row to `quality/proposals/plan/families.json`. Adopting one means adding it to the programmatic policy, where that pack's data contracts and demand gating apply.
- **TR-233** Off-site plan, `quality/proposals/plan/offsite.md`, advisory and never gated:
  - link prospects from the link intersect, with their source;
  - digital-PR angles from adjacent clusters with a linkable asset;
  - the local plan: Business Profile categories used by the local-pack competitors, missing citations, and name/address/phone fixes from TR-218;
  - the AI-visibility plan: the entity facts to publish consistently (organization, sameAs, authors), citable statistics available from the datasets, and the sources the answer engines cited for our questions where the site could be listed or quoted.
- **TR-234** Priorities: every action (new page, page change, gate finding, off-site item) gets an impact and an effort by § 9.4, sorted into `quality/proposals/plan/priorities.json`. Quick wins are high impact with effort `S`.
- **TR-235** `approve targets` and `approve plan` (Operator verbs, 05 § 3.2) show the diff against the current signed files, then write `quality/targets.json` and `quality/plan/` and sign them into the lock (03 § 8). From then on they are the oracle of the targeting pack (P3). An approval keeps the research run id, so every target traces back to its data.

---

## 6. Build — `TR-24x`

- **TR-240** `brief` (04 § 7) for a file whose route maps to a planned page includes that page's brief, at most 60 lines: primary query, intent, title, H1, outline, required terms, questions, proof facts, links, schema type and CTA. The session-start brief in modes `new` and `refactor` lists the planned pages not built yet, highest priority first.

---

## 7. Measure — `TR-25x`

- **TR-250** `measure` reads the production origins (policy) and the connected sources and collects, per signed target and page:
  - Search Console clicks, impressions, CTR and position for the last 28 days and the 28 before;
  - index status (URL Inspection, within the provider's quota, highest-priority pages first);
  - the Bing equivalents;
  - the rank of every target query (`serp`);
  - AI citations (TR-219 protocol);
  - field Core Web Vitals at p75 per URL or origin (`crux`);
  - referring domains gained and lost since the last run (`backlinks`);
  - conversions per goal (`analytics`).
  It writes `quality/growth/measure/<date>/` (03 § 23) and evaluates the measure pack.
- **TR-251** Diff: each measure run is compared with the previous one under the § 9.8 significance rules, so no finding is raised on noise.
- **TR-252** `measure` only reads production (`remote: read`), is never part of `verify`, and never changes a release verdict. It is scheduled by CI cron (05 § 5) or run by hand.

---

## 8. Diagnosis — `TR-26x`

- **TR-260** Audit modes end with `quality/out/diagnosis.md` and `diagnosis.json`. They answer, in this order, in plain words, defining each term of art once:
  1. **Reach:** can search engines and AI crawlers fetch, render and index the site? (gate findings of the crawl, status, rendering, robots and indexing rules)
  2. **Demand coverage:** is there a page for what people search? (clusters without a page, pages with the wrong intent, cannibalisation: TGT-002, TGT-003, TGT-012)
  3. **Competitiveness:** is each page at least as good as what ranks now? (vs the winning profiles: depth, terms, format, proof, speed: TGT-005, TGT-009)
  4. **Authority:** links, mentions and local citations against the competitors (TR-218)
  5. **AI visibility:** citation rates, who is cited instead, and what their pages have that ours don't (TR-219)
  6. **The plan:** the top 20 of `priorities.json`, each with its expected impact, effort, and the rule or metric that proves it is fixed.
  Findings are grouped by root cause (04 § 9).
- **TR-261** `compare` writes both diagnoses side by side from the same research run and options, with the difference per section.

---

## 9. Algorithms

### 9.1 Clusters
Two queries are linked when their top-10 organic URL sets (after 04 § 10 URL normalisation) share at least `growth.research.clusterOverlap` URLs. Clusters are the connected components of that graph, computed with union-find over queries in descending volume order, ties broken by the query's code-point order. A query without SERP data (outside `serpBudget`) joins the cluster of the captured query whose head term equals its own, else stays a cluster of one, marked `serp: false`. The primary query is the highest-volume member (ties: lower difficulty, then code-point order).

### 9.2 Intent
The first matching rule wins:
1. The SERP has a local pack, or the query contains a place name of the market's gazetteer or a `local` modifier → `local`.
2. ≥ 3 of the top 10 are product or category pages (§ 9.3), or the SERP has shopping results, or the query has a `transactional` modifier → `transactional`.
3. The query has a `commercial` modifier (best, vs, review, top, price, and the locale equivalents) or ≥ 3 of the top 10 are comparison or review pages → `commercial`.
4. ≥ 5 of the top 10 are on one domain, or the query equals a brand in ruleset `directory-domains.json` or `intake.json` → `navigational`.
5. Otherwise → `informational`.
Modifiers come from ruleset `intent-modifiers.json` for the market's locale.

### 9.3 Page type
From the result's schema types and URL path, in order: `Product` or `Offer` → product; `ItemList`, or a path ending in a category segment of an adapter's route patterns → category; `LocalBusiness` or a subtype → local; `Article`, `BlogPosting` or `NewsArticle` → article; `VideoObject` as the main entity → video; `QAPage` or a forum host in ruleset `directory-domains.json` → forum; a host in `directory-domains.json` → directory; a path with `vs` or `-vs-`, or `Review` as the main entity → comparison; else → page.

### 9.4 Value, impact, effort
- Query value = volume × max(cpc, `growth.research.cpcFloor`). Cluster value = the sum over its members. Both are labelled estimates when the provider models the volume.
- Winnability = 1 − difficulty ÷ 100, multiplied by 0.5 when the site's referring domains are below half the median of the cluster's top-3 results.
- Impact of a new or changed page = cluster value × winnability, scaled into bands `L`, `M`, `H` by tertiles across the run. Gate findings take their band from severity: P0 → `H`, P1 → `M`, P2 and W → `L`. When a P0 finding blocks crawling or indexing of pages carrying cluster value, it is `H` no matter what.
- Effort comes from a fixed table: metadata or link change `S`; content addition to an existing page `M`; new page `M`; new programmatic family `L`; off-site item `M`; gate findings `S` for P2 and W, `M` otherwise.
- Priority = impact band, then effort (`S` first), then cluster value.

### 9.5 Terms
The terms of a page are the 1- to 3-word n-grams of its headings, list items and `<strong>` text (UAX #29 words, NFKC, lowercased), minus the locale's stop words (ruleset `stop-words.json`). A required term is one that appears on ≥ 2 of the 3 winning pages. A page covers a term when it appears in its main content (04 § 12 main-content extraction).

### 9.6 AI-answer protocol
Each question is sent as the user message alone, in the market's language, with no system prompt beyond the provider's default, web search or grounding enabled, and with the market's country as the location where the provider accepts one. It is sent `growth.ai.samples` times, at least 60 s apart. A citation is a URL the provider returns as a source, or a URL in the answer text. The site is cited when a citation's host is a site origin host or an alias host (URL-011). The citation rate is cited answers ÷ answers.

### 9.7 Page–cluster match
An existing indexable page matches a cluster when its `<title>` or `<h1>` contains the primary query's head term (web-delivery § 12), and its page type (§ 9.3 applied to the page) is compatible with the cluster intent (03 § 22.2 table). Several matches → the one with the most Search Console clicks for the cluster's queries, else the shortest URL path. The others are cannibalisation candidates (TGT-003).

### 9.8 Significance (measure)
- A position change counts when it is ≥ 3 positions, for a query with ≥ 50 impressions in both 28-day windows.
- A clicks change counts when the new value falls outside the Poisson 95% interval of the old one.
- A citation change counts when the cited count differs by ≥ 2 of `growth.ai.samples`.
- A Core Web Vitals change counts when the p75 status (good, needs improvement, poor) changes.

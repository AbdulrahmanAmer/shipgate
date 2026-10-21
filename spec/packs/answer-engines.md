# Pack: answer-engines (AEO / GEO)

> Making pages easy for answer engines (ChatGPT search, Perplexity, Google AI Overviews, Copilot, Claude) to reach, understand, attribute and cite. Builds on web-delivery: the most important rule for answer engines is already RTE-001 (content in raw HTML), because most AI crawlers don't execute JavaScript.

**Evidence level, stated honestly:** search engines say AI features rely on normal SEO fundamentals, and published evidence for AEO/GEO-specific tactics is thin. So only clearly decidable, low-regret rules block (P1); structural heuristics are warnings. Being cited cannot be guaranteed by any build tool; measuring citations (share of voice in AI answers) belongs to the separate monitoring product.

**Google specifically:** Google's documentation states that AI Overviews and AI Mode have no extra requirements beyond being indexed and eligible for a snippet in Search (RTE-001, IDX-*, MET-006, AEO-001), uses Googlebot for them (`Google-Extended` doesn't affect them, IDX-008), and that Google does not use `llms.txt`. `llms.txt` (IDX-010) and machine-text variants (IDX-013) serve other agents only.

---

## 1. Policy section

```jsonc
"answer-engines": {
  "organization": {
    "sameAs": ["https://www.linkedin.com/company/acme", "https://www.wikidata.org/wiki/Q000000"],
    "logo": "web:/brand/logo.png"
  },
  "authors": { "pagePattern": "web:/authors/{slug}" },
  "questions": [ { "question": "how much does a plumber cost in austin", "url": "web:/plumbers/austin-tx" } ],
  "snippetRules": [],                                // pages allowed to restrict snippets: [{ pattern, reason }]
  "indexNow": { "enabled": false, "keyPath": null }, // key file path, e.g. "web:/3f9c…e1.txt"
  "botProtection": { "provider": "none" }            // "cloudflare" | "akamai" | "fastly" | "vercel" | "none"
}
```

## 2. Rules — `AEO-*`

- **AEO-001** · P1 · html, http — No unintended snippet restrictions on indexable pages: no `nosnippet`, no `max-snippet` below 50, no `noimageindex`, no `max-image-preview:none` or `:standard`, no `max-video-preview:0`, no `data-nosnippet` on an element containing the `<h1>` or more than 50 % of `<main>` text, in meta robots (`robots`, `googlebot`, `bingbot`) or `X-Robots-Tag` — unless the page matches `snippetRules`. Part `large-preview` (W): `max-image-preview:large` absent (Discover pages: SE-103 owns it as P1). (Bing's `noarchive`/`nocache`, which limit Copilot grounding, are owned by SE-201; Naver's `nosourceinfo` by SE-404.)
- **AEO-002** · P1 · html, edge — Entity identity: every page's `Organization` node uses the same `@id`, `name` and `logo` (= `organization.logo`, crawlable, ≥ 112×112) and lists exactly the declared `sameAs` URLs (P1). Whether those external URLs resolve is checked with HEAD in the edge pass only and is W (many profile sites block automated requests).
- **AEO-003** · P1 · html, http — Authors: `Article`/`BlogPosting` authors are `Person` nodes with `name` and `url` pointing to an existing author page (matching `authors.pagePattern`, 200, indexable) that carries `Person` markup; missing `sameAs` on the author page is W.
- **AEO-004** · W · html — Answer-ready structure for each declared `questions` entry: the target URL has a heading containing the question's head terms, followed by a direct answer paragraph of ≤ 80 words before any other heading, list or table.
- **AEO-005** · W · html, diff — Citable statistics: on non-programmatic indexable pages, paragraphs stating percentages, currency amounts or "according to …" contain or are followed (same section) by at least one outbound link to a source. Part `added` (P1 · html, diff): paragraphs added in the diff on indexable non-programmatic pages (a rendered paragraph counts as added when a run of ≥ 8 consecutive normalised words of it occurs in a line added by the diff and in no removed line) that state percentages, amounts or "according to …" must meet this. It is the guard against invented statistics in agent-written articles, and LNK-007 checks that the source link resolves.
- **AEO-006** · P1 · html, site — Freshness consistency: where a visible "updated"/"published" date, JSON-LD `dateModified`/`datePublished` and sitemap `<lastmod>` exist for a page, they agree to the day.
- **AEO-007** · P1 · http — IndexNow (when `indexNow.enabled`): the key file is served at `keyPath` as `text/plain` containing exactly the key. Submissions are made by the Operator's deploy pipeline, never by agents (AGT-008).
- **AEO-008** · W · edge, review — Crawler reach at the edge: in the edge pass, sampled indexable pages requested with the `userAgent` of each `ai-agents.json` token that `aiCrawlers` allows (web-delivery IDX-008) don't return 403/429 or a challenge page. Because edges verify real crawlers by IP, a block here is a warning plus a review item to confirm the bot-protection settings (`botProtection.provider`, e.g. AI-crawler blocking defaults) match the policy.
- **AEO-009** · P1 · html — Primary content is text: indexable pages don't carry their main text as images of text (images in `<main>` with alt text > 100 characters standing in for content), `<canvas>`, or cross-origin iframes; documents (PDF) that are primary content link to an HTML version (W if absent).
- **AEO-010** · P1 · html — Data tables in `<main>` use `<table>` with header cells (`<th>` or `scope`), not images or div grids marked `role="table"` without headers.
- **AEO-011** · deprecated — tombstone; `llms.txt` is covered by IDX-010 (web-delivery); AI crawler robots policy by IDX-008.
- **AEO-012** · P1 · baseline — No fake freshness: for each page present in this run and in `_main/routes.jsonl` (`skipped(no-main)` without it) whose normalised `<main>` text hash is unchanged (`mainTextHash`: NFKC, whitespace-collapsed, with `<time>` elements and the date strings found by AEO-006 removed), JSON-LD `dateModified`, the visible "updated" date and the sitemap `<lastmod>` equal their `_main` values. Owner of "dates move only with content"; AEO-006 owns agreement between the three sources.
- **AEO-013** · W · html — Citation anchors: on `Article`/`BlogPosting`/`NewsArticle` pages with > 1,000 `<main>` words, every `<h2>` and `<h3>` in `<main>` has an `id` that is unique on the page and doesn't match a ruleset auto-generated id pattern (`autoIdPatterns`: e.g. `:r[0-9a-z]+:`, `radix-…`, `headlessui-…`, UUIDs, ≥ 8-character hex), so deep links survive rebuilds.

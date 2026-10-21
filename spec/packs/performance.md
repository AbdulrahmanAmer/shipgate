# Pack: performance

> Page experience (Core Web Vitals), delivery efficiency (bytes, caching, compression), and API latency. Lab results are necessary, not sufficient; field data is recommended on top.

---

## 1. Policy section

```jsonc
"performance": {
  "defaults": { "lcpMs": 2500, "cls": 0.1, "tbtMs": 200, "inpMs": 200, "scriptBytes": 170000, "cssBytes": 60000,
                "renderBlockingMs": 300, "thirdPartyBlockingMs": 250, "seoScore": 1.0,
                "ttfbMs": 600,                                                  // warm server response, non-programmatic routes (PRF-016)
                "pageBytes": 1638400, "htmlBytes": 102400 },                   // total transfer 1,600 KiB; HTML document transfer 100 KiB (PRF-019)
  "routes": { "/dashboard/**": { "lcpMs": 3000, "scriptBytes": 300000 } },   // per-surface/route overrides
  "api": { "p95Ms": 300, "concurrency": 10, "requests": 200 },                // lab load on declared endpoints
  "lighthouse": { "preset": "mobile", "runs": 3 },
  "minBenchmarkIndex": 1000,                                                  // TR-111: below it, timing budgets are skipped(slow-host)
  "fonts": { "maxFamilies": 2 },
  "htmlMaxAgeSec": 0,                                                         // HTML cacheable this long without revalidation
  "images": { "maxOversizeRatio": 1.5 }                                       // intrinsic width ≤ ratio × rendered width × DPR
}
```

Budgets apply per route group: public pages via sampled URLs, `app` pages via the declared flows (testing pack) logged in as a test account.

**Calibration (TR-111).** The host is calibrated once per run: the median `benchmarkIndex` measured at the start of G4 (04 § 6.3) is the only index; every timing rule, including INP from flows in G6, compares it with `minBenchmarkIndex`, and per-run Lighthouse indices are not used for this. `minBenchmarkIndex` defaults to 1000, the floor of Lighthouse's "low-end desktop" bracket (its throttling documentation: high-end desktop 1500–2000, low-end desktop 1000–1500). Lighthouse's fixed 4× CPU slowdown is tuned for desktop-class hosts; below 1000 the throttled run falls under the mid-tier mobile device it emulates, so timing budgets would measure the host, not the page. Calibrated rules: PRF-001, PRF-002, PRF-006, PRF-011, PRF-016. Byte budgets (PRF-010, PRF-019) and pass/fail audits don't depend on host speed and are never `skipped(slow-host)`.

---

## 2. Rules — `PRF-*`

- **PRF-001** · P2 · browser — Per route group (aggregation: 04 § 6.2): LCP ≤ `lcpMs`, CLS ≤ `cls`, TBT ≤ `tbtMs`, script transfer ≤ `scriptBytes`; indexable public pages Lighthouse SEO score ≥ `seoScore`. Timing parts are `skipped(slow-host)` below `minBenchmarkIndex` (TR-111).
- **PRF-002** · P2 · browser — Interaction responsiveness: INP measured by injected `web-vitals` across each declared flow ≤ `inpMs`; `skipped(slow-host)` below `minBenchmarkIndex` (TR-111). Part `probe` (W): on sampled public pages of route groups that no flow visits, clicks on up to 5 visible controls in `<main>` (first 5 in document order of the control inventory built by the flows engine, shared with UX-001/UX-006 and built even when the ux pack is off; navigation intercepted) are measured the same way.
- **PRF-003** · P2 · browser — LCP image handling, at the Lighthouse preset viewport: Lighthouse audit `lcp-discovery-insight` passes (LCP image discoverable in the initial HTML, not lazy-loaded, `fetchpriority=high`); the LCP image has `width`/`height`, responsive `sizes`, AVIF/WebP.
- **PRF-004** · P2 · browser — Layout stability: Lighthouse `cls-culprits-insight` and `unsized-images` pass; media, iframes, embeds and ad slots reserve space.
- **PRF-005** · P2 · ast, html — Fonts self-hosted through the framework pipeline, ≤ `fonts.maxFamilies` families, `font-display: swap|optional`; no external font stylesheets.
- **PRF-006** · P2 · browser — Render-blocking time ≤ `renderBlockingMs` (LCP savings estimated by `render-blocking-insight`) and third-party main-thread time ≤ `thirdPartyBlockingMs` (`third-parties-insight`, measured with real third-party hosts allowed by the `hosts` registry).
- **PRF-007** · P2 · html — Images in `<main>` have numeric `width`/`height` (alt text is owned by A11-007).
- **PRF-008** · P1 · http, edge — Hashed static assets (adapter build manifest, or filenames matching `[.-][a-f0-9]{8,}\.`): `Cache-Control: public, max-age=31536000, immutable`. HTML: `max-age` ≤ `htmlMaxAgeSec` unless `must-revalidate`/`no-cache` is present. Edge-owned caching is checked in G8.
- **PRF-009** · P1 · http — Text responses (HTML, CSS, JS, JSON, SVG) are compressed (br or gzip) when the client accepts it.
- **PRF-010** · P2 · build, browser — Per-route first-load JavaScript ≤ `scriptBytes` and CSS ≤ `cssBytes` (adapter bundle manifest); growth > 10 % vs `_main/budgets.json` is a finding (`skipped(no-main)` without it). W parts on sampled pages: `unused-js` (Lighthouse `unused-javascript` fails), `legacy-js` (`legacy-javascript-insight` fails), `duplicate-js` (`duplicated-javascript-insight` fails).
- **PRF-011** · P2 · http — Declared API endpoints: p95 latency ≤ `api.p95Ms` under `api.concurrency` concurrent requests in the verify environment (lab load, local data volume from seeds; mutating stage, 04 § 4.2 step 8, the "load" stage).
- **PRF-012** · P1 · http — List **pages** are paginated or bounded (API list endpoints are owned by API-005).
- **PRF-013** · W · review — Raising a cache lifetime or disabling a feature to meet a budget is recorded in the report with its impact.
- **PRF-014** · W · review — Field RUM (`web-vitals` or equivalent) reports LCP, INP and CLS per route group in production (production monitoring itself is a separate product).
- **PRF-015** · P2 · browser — Images in `<main>`: intrinsic width ≤ `images.maxOversizeRatio` × rendered width × device pixel ratio; `srcset` present for images rendered wider than 400 CSS px; modern formats (AVIF/WebP) offered.
- **PRF-016** · P2 · http — Server response time: per route group of non-programmatic routes, warm TTFB (one discarded request, then the median of 5 sequential requests per sampled URL; maximum across the group's URLs) ≤ `ttfbMs`. Programmatic family pages are owned by CRW-001.
- **PRF-017** · P2 · browser — Offscreen media deferred: at the Lighthouse preset viewport after load, every rendered `<img>` and `<iframe>` whose bounding box starts at or below the first viewport's bottom edge has `loading="lazy"`. A facade that inserts the iframe only on interaction passes (no iframe at load). The LCP element is exempt.
- **PRF-018** · P2 · browser — Back/forward cache: for sampled public pages, navigating to a same-origin page and back restores from bfcache (CDP `Page.backForwardCacheNotUsed` not fired; `PerformanceNavigationTiming.notRestoredReasons` null or empty), ignoring reasons in the ruleset `bfcache-harness-reasons` list; parts `unload` (an `unload` listener is registered) and `no-store` (public HTML sent with `Cache-Control: no-store`) are reported by name.
- **PRF-019** · P2 · browser — Page weight per route group (aggregation 04 § 6.2): total transfer bytes of the page load (Lighthouse `total-byte-weight`) ≤ `pageBytes`; HTML document transfer ≤ `htmlBytes`.
- **PRF-020** · W · data — Field Core Web Vitals: for each `production.origins` host with `quality/data/crux/<host>.json` (§ 3), every record's p75 `largest_contentful_paint` ≤ `lcpMs`, `interaction_to_next_paint` ≤ `inpMs` and `cumulative_layout_shift` ≤ `cls` — origin records against `defaults`, URL records against the most specific budget of the URL's route group. Part `stale`: a record whose `collectionPeriod.lastDate` is more than 35 days before the reference time (04 § 15). No file: `skipped(no-field-data)` (optional input). Not host-calibrated.

## 3. Implementation notes
- Lighthouse (navigation mode) and the `web-vitals` measurement run through the managed Node and the Playwright-pinned Chromium (04 § 6). HTTP-level checks (PRF-008/009/011/016) are measured by the Verifier directly.
- Lab numbers vary: median of `runs` per URL, then the maximum across the route group.
- Audit ids are those of the pinned Lighthouse (13.x, insight audits); an audit "passes" when its score is ≥ 0.9 (Lighthouse's own pass threshold; `notApplicable` audits pass). When a Lighthouse upgrade renames an audit, the ruleset maps the old id.
- One `benchmarkIndex` per run (04 § 6.3), measured at the start of G4 before load runs, is used by every timing rule in G4 and G6 (TR-111).
- PRF-020 reads `quality/data/crux/<host>.json` (Operator export, one file per production origin host): a CrUX API `queryRecord` response or an array of them (`record.key.origin` or `record.key.url`, `metrics.<metric>.percentiles.p75`, `collectionPeriod.lastDate`).

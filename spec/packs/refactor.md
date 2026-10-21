# Pack: refactor

> Lets agents restructure a live site or platform safely. Before the refactor, shipgate records what the system actually does; afterwards it proves nothing observable changed except what the Operator declared. The baseline is the oracle.

---

## 1. Policy section and change declaration

```jsonc
"refactor": {
  "normalize": {                                   // differences that are never meaningful
    "html": ["asset-hashes", "nonces", "csrf-tokens", "build-ids"],
    "json": { "ignorePaths": ["$..createdAt", "$..updatedAt", "$..requestId"] },
    "headers": ["date", "etag", "x-request-id", "set-cookie:value"]
  },
  "tolerance": { "lcpMs": 100, "cls": 0.02, "tbtMs": 50, "scriptBytesPct": 3, "apiP95Pct": 10 },
  "visual": { "maxDiffRatio": 0.001, "masks": [], "viewports": ["mobile", "desktop"] }
}
```

`quality/refactor.json` (Operator-owned, signed, per refactor) declares intended changes; format and `kind` enum: `03-formats.md` § 11.

---

## 2. Baseline contents (`shipgate baseline`)

Recorded from the running system in the verify environment, then locked:
- **Routes:** discovered (adapter + crawl + sitemap + declared) with status, redirect target, robots, canonical, title, description, h1, normalised main-text hash and extracted text, JSON-LD, internal links.
- **APIs:** contract snapshot; responses to declared and generated requests (normalised).
- **Database:** schema dump after migrations; RLS policies.
- **Flows:** outcome of every declared flow (URLs, visible texts, API states); emails captured by the SMTP sink (subject, link paths, SHA-256 of the normalised text part); third-party requests (host, and event name where the ruleset `analytics-vendors` table or `ux.analyticsMatchers` recognises one).
- **Redirects:** every redirect source declared in host config files for `services[].host` (`vercel.json`, `_redirects`/`netlify.toml`, nginx/apache configs, Cloudflare `_redirects`), web-delivery `retired` entries and adapter-discovered redirect tables (adapter `redirectSources`, e.g. Next `redirects()`), each with its status and `Location`.
- **Remote baselines** (`baseline --from-remote <origin>`, 03 § 12): for re-platforming or rebuilding a live site; routes only, from sitemaps ∪ a capped read-only crawl ∪ `quality/data/legacy-urls.txt` ∪ declared redirect sources. Each route also records `mainWords` (UAX #29 word count of `<main>`, else of `<body>` minus `header`, `footer`, `nav`; REF-010 `depth`), and the capture loads `/` and the browser sample in Chromium (read-only) to record every service worker registration (`scriptURL`, `scope`; REF-013).
- **Budgets:** performance metrics per route group, bundle sizes, accessibility findings.
- **Security observations:** headers, cookie flags, auth/authorization probe results.

## 3. Rules — `REF-*`

- **REF-001** · P0 · cfg — A refactor task requires an existing, signed baseline captured from the base branch before any change (for a rebuild of a live site, a signed remote baseline of its origin); without one, G7 is `BLOCKED(no-baseline)` through its prerequisite (04 § 1.5), so the run is `BLOCKED` with owner `operator`.
- **REF-002** · P0 · baseline — Every baseline observation is equal after normalisation, unless covered by an `allowedChanges` entry. With a remote baseline (re-platforming), only REF-001, REF-010, REF-011 and REF-013 apply; the other REF rules are `notApplicable`.
- **REF-003** · P0 · baseline, http — `url-move` changes: old URLs redirect in one hop to the new ones; new URLs carry the same content, metadata and status; sitemap and internal links updated.
- **REF-004** · P0 · baseline, contract — API responses keep the same shape and statuses; additions only where declared; removals never without a declared versioned change.
- **REF-005** · P2 · baseline — No budget regressions beyond `tolerance` (performance, bundle size, API p95); no new accessibility violations; no weaker security headers or cookie flags.
- **REF-006** · P0 · baseline — Every baseline flow still passes with the same observable outcomes.
- **REF-007** · W · baseline — Changed files with no baseline observation touching them (code the baseline can't see) are listed, so the Planner can add flows or examples before relying on equivalence.
- **REF-008** · W · review — Large refactors run in steps; each step is verified against the same baseline before the next begins (bounded blast radius, easy rollback).
- **REF-009** · P1 · baseline, browser — Visual equivalence: screenshots of every route group at each baseline viewport (mobile and desktop by default) match the baseline within `visual.maxDiffRatio` (default 0.1 % of pixels after anti-aliasing tolerance), with dynamic regions masked (`visual.masks`: selectors for dates, carousels, ads). Larger differences need a `visual` entry in `refactor.json`. Catches CSS/Tailwind refactors that change layout without changing HTML.

- **REF-010** · P0 · baseline, edge — Rebuilds keep every live URL: with a remote baseline, every recorded URL (mapped onto the service origin; URLs on other hosts are listed and ignored) on the new build either (a) returns 200 with equivalent metadata — same indexability, self canonical, `<title>` and `<h1>` equal after whitespace and case normalisation, JSON-LD `@type` set ⊇ the recorded one — unless covered by a `metadata`/`text` allowedChanges entry; or (b) redirects in one hop with a permanent status (301/308; `web-delivery.redirectStatus` when that pack is on) to the target of the matching `url-move` entry in `refactor.json`, which returns an indexable 200 and is not `/` unless the source was `/`; or (c) returns 410 when it matches a `url-remove` entry or a web-delivery `retired` entry without successor. Part `depth` (P1; W when a `text` allowedChanges entry covers the URL): each URL passing under (a) has a `<main>` word count (same counting as `mainWords`) ≥ 0.7 × its recorded `mainWords`. **Where it runs:** always in G7 against the local build; additionally in the edge pass (G8) against `previewUrl` when set; and, once `project.stage` is `"live"` and `edge.production` is `true`, also against `production.origins` in the edge pass (read-only, 04 § 2 item 5). At the edge it checks the IDX-011 sample of 20 recorded URLs plus every recorded URL with a `url-move` entry, at most 200 per origin.
  - **Part `old-origin`** (P0; edge; stage `live`): when the remote baseline's origin host differs from the service origin host (a domain move), each sampled recorded URL on the old origin, under each of https, http, apex and www, answers with one 301/308 hop to its mapped (or `url-move`) target on the new origin. It never lands on `/` unless the source was `/`. The old host's `robots.txt` doesn't disallow Googlebot or Bingbot, since a blocked old domain hides its redirects. Review item (W): Search Console Change of Address and Bing Site Move were submitted.
- **REF-011** · P0 · baseline — Redirects survive: the baseline's redirect sources (§ 2) include every source declared on the base branch (a missing one is a finding: re-capture the baseline), and on the new build each source answers with the same status and the same normalised `Location`, unless covered by a `url-move` or `url-remove` entry.
- **REF-012** · P1 · baseline — Side channels unchanged: for each baseline flow, the captured emails (count, subject, link paths, text-part hash after normalising generated values, dates and tokens) and the third-party request set (host + event name) equal the baseline, unless covered by a `flow` allowedChanges entry for that flow.
- **REF-013** · P0 (part `sw-cache` P1) · baseline, http, browser — Old service workers are retired: for each service worker registration in the remote baseline (mapped onto the service origin), the new build either answers its `scriptURL` with 200, a JavaScript MIME type and a script that calls `self.registration.unregister()`, or sends `Clear-Site-Data` containing `"storage"` or `"cache"` (or `"*"`) on every HTML response of the service. A 404 there leaves the old worker controlling returning visitors. Part `sw-cache` (browser channel; applies whenever the new build registers a service worker on a sampled page, with or without a baseline): (mutating stage, 04 § 4.2 step 8) after logging out (SEC-028's logout), revisiting each `app` page a flow saw while logged in yields no 200 response with CDP `serviceWorkerResponseSource: "cache-storage"`, and an RTE-006 probe URL loaded under the worker's control answers 404.

Formats: `refactor.json` and the baseline layout are specified in `03-formats.md` §§ 11–12; normalisation and visual settings live in the policy section above.

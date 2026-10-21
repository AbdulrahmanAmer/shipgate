# Pack: web-delivery

> Everything search engines and AI crawlers need from a site: rendering, HTTP semantics, URL identity, metadata, structured data, internal and outbound links, indexation and feeds, production launch checks, localisation, mobile parity, crawler policy, trust pages and content hygiene (placeholders, spelling, bulk additions). Applies to `public` surfaces; status/robots rules also cover `app` and `api`.

---

## 1. Policy section

```jsonc
"web-delivery": {                              // origins come from services[].origin (single source)
  "brand": "Acme", "siteName": "Acme Plumbing",
  "redirectStatus": 308,                        // 301 | 308
  "locales": ["en-US"], "defaultLocale": "en-US",
  "localePrefix": "never",                      // "never" (one locale) | "always"
  "xDefault": null,
  "ogLocales": { "en-US": "en_US" },
  "timeZone": "UTC",
  "defaultOgImage": null,                       // asset hosts live in the hosts registry (03 § 3.3)
  "titleLength": { "warnMin": 30, "warnMax": 60, "hardMax": 70 },
  "descriptionLength": { "warnMin": 70, "warnMax": 160, "hardMax": 180 },
  "trackingParams": ["utm_*", "gclid", "fbclid", "msclkid", "ref"],
  "reservedSegments": ["api", "admin", "_next", "static", "assets", "sitemap", "robots", "login", "null", "undefined"],
  "bannedPhrases": ["Market Standard", "N/A", "Contact us for pricing", "your city"],   // lorem/placeholder text: MET-011
  "placeholderAllow": [],                       // strings exempt from MET-011 (exact, case-insensitive, NFKC)
  "soft404Phrases": { "en": ["page not found", "no results found", "coming soon"], "es": ["página no encontrada"] },
  "indexRules": [ { "pattern": "web:/search", "index": false }, { "pattern": "web:/search/**", "index": false }, { "pattern": "web:/**", "index": true } ],  // specificity decides, not order
  "staticPaths": [ { "path": "web:/", "index": true }, { "path": "web:/about", "index": true } ],
  "retired": [],                                // [{ path, successor? }]
  "contentParams": [],                          // [{ pattern, param, mode: "canonical-clean"|"self-canonical" }]
  "pagination": [],                             // [{ pattern, param, style: "query"|"path" }] for non-programmatic listings
  "aliasHosts": [],                             // extra hosts serving the same deployment; adapter defaultAliasHosts are added (URL-011)
  "syndicated": [],                             // [{ pattern, originalUrl }]; originalUrl may use the pattern's {params} (URL-012)
  "maxClickDepth": 4,
  "sitemap": { "maxUrlsPerFile": 45000, "images": false, "videos": false },
  "aiVisibility": true,                         // false = the Operator opts out of AI search/answer visibility (IDX-008)
  "aiCrawlers": {},                             // { "<ai-agents.json token>": "allow"|"disallow" }; unlisted tokens = "allow"
  "llmsTxt": "optional",                        // "required" | "optional" | "off"; default "required" when project.kinds includes "docs" (IDX-010)
  "reviewSources": [],                          // declared real review data sources (enables Review/AggregateRating outside programmatic pages)
  "targets": [ { "query": "emergency plumber austin", "url": "web:/plumbers/austin-tx" } ],  // optional keyword→URL map
  "parity": { "minOverlap": 0.9, "mobileMinOverlap": 0.95 },
  "content": { "maxNewPagesPerChange": 20, "dictionary": "quality/data/dictionary.txt" },   // CQ-006, CQ-007; dictionary: one word per line, absent file = empty
  "externalLinks": { "check": false, "maxUrls": 2000, "checkAdded": true },                // check/maxUrls: LNK-006 (nightly); checkAdded: LNK-007 (default profile)
  "docs": { "versions": null },                 // { latest: "web:/docs", older: ["web:/docs/v1/**"] }, no default (URL-013)
  "trustPages": { "about": "web:/about", "contact": "web:/contact", "editorialPolicy": null, "corrections": null },
  "ymylPatterns": []                            // URL patterns of pages giving health, finance, legal or safety advice (TRS-002)
}
```

Local business facts (name, phones, addresses, hours, locations) come from `quality/data/business.json` (03 § 14), not from policy.

Validation:
- **WCF-001** · P0 · cfg — Every service with a `public` surface has an https `origin` without path, query or port.
- **WCF-002** · P0 · cfg — `defaultLocale ∈ locales`; `localePrefix: "never"` ⇒ exactly one locale; `xDefault` null or a declared path.
- **WCF-003** · P0 · cfg — Trailing-slash policy, locales and base path equal the adapter-discovered framework config.
- **WCF-004** · P0 · cfg — `warnMin < warnMax ≤ hardMax` for title and description lengths.
- **WCF-005** · P1 · cfg — Every `targets[].url` resolves to a declared or discovered route.
- **WCF-006** · P0 · cfg — All patterns parse (03 § 2.1); `indexRules` have no specificity ties.
- **WCF-007** · P0 · cfg — `syndicated[].originalUrl` is absolute https on a host that is no service origin, using only `{params}` of its pattern; `aliasHosts` are concrete or `*.`-prefixed hostnames disjoint from service origin hosts; `trustPages` values are declared or discovered public routes; `content.maxNewPagesPerChange ≥ 1`; `aiCrawlers` keys not in the pinned `ai-agents.json` are W (unknown token).
- **WCF-008** · P0 · cfg — `docs.versions`, when set: `latest` is a path without wildcards or params; every `older` entry parses as a pattern whose literal prefix (the text before its first `*` or `{`) is non-empty, ends in `/`, and is not a prefix of `latest` or of another `older` prefix (the version root).

---

## 2. SEO coverage map

| Area | Rules |
|---|---|
| Crawlability & rendering | RTE-001/002/003/008/009/011/012/013, RTE-014 (mobile parity), RTE-015 (2 MB fetch limit), LNK-001, IDX-004, IDX-008 |
| Status codes, soft 404s, redirects | RTE-004/005/006/007, URL-002/008 |
| Canonicals & duplicates | URL-001/003/004/005/007/009, URL-011 (alias hosts), URL-012 (syndication), URL-013 (docs versions), MET-001/002, CNT-005/006/012 (programmatic), CQ-002 |
| Cloaking | RTE-010 |
| Encoding, language, leaks, placeholders, starter residue | MET-007, MET-008, MET-011 |
| Answer engines (AEO/GEO) | answer-engines pack: AEO-* |
| Engine-specific (Google features & spam policies, Bing/Copilot, Yandex, Naver, Baidu, Seznam, Apple), faceted navigation, robots.txt robustness, webmaster-tool verification, product variants, merchant and agentic-commerce feeds, non-HTML documents | search-engines pack: SE-* |
| Local search (NAP, hours, location pages, Business Profile) | search-engines pack: LOC-*; SCH-006/007 |
| Parameters, facets, pagination, internal search | URL-005, URL-006, IDX-012 |
| Indexation control & environments | MET-006, IDX-001/005/006/007, IDX-013 (markdown/text variants), IDX-016 (confirmation pages) |
| Production launch | IDX-011, URL-011 |
| Sitemaps & feeds | IDX-001/002/003/009, IDX-015 (RSS/Atom) |
| robots.txt & AI crawlers | IDX-004, IDX-008, IDX-010, IDX-014 |
| Titles, descriptions, headings | MET-001–004, MET-013, CQ-001 |
| Social previews | MET-005 |
| Structured data | SCH-001–011 |
| Internal linking & orphans | LNK-002–005 |
| External links | LNK-006, LNK-007 (links added in the diff), SE-120 |
| International | I18-001–009 |
| Mobile & page experience | MET-009, RTE-014, PRF-* (performance pack), A11-* (accessibility pack) |
| Images & video | MET-010, MET-012, SCH-009, CQ-003, CQ-005, PRF-015 |
| HTTPS & security signals | SEC-010, edge rules (G8) |
| Trust (E-E-A-T signals) | TRS-001–004, AEO-002/003 |
| Content quality & claims | CQ-001–009, CNT-* (programmatic) |
| Keyword targeting | KW-001–002 |

---

## 3. Rendering & HTTP — `RTE-*`

- **RTE-001** · P0 · html, browser — Public pages: title, meta description, canonical, robots, `<h1>`, main content, internal links and JSON-LD are in the initial HTML response; rendered `<main>` text overlaps raw `<main>` text ≥ `parity.minOverlap` (04 § 12).
- **RTE-002** · P1 · ast — Public route files are server-rendered or prerendered per the adapter (hint for RTE-001).
- **RTE-003** · W · ast — Client-side fetching of primary content on public routes (hint for RTE-001).
- **RTE-004** · P0† · http — Status contract:

  | Case | Status | Robots | Canonical | Sitemap |
  |---|---|---|---|---|
  | Indexable public page | 200 | index,follow (or none) | self | yes |
  | Public page, `noindex` by `indexRules` | 200 | noindex,follow | self | no |
  | `app` page, authenticated | 200 | noindex,nofollow | — | no |
  | `app` page, anonymous | 302/303 → `auth.loginPath` (or 401) | noindex | — | no |
  | Unknown URL | 404 | noindex | none | no |
  | Retired path, no successor | 410 | noindex | none | no |
  | Moved path / non-canonical variant (case, slash, `?page=1`) | `redirectStatus`, one hop | — | — | no |
  | Tracking or unknown query params | 200 | as page | clean URL | no |
  | Internal site-search results (IDX-012) | 200 | noindex (or path robots-disallowed) | not a search URL | no |
  | Empty / out-of-range paginated page | 404 | noindex | none | no |
  | Dependency failure | 5xx | — | — | — |
  | Non-production deploy (`DEPLOY_ENV` ≠ production) | as above | noindex,nofollow + `X-Robots-Tag` | self | no sitemap |

  Soft 404 (04 § 12 detection) on a 200 response fails.
- **RTE-005** · P0 · ast, http — The 404 decision happens before the response is committed (adapter traps, e.g. Next.js streaming); proven by the status code.
- **RTE-006** · P0 · ast, http — Closed route space: unknown **route parameters** are rejected or validated before render; a probe value under each dynamic route returns 404.
- **RTE-007** · P0† · http — Dependency errors return 5xx (stale caches may keep serving), never 404 or a 200 shell; proven by the core fault-injection facility in G4 (04 § 4.5: database stopped, upstream refused) on a sample. Owner of this behaviour; the resilience pack references it.
- **RTE-008** · P1 · html — One owner per tag: no duplicate `<title>`, description, canonical, robots or viewport tags in rendered HTML.
- **RTE-009** · P0 · html — No meta refresh or `Refresh` header on indexable pages.
- **RTE-010** · P0† · http, ast — No cloaking: `<main>` skeleton identical under Googlebot and Chrome user agents, after removing elements matched by `hasPart.cssSelector` of `isAccessibleForFree: false` markup (properly declared paywalls, SE-109). (Empty user agents are often blocked by bot protection legitimately; a difference there is W. Source hint: 04 § 13.)
- **RTE-011** · P1 · ast — Rendering code doesn't read clock/randomness for output (allowlist in 04 § 13); locale formatting passes an explicit locale and `timeZone`.
- **RTE-012** · P1 · build — Two builds from identical inputs produce identical public HTML except asset hashes (`--profile nightly`).
- **RTE-013** · P1 · browser — Sampled public pages and flow steps on public surfaces: zero uncaught errors from origin scripts, zero hydration/mismatch errors reported by the framework, zero failed (4xx/5xx) same-origin subresources. Errors from non-origin scripts are excluded (04 § 6.1). Owns these checks on public surfaces; TST-009 on app surfaces.
- **RTE-014** · P0 · html, http — Mobile parity between the smartphone and desktop Googlebot UAs (Google indexes the smartphone response): raw-HTML `<main>` text and links overlap ≥ `parity.mobileMinOverlap`; identical `<title>`, meta description, robots directives (meta and `X-Robots-Tag`), canonical, hreflang set (`hreflang` → `href` pairs) and set of JSON-LD `@type`s; no content or structured data available only on desktop.
- **RTE-015** · P1 · http — Fetch-size limit (Googlebot reads only the first 2 MB of an HTML file, and of each referenced JS/CSS file, uncompressed): part `size` — the decoded body of an indexable page is ≤ 2,000,000 bytes (part `size-warn`, W: > 1,000,000 bytes); part `cutoff` — the end of `</head>` (with title, meta robots, description, canonical, hreflang), the first `<h1>`, every JSON-LD block and `</main>` lie within the first 2,000,000 decoded bytes; part `subresource` — each same-origin `<script src>`, `<link rel="stylesheet">` and `<link rel="modulepreload">` referenced in the raw HTML of an indexable page has a decoded body ≤ 2,000,000 bytes.

## 4. URL identity — `URL-*`

- **URL-001** · P0 · cfg, http — One canonical form per page: https, the service's origin host, lowercase path (unless `pathCase: insensitive`), the service's trailing-slash policy, locale prefix per policy, no query except declared pagination/content params.
- **URL-002** · P0 · http, edge — Non-canonical variants reach the canonical in exactly one hop with `redirectStatus` (auth redirects exempt); no chains or loops; a canonical URL returns 200. Edge-owned variants (http→https, apex↔www) are verified in G8.
- **URL-003** · P0 · ast — One URL module builds every emitted public URL from route params + the configured origin (data-flow rule, 04 § 13).
- **URL-004** · P0 · html — Exactly one absolute `<link rel="canonical">` equal to the expected canonical (oracle for programmatic pages; self for others; never cross-locale). A canonical to another host is allowed only on pages matching `syndicated` (URL-012); a canonical to another path on the same host only on older-version docs pages (URL-013).
- **URL-005** · P0 · http, html — Query params: tracking and unknown params → 200 with the clean canonical (no redirect); declared content params follow their policy; a parameterised URL gets canonical-to-clean **or** `noindex`, never both. Facet combinations not declared indexable (search-engines `facets`) are either robots-disallowed or fragment-based (SE-132); robots-disallowed facet URLs use canonical-to-clean and never `noindex` (a blocked page's noindex is never read, IDX-004).
- **URL-006** · P0 · http, html — Pagination: page 1 has no page param (`?page=1` → one-hop redirect); page N > 1 self-canonical with a unique title and description containing N; ≥ 1 item per page and no repeats; plain `<a href>` navigation; infinite scroll backed by these URLs.
- **URL-007** · P1 · data, ast, site — Slugs: lowercase, hyphenated, no reserved segments, stable (stored, not recomputed); generator NFKD → strip marks → lowercase → `&`→`and` → non-alphanumerics to `-` → collapse/trim; collisions get a stable disambiguator. Part `slug-quality` (W, site): the last non-empty path segment of an indexable URL, split on `-`, has > 6 words, or contains ≥ 3 consecutive ruleset stop words of the page locale (KW-002 lists), or the path contains a date (`YYYY-MM[-DD]` or `YYYY/MM[/DD]`, year 1900–2099, valid month/day) on a page without `Article`/`BlogPosting`/`NewsArticle` JSON-LD.
- **URL-008** · P0 · http — Moved URLs redirect in one hop to their current canonical (from data/redirect maps); never a blanket redirect to the homepage; retired paths 410.
- **URL-009** · P0 · html, site — Identical canonical string in the canonical tag, `og:url`, sitemap `<loc>`, hreflang targets and JSON-LD `WebPage.url`.
- **URL-011** · P0 · edge — Alias hosts (with `edge.production: true`): every host in `aliasHosts` plus the adapter's `defaultAliasHosts` (platform default domains such as `<project>.vercel.app`, `<site>.netlify.app`, `<project>.pages.dev`; `*.` entries are resolved to concrete hosts from the platform config, unresolved ones are `notConfigured(aliasHosts)`) answers `/` and 3 sampled indexable paths with **either** one 301/308 hop to the same path and query on the canonical origin, **or** 200 with `X-Robots-Tag: noindex`. A 200 without noindex on an alias host is a duplicate site.
- **URL-012** · P0 · html — Syndicated content: a page matching a `syndicated` entry carries **either** `noindex` **or** a canonical equal to the expanded `originalUrl` (not both, MET-006), and `<main>` contains a visible `<a href>` to the expanded `originalUrl`. Such pages are not indexable canonicals (no sitemap entry, IDX-001; KW-* ignore them). Cross-host canonicals on any other page fail URL-004.
- **URL-013** · P1 · http, html — Docs versions (with `docs.versions` set): for every 200 page whose path matches an `older` pattern, its equivalent latest path is `latest` joined by `/` with the remainder of the path after the pattern's literal prefix (WCF-008; `/docs/v1/a/b` → `/docs/a/b`). The page is **either** `noindex` **or**, when the equivalent latest path returns 200, canonical to that path's canonical (not both, MET-006); with no 200 equivalent it must be `noindex`. Older-version pages never appear in a sitemap (a finding of this rule; IDX-001 also reports them in its noindex or non-canonical class).

## 5. Metadata — `MET-*`

- **MET-001** · P0 · html — Exactly one non-empty `<title>` ≤ `titleLength.hardMax`, unique within locale across indexable pages; equals the oracle on programmatic pages.
- **MET-002** · P1 · html — Meta description present, ≤ `descriptionLength.hardMax`, unique within locale across indexable pages; oracle on programmatic pages.
- **MET-003** · P0 · html — Exactly one `<main>` with exactly one `<h1>` on public pages; heading levels don't skip.
- **MET-004** · W · html — Title or description outside the warn range. Copy changes happen in content sources/templates, never by padding or truncating in code.
- **MET-005** · P1 · html, http, edge — `og:title` = `<title>`, `og:description` = description, `og:url` = canonical, `og:type`, `og:site_name`, `twitter:card`; `og:image` from content data or `defaultOgImage`, absolute https on an allowed host, 200 `image/*`, ≥ 1200×630, ≤ 5,000,000 bytes (part `image-weight`, W: > 300,000 bytes); `og:image:width` and `og:image:height` equal the image's pixel size and `og:image:alt` is non-empty; `twitter:card` = `summary_large_image` when the image is ≥ 1200 px wide; `og:locale` only from `ogLocales`. Part `fetchers`: sampled indexable pages requested with each social-preview user agent (ruleset `social-agents.json`: facebookexternalhit, Twitterbot, LinkedInBot, WhatsApp, Slackbot-LinkExpanding, Discordbot, TelegramBot) return 200 with the same `og:title`, `og:image` and `og:url` as the Chrome UA response; in the edge pass a 403/429/challenge for these agents is W (edges verify bots by IP).
- **MET-006** · P0 · html, http — Robots per RTE-004 and `indexRules`; meta robots and `X-Robots-Tag` never conflict; never `noindex` together with a cross-URL canonical.
- **MET-007** · P0 · html — `<html lang>` = page locale = URL locale; `<meta charset="utf-8">` within the first 1024 bytes.
- **MET-008** · P0 · html — Leak scan exactly as in 04 § 12 (template markers anywhere outside code elements; words like `undefined`/`TODO` only when they make up a whole title, meta, heading, attribute, fact or cell value) plus `bannedPhrases`; leaked i18n keys (tokens matching keys of the catalogues found by the adapter's `i18nCatalogs` globs) also fail; without catalogues that part is `skipped`. Lorem ipsum and other placeholder text, whole-value or not, is owned by MET-011.
- **MET-009** · P0 · html — `<meta name="viewport" content="width=device-width, initial-scale=1">` (no `user-scalable=no`, no `maximum-scale` < 2).
- **MET-010** · P1 · html — A favicon is declared (`<link rel="icon">`), returns 200, and is square with a size that is a multiple of 48 px (or SVG); `apple-touch-icon` present (W if missing).
- **MET-011** · P0 · html, http, site, browser — Placeholder and starter residue (owner; MET-008 owns template markers). Scanned: visible text, `<title>`, meta description, `og:*`/`twitter:*` content, `alt`/`title`/`aria-label` values, JSON-LD string values and link `href`s of public pages, excluding the code elements of the 04 § 12 leak scan; matching is whole-word, case-insensitive, NFKC, against the pinned ruleset dictionary `placeholders.json` for the page's language (plus language-neutral entries). Parts:
  - `lorem` — lorem-ipsum sequences (`lorem ipsum`, `dolor sit amet`, `consectetur adipiscing`, and the ruleset's per-locale filler lists);
  - `starter` — framework starter strings (`Create Next App`, `Welcome to Astro`, `Vite + React`, `Get started by editing`, `Welcome to Nuxt`, `Edit src/App`, …) and favicons/`apple-touch-icon`s whose SHA-256 is a framework default in the ruleset (http fetch, as MET-010);
  - `contact` — fictional phone numbers (ruleset ranges, e.g. NANP `555-0100`–`555-0199`, UK Ofcom drama ranges), placeholder addresses (`123 Main St`, `1234 Street Name`), e-mail addresses or links on reserved domains (`example.com`/`.org`/`.net`, any `*.example`, `*.test`, `*.invalid`, `*.localhost`; RFC 2606/6761), names `Your Company`, `Company Name`, `Your Name`, `John Doe`, `Jane Doe`, and `Acme` unless `brand` or `siteName` contains it;
  - `image-host` — `src`/`srcset`/`og:image` on placeholder image hosts (ruleset: `placehold.co`, `via.placeholder.com`, `placeholder.com`, `dummyimage.com`, `picsum.photos`, `source.unsplash.com`, `loremflickr.com`, `placekitten.com`, …);
  - `social` — an `<a href>` to a host in ruleset `social-hosts.json` (share-intent paths listed there excluded) whose path is empty or `/`, or whose handle (the path position the ruleset gives per host) is in ruleset `placeholder-handles.json`; when `business.json` `socialProfiles` is non-empty, every such link must equal one of its entries after normalisation (https, lowercase host, `www.`/`m.` dropped, query, fragment and trailing slash removed);
  - `scaffold-route` (P1, site) — an indexable 200 URL with a path segment (percent-decoded, case-insensitive, whole segment) in ruleset `scaffold-routes.json` (`test`, `demo`, `playground`, `styleguide`, `components`, `kitchen-sink`, `example`, `sandbox`, …), unless the path or the segment is in `placeholderAllow`;
  - `dead-anchor` (P1, browser) — a visible `<a>` whose `href` is absent, empty, `#` or `javascript:` on a browser-sampled page is a dead control (04 § 15, clicked in the control click probe). This part owns `<a>` elements on public pages; every other control, and `<a>` on `app` pages, is UX-006 (ux pack);
  - `copyright` (P1) — the holder in a `©`/`(c)`/`Copyright` notice (04 § 15 copyright holder) contains none of `brand`, `siteName`, `business.json` `name`/`legalName`, or a `placeholderAllow` entry.

  Strings listed in `placeholderAllow` are exempt.
- **MET-012** · P1 · html, browser — Real image sources: every content `<img>` in raw `<main>` (excluding `alt=""`, `role="presentation"`/`"none"`, `aria-hidden="true"`) has a `src` or `srcset` (or a `<picture><source srcset>`) that is not a `data:` URI and does not resolve to an image ≤ 2×2 px (lazy-load placeholders with the real URL only in `data-src` fail). In the browser, each such image after `element.scrollIntoView()` (no wheel or touch events) and network idle (≤ 3 s) has `complete` true, `naturalWidth > 2` and a non-`data:` `currentSrc`. Broken (4xx/5xx) images are CQ-003.
- **MET-013** · W · html — Title quality: part `generic` — after removing the brand suffix, the title is not empty, not only `brand`/`siteName`, and not a ruleset generic title (`Home`, `Untitled`, `Page`, `New Page`, `Document`, `Index`; per locale); part `suffix` — across indexable non-home pages, titles ending in a separator (` | `, ` - `, ` – `, ` — `, ` · `, ` : `) followed by `brand` or `siteName` use the most common separator + suffix pair (pages without a suffix are not findings); part `h1` — the title and the `<h1>` share ≥ 1 term after lowercasing, NFKC, removing the brand suffix and ruleset stop words, and Snowball stemming (KW-002 lists).

## 6. Structured data — `SCH-*`

**Allowed types by surface:** public pages: `WebSite`, `WebPage` (+ `AboutPage`, `ContactPage`, `CollectionPage`, `FAQPage`*), `Organization` (+ `LocalBusiness` subtypes), `BreadcrumbList`, `Article`/`BlogPosting`/`NewsArticle`, `Product`, `ProductGroup`, `Offer`, `OfferShippingDetails`, `MerchantReturnPolicy`, `Service`, `ContactPoint`, `OpeningHoursSpecification`, `SoftwareApplication`, `Event`, `Person`, `Place`, `PostalAddress`, `GeoCoordinates`, `ItemList`, `VideoObject`, `ImageObject`, `Review`/`AggregateRating`*. Programmatic pages: the family's `schemaTypes`, never `Review`, `AggregateRating`, `FAQPage`, `HowTo`, `ClaimReview`, `SpecialAnnouncement`.
\* `FAQPage` only when the Q&A is visible on the page (Google stopped showing FAQ rich results in May 2026; the markup is harmless but earns no rich result, so SE-101 reports it as W); `Review`/`AggregateRating` only from a declared `reviewSources` entry, and never self-serving on `Organization`/`LocalBusiness`.

- **SCH-001** · P0 · html — One `<script type="application/ld+json">` with `@graph`; stable absolute `@id`s (`{origin}/#organization`, `{origin}/#website`, `{canonical}#webpage`, `{canonical}#breadcrumb`, `{canonical}#primary`, `{canonical}#localbusiness` on location pages, LOC-003); every `@id` reference resolves.
- **SCH-002** · P0† · ast, html — Serialised only by `safeJsonLd()` (escapes `<`, `>`, `&`, U+2028, U+2029; adapter codegen provides it per language); raw script text has no case-insensitive `</script`; parses.
- **SCH-003** · P0 · html — Only allowed types for the surface/family.
- **SCH-004** · P0 · html — Required properties:

  | Type | Required |
  |---|---|
  | Organization | `@id`, `name`, `url`, `logo` (≥ 112×112, crawlable) |
  | WebSite | `@id`, `url`, `name`, `publisher` → `#organization` |
  | WebPage | `@id`, `url` (= canonical), `name` (= title), `inLanguage`, `isPartOf` → `#website`; `breadcrumb` when a breadcrumb exists |
  | BreadcrumbList | items with `position` 1..n, `name`, `item` (absolute; last may omit) |
  | Article / BlogPosting | `headline` (= h1), `datePublished`, `author` (Person/Organization with `name` and `url`), `image`; `dateModified` when shown |
  | Product | `name`, `image`, and `offers` (with `price`, `priceCurrency`, `availability`) or `review`/`aggregateRating` from `reviewSources` |
  | Offer | `price`, `priceCurrency`, `availability`, `url` |
  | Service | `@id`, `name`, `provider` → `#organization`, `areaServed` |
  | LocalBusiness | `@id`, `name`, `url`, `address` (`streetAddress`, `addressLocality`, `postalCode`, `addressCountry`), `telephone` when shown |
  | SoftwareApplication | `name`, `applicationCategory`, `operatingSystem`, `offers` |
  | Event | `name`, `startDate`, `location`, `eventStatus`, `eventAttendanceMode` |
  | VideoObject | `name`, `description`, `thumbnailUrl`, `uploadDate`, `contentUrl` or `embedUrl` |
  | ItemList | `itemListElement` with `position` and `url` |

- **SCH-005** · P0 · html — No `""`, `null`, `[]`, `{}` values; no `0,0` coordinates; no invented dates.
- **SCH-006** · P0 · html — Listed properties appear in visible text: names and addresses by normalised containment (NFKC, case-folded, whitespace-collapsed); prices, dates and ratings by parse-back of visible text (04 § 11) compared as values; `telephone` by E.164 normalisation of visible phone text and `tel:` links (default region: the address country, else the `defaultLocale` region); `openingHoursSpecification` (`dayOfWeek`, `opens`, `closes`) by parse-back of visible hours (CLDR day names and time patterns of the page locale, 24-hour comparison). Omitted page sections are omitted from JSON-LD.
- **SCH-007** · P0 · html, data — `LocalBusiness` only with a verified physical location (programmatic: `localBusiness` fields; elsewhere a `locations[]` entry of `quality/data/business.json` whose `pagePath` is the page, LOC-003); service-area pages use `Service` + `areaServed`.
- **SCH-008** · P1 · html — `BreadcrumbList` mirrors the visible breadcrumb (`<nav aria-label="Breadcrumb"><ol>`) exactly.
- **SCH-009** · P1 · html — Pages whose primary content is a video carry `VideoObject`; video files and thumbnails are crawlable (not blocked by robots).
- **SCH-010** · W · html — Article pages show a visible author name and published date matching the JSON-LD.
- **SCH-011** · P1 · html — Vocabulary and value formats: every `@type` and property exists in the schema.org version pinned by the ruleset (`schemaorg.json`; a property used on a type outside its `domainIncludes`, supertypes included, is W); values of `Date`/`DateTime`-ranged properties are ISO 8601 (DateTime with offset); `Duration`-ranged properties are ISO 8601 durations (`PT1H30M`); `price`/`lowPrice`/`highPrice` are a JSON number or a string matching `^\d+(\.\d+)?$` (no symbols, no grouping); `priceCurrency`/`currency` are ISO 4217 codes; `availability`, `itemCondition`, `eventStatus`, `eventAttendanceMode`, `dayOfWeek` are schema.org enumeration member URLs (`https://schema.org/InStock`; `http://` accepted; `dayOfWeek` also accepts the bare member name, `Monday`); `url`, `@id`, `image`, `logo`, `sameAs`, `item`, `contentUrl`, `embedUrl`, `thumbnailUrl` are absolute http(s) URLs.

## 7. Internal links — `LNK-*`

- **LNK-001** · P0 · html — Navigation to indexable pages uses plain `<a href>` in initial HTML.
- **LNK-002** · P0 · site — Every internal link target is a canonical indexable 200 (or a declared non-index path); no links to redirects or 404s; no `rel="nofollow"` on internal links.
- **LNK-003** · P0 · site — No orphans: every indexable page has ≥ 1 inbound link from another indexable page and is reachable from `/` within `maxClickDepth`.
- **LNK-004** · P1 · html — Anchor text names the destination: not empty, not a bare URL, not generic ("click here", "read more", "here", "link"; localised lists), not a list of > 5 comma-separated terms.
- **LNK-005** · W · site — Pages listed in `targets` receive ≥ 3 internal links with anchor text containing the target query's head term.
- **LNK-006** · W · site — Outbound links (opt-in `externalLinks.check`; `profile: nightly`): the distinct absolute `<a href>` URLs on indexable pages whose host is no service origin, up to `externalLinks.maxUrls` (ordered by number of linking pages, then URL), are requested with HEAD (GET when HEAD answers 405/501), following ≤ 5 redirects, ≤ 1 request/s per host, 10 s timeout. Final 404/410 → W listing the linking pages. 403, 429, 5xx, timeouts and TLS errors → `unknown`, not reported. Runs from the verify machine under the TR-106 network exception.
- **LNK-007** · P1 · site, diff — Links added in the diff resolve (guard against invented citations; with `externalLinks.checkAdded`, default profile, `scope: changed`): the candidates are absolute http(s) `<a href>` URLs on crawled pages whose host is no service origin and whose host + path occurs in a line added by the diff (04 § 5 diff base) and in no line removed by it. ≤ 50 requests per run (candidates ordered by URL; the rest are listed as unchecked in the coverage record), ≤ 1 request/s per host, HEAD (GET when HEAD answers 405/501), ≤ 5 redirects, 10 s timeout. A finding when the host or a redirect hop's host answers NXDOMAIN, or the final status is 404/410. 403, 429, 5xx, timeouts, TLS errors and other DNS failures (SERVFAIL, no network) → `unknown`, not reported. Network access under TR-106 (links added in the diff).

## 8. Indexation and crawler policy — `IDX-*`

- **IDX-001** · P0† · site — Sitemap URL set equals the set of indexable canonical 200 public URLs; each discrepancy class (extra, missing, non-canonical, non-200, noindex) is its own finding.
- **IDX-002** · P0 · site — ≤ `maxUrlsPerFile` (hard limit 50,000 URLs / 50 MB) per file; sitemap index when > 1 file; valid escaped XML; absolute URLs on the right origin; unique entries.
- **IDX-003** · P1 · site — `<lastmod>` from content modification data (W3C datetime with time and timezone, SE-004) or omitted; never build time; no `changefreq`/`priority` (ignored by Google and Bing).
- **IDX-004** · P0 · http — Production `robots.txt`: 200, `text/plain`; references the sitemap index; never disallows sitemap URLs or URLs relying on `noindex`; never blocks CSS/JS/framework assets or images used on indexable pages.
- **IDX-005** · P0† · http, edge — Environment mode from `DEPLOY_ENV` only. Non-production: `X-Robots-Tag: noindex, nofollow`, `Disallow: /`, no sitemap. Production: none of these; no preview/local origin anywhere in output (checked in the preview pass, 04 § 2). Part `preview-edge`: in the edge pass, `previewUrl` is either protected (a request without the `edge.bypassHeaderVar` header answers 401/403 or redirects to a host other than the preview host) or, on `/robots.txt` and the sampled pages, sends `X-Robots-Tag` containing `noindex` and serves a robots.txt whose `*` group has `Disallow: /`.
- **IDX-006** · P0 · html — 404/410 responses carry `noindex` and no canonical or hreflang.
- **IDX-007** · P0 · http — `app` and `api` surfaces are never in the sitemap and send `noindex` (meta or `X-Robots-Tag`).
- **IDX-008** · P1 · cfg, http — AI agents. The pinned ruleset `ai-agents.json` lists `{ token, vendor, category: training|search|user-fetch, userAgent }` for at least GPTBot, OAI-SearchBot, ChatGPT-User, Google-Extended, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Applebot-Extended, CCBot, Bytespider, Amazonbot, meta-externalagent, meta-webindexer, DuckAssistBot, MistralAI-User. Parts:
  - `match` — for every token, the effective robots.txt decision for each indexable URL (RFC 9309: the group naming the token, else `*`; longest-match Allow/Disallow) equals `aiCrawlers[token]` (unlisted tokens: `allow`);
  - `visibility` (cfg) — with `aiVisibility: true`, no `search` or `user-fetch` token is `disallow` in `aiCrawlers` (training tokens are the Operator's choice);
  - `search-engines` — Googlebot and Bingbot are never disallowed from indexable pages by an AI-agent group;
  - `split` (W) — a vendor's `search` token is disallowed while its `training` token is allowed.

  Google AI Overviews and AI Mode use Googlebot: `Google-Extended` controls only Gemini training/grounding, never Search visibility.
- **IDX-009** · P1 · site — With `sitemap.images`/`videos` enabled, image/video sitemap entries point at crawlable media on indexable pages.
- **IDX-010** · W · http — `llms.txt` per `llmsTxt` (default `required` when `project.kinds` includes `docs`, else `optional`): when `required`, `/llms.txt` returns 200 `text/plain`/markdown and links only to indexable canonical URLs.
- **IDX-011** · P0 · edge — Production launch check (with `edge.production: true`; bounded read-only GET under 04 § 2 item 5): for each public service origin listed in `production.origins`, fetch `/robots.txt`, the sitemaps it lists (else `/sitemap.xml`; for an index, ≤ 10 child files in document order), `/`, and 20 `<loc>` URLs sampled from the fetched sitemaps (PRNG seeded with the lock digest). Fails when: robots.txt is not 200 or disallows `/` for Googlebot or Bingbot (effective group, RFC 9309); a fetched sitemap is not 200 XML; `/` or a sampled URL is not 200 without redirect; any of them carries `noindex`/`none` in meta robots (`robots`, `googlebot`, `bingbot`) or `X-Robots-Tag`; or its canonical is not on the same production origin. ≤ 33 requests per origin, 1 request/s.
- **IDX-012** · P1 · http, html, ast — Internal site search: result URLs are not indexable. Search routes are routes whose handler reads a free-text query parameter (`q`, `s`, `query`, `search`, `keyword`, or adapter `searchHandlers`), plus the same-origin `action` of `GET` forms that contain `<input type="search">` or sit in `role="search"`. Probed with `?<param>=shipgate-probe`: the response is `noindex` (meta or `X-Robots-Tag`) or its path is robots-disallowed; no search result URL appears in a sitemap or in a canonical tag.
- **IDX-013** · P1 · http — Machine-text variants: `.md`/`.txt` siblings of HTML pages (`{path}.md`, `{path}/index.md`), URLs advertised by `<link rel="alternate" type="text/markdown">`, responses negotiated by `Accept: text/markdown` and `/llms-full.txt`, when they return 200: each per-page variant sends `Link: <html canonical>; rel="canonical"` or `X-Robots-Tag: noindex`, and `/llms-full.txt` (many pages combined, no single canonical) sends `X-Robots-Tag: noindex`; per-page variants' text overlaps the page's raw `<main>` text ≥ `parity.minOverlap` (04 § 12 token overlap); a negotiated response on an HTML URL sends `Vary: Accept`.
- **IDX-014** · W · http — When any `training` token is `disallow` in `aiCrawlers`, robots.txt also states it as a Content Signal (ruleset `content-signals.json` syntax, e.g. `Content-Signal: search=yes, ai-train=no` in the `*` group); with `aiVisibility: true` no signal says `search=no` or `ai-input=no`.
- **IDX-015** · P1 · http, html — Feeds (when indexable pages carry `Article`/`BlogPosting`/`NewsArticle` JSON-LD): the article index (the indexable 200 page at the longest common path prefix of those pages, else `/`) and every article page carry ≥ 1 `<link rel="alternate">` with `type` `application/rss+xml` or `application/atom+xml`. Each advertised feed returns 200 with an XML content type and parses as RSS 2.0 (`<rss version="2.0">` with channel `title`, `link`, `description`; each `item` with `link`) or Atom 1.0 (`feed` with `id`, `title`, `updated`; each `entry` with `id`, `title`, `updated`, `link rel="alternate"`). Every item link equals the canonical of an indexable 200 page; when that page has `datePublished`, the item date (RSS `pubDate`, Atom `published`, else `updated`) equals it as an instant to the second (a date-only `datePublished` compares by day in `timeZone`).
- **IDX-016** · P1 · browser — Confirmation pages (both checks run in G6 on the flow's output): for each form submission that a flow proves with a UX-001 outcome step, the document URL when that outcome step completes, if its path differs from the URL before the submitting step (thank-you or confirmation page), is served with `noindex` (meta robots or `X-Robots-Tag`), and that URL, in canonical form, is absent from every sitemap fetched in G4.

## 9. Localisation — `I18-*`

- **I18-001** · P0 · html — One locale → no `hreflang`.
- **I18-002** · P0 · site — Multiple locales: reciprocal clusters including self; only existing locale versions of the same entity; `x-default` only when set and resolving; valid BCP-47 (`en-GB`, not `en-UK`); targets canonical indexable 200; same map in HTML and sitemap if both are used.
- **I18-003** · P0 · html — Each locale page is self-canonical.
- **I18-004** · W · review — No machine-translated or synthesized locale content in place of source content (not mechanically detectable; for programmatic families, DAT-* already forbid content not present in the locale's dataset).
- **I18-005** · P1 · html — Crawlable links between locale versions; cookies/`Accept-Language` never the only route; no automatic redirects based on `Accept-Language` or IP for crawlers.
- **I18-006** · P1 · ast — Numbers, money and dates formatted with the page locale and `timeZone`; currency from data.
- **I18-007** · P1 · html — Detected language of `<main>` text matches `<html lang>` (pages ≥ 50 words).
- **I18-008** · P1 · html — Right-to-left locales set `dir="rtl"` on `<html>`.
- **I18-009** · P1 · data, html — Complete translations (multiple locales). Part `catalogue` (data): with message catalogues (adapter `i18nCatalogs`, locale per file from the adapter mapping; none → `skipped(no-catalogues)`), every leaf key of the `defaultLocale` catalogue (nested keys flattened with `.`; plural variants compared by base key) exists with a non-empty string value in every other locale's catalogue. Part `untranslated` (html): on sampled pages of a non-default locale, the text (NFKC, whitespace-collapsed, case-folded) of each link in `<nav>` and `<footer>` and of each `button`, `[role=button]` and `input[type=submit|button]` value must not equal a default-locale string: a value of the `defaultLocale` catalogue, or, without catalogues, the text of an element of the same kind on the page's `defaultLocale` alternate (I18-002 cluster; no alternate → not checked). Exempt: `brand`, `siteName`, words in the `content.dictionary` file, strings ≤ 2 characters, and strings that are the value of the same key in the page locale's catalogue.

## 10. Content quality (non-programmatic pages) — `CQ-*`

- **CQ-001** · W · html — Thin pages: indexable pages with < 150 words of `<main>` text and no media/list/table content.
- **CQ-002** · P1 · content — Exact duplicate `<main>` text across two indexable URLs outside programmatic families.
- **CQ-003** · P1 · html — Broken images on indexable pages (4xx/5xx `src`).
- **CQ-004** · W · html — Articles without a visible author (dates: SE-110).
- **CQ-005** · W · html — Images in `<main>` with filenames like `IMG_1234`, `image(1)`, hashes only, when a descriptive alt exists (descriptive filenames help image search).
- **CQ-006** · P1 · baseline, site — Bulk page additions (scaled-content control for pages outside programmatic families): the new pages are the indexable canonical URLs of this run that are not family or hub pages and are absent from `_main/routes.jsonl` (`skipped(no-main)` without it). When their count exceeds `content.maxNewPagesPerChange`, every new page must be listed in an unexpired Operator-signed approval `quality/approvals/pages-<n>.json` (03 § 14), which records how the pages were made (`aiProvenance`: model, prompt version, reviewer, review date) and whether they carry an AI disclosure (`disclosure`); both are copied into the report. Unlisted pages are a finding whose owner is `operator`; when it is the only blocking finding, the handoff is `operator-owned` and its `decisionsNeeded` names `approve pages` (04 § 1.9). Agents never write approvals.
- **CQ-007** · W · html — Spelling: words (UAX #29, NFKC) in `<title>`, meta description, headings and `<main>` text of indexable pages are checked with the toolchain's Hunspell dictionary for the page locale, extended by the `content.dictionary` file (one word per line), `brand`, `siteName`, `business.json` names and the text values of programmatic dataset fields. Skipped: tokens with digits, all-caps tokens ≤ 5 letters, URLs, e-mail addresses, and text in the leak-scan code elements (04 § 12). W when a page has > 3 unknown words (listed); locales without a toolchain dictionary are `skipped(no-dictionary)`.
- **CQ-008** · P1 · content — Hand-made doorways: pages outside programmatic families and hubs that differ only by swapped-in words (algorithm: 04 § 15, swap similarity). A connected component of ≥ 5 swap-similar indexable pages in one route group is a finding that lists its pages and the substituted words. Pages of a declared family are excluded. The fix is to declare the set as a programmatic family with data, or merge the pages. This rule owns swap-only near-duplicates outside families; CNT-012 owns plain near-duplicates.
- **CQ-009** · W · html — Stale years (reference year = the year of the reference time, 04 § 15). Part `title-year`: on an indexable page, `<title>` or `<h1>` contains a 4-digit token 1900–2099 below the reference year and a word of ruleset `evergreen-words.json` for the page locale (`best`, `top`, `guide`, `review`, …), unless the year of the page's `dateModified` (else `datePublished`) is ≤ that token. Part `copyright-year`: the end year of a `©`/`(c)`/`Copyright` notice (the single year or the last year of a range, 04 § 15 copyright holder) is below the reference year − 1.

## 11. Trust pages — `TRS-*`

YMYL pages = pages matching `ymylPatterns`, plus every indexable page when `project.kinds` includes `ymyl`.

- **TRS-001** · P1 · site, html — About and contact (P0 when `project.kinds` includes `local-business` or `ymyl`, or `ymylPatterns` is non-empty): `trustPages.about` and `trustPages.contact` return 200, are indexable, and are linked with plain `<a href>` from every indexable public page; the contact page shows (visible text, `tel:` or `mailto:` link) ≥ 1 telephone or e-mail equal to the homepage `Organization` `telephone`, `email` or `contactPoint[].telephone`/`.email` (phones E.164-normalised as SCH-006, e-mails case-folded), and to a `business.json` phone or e-mail when that file exists.
- **TRS-002** · P1 · html — YMYL pages: a visible author name linked to an author page (200, indexable); JSON-LD `WebPage` carries `reviewedBy` (`Person`/`Organization` with `name`) and `lastReviewed` (ISO 8601 date), the `reviewedBy` name appears in visible text (normalised containment) and a visible date parses back to `lastReviewed` (SCH-006); `<main>` contains ≥ 1 `<a href>` to a host that is no service origin and not in the `hosts` registry with purpose `affiliate` or `advertising` (a cited source). Author markup is AEO-003.
- **TRS-003** · W · site, html — Editorial transparency (`project.kinds` includes `news` or `ymyl`, or `ymylPatterns` is non-empty): `trustPages.editorialPolicy` and `trustPages.corrections` are set, return 200, are indexable and are linked from every article and YMYL page; the homepage `Organization` has `publishingPrinciples` = the editorial-policy URL and `correctionsPolicy` = the corrections URL.
- **TRS-004** · W · review — Comparison pages: indexable pages whose path or `<title>` matches ruleset `comparison-patterns.json` for the page locale (`vs`, `versus`, `alternative(s)`, `compare`, `comparison`, …) are listed as review items; the Auditor confirms every claim about a competitor (price, feature, limit, rating) states an as-of date and cites a source.

## 12. Keyword targeting — `KW-*` (only when `targets` is set)

- **KW-001** · P1 · cfg, site — Each target query maps to exactly one URL (no two targets with the same query on different URLs: cannibalisation by design).
- **KW-002** · W · html — The target URL's title or H1 contains the query's head term (stemmed, case-insensitive).

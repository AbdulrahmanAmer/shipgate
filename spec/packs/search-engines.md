# Pack: search-engines

> Engine-specific requirements beyond the shared fundamentals in web-delivery: Google search features and spam policies, Bing (and the engines and AI products built on its index: Copilot, DuckDuckGo, Yahoo), Yandex, Baidu, Naver, Seznam and Apple, plus local search (business facts, location pages). Every rule cites the engine's own documentation in its metadata (`sources`). Engine behaviour changes often, so feature-level requirements live in a **ruleset-maintained feature table** (§ 4) that is updated with each ruleset release rather than hard-coded.

---

## 1. Policy section

```jsonc
"search-engines": {
  "engines": ["google", "bing", "yandex", "naver", "baidu", "seznam", "apple"],   // markets the site targets; google + bing always implied
  "verification": {                                   // values provided by the Operator from each webmaster tool; "dns" = verified by DNS record
    "google": "dns", "bing": "msvalidate.01:XXXX", "yandex": null, "naver": null, "baidu": null
  },
  "features": ["article", "product", "merchant-listing", "event", "job-posting", "video", "image-metadata",
               "local-business", "organization", "breadcrumb", "review-snippet", "recipe", "course-list",
               "discussion-forum", "profile-page", "paywalled-content", "dataset"],   // Google features the site intends to be eligible for
  "discover": { "enabled": true },
  "news": { "enabled": false, "sitemap": false },
  "facets": { "params": ["color", "size", "sort"], "defaults": { "sort": "relevance" }, "indexable": [] },
  "sponsoredLinkSelectors": [".sponsored a", "[data-affiliate]"],
  "ugcSelectors": [".comment a", ".forum-post a"],
  "interstitialAllowlist": ["#consent-banner", "#age-gate"],
  "products": { "variantParams": [], "discontinued": [] },   // variantParams: query params selecting a variant; discontinued: [{ pattern, successor? }]
  "merchantFeed": null,                               // repo path of the Merchant Center feed (XML or TSV), no default (SE-113)
  "agenticFeeds": null,                               // [{ kind: "openai-product-feed"|"google-ucp"|"other", path, fields? }], no default (SE-114)
  "domainHistory": null,                              // { acquiredOn: "YYYY-MM-DD", previousUse: "same-business"|"unrelated"|"none" } (SE-127)
  "local": { "locationsHub": "web:/locations" }       // LOC-003; business facts come from quality/data/business.json (03 § 14)
}
```

## 2. Shared crawl and index plumbing — `SE-0xx`

- **SE-001** · P0 · http — `robots.txt` answers 200 (or 404 = allow all) and never 5xx/429/timeouts: Google treats server errors on robots.txt as a full disallow for a period, and Naver treats 5xx as "disallow everything". Served as `text/plain`, ≤ 500 KiB, UTF-8, on every host (apex and www separately), not redirected to another host unless intended.
- **SE-002** · P0 · http — robots.txt groups for every engine in `engines` (Googlebot, Bingbot, YandexBot, Yeti, Baiduspider, SeznamBot, Applebot) allow every indexable URL and the CSS/JS/image resources those pages need; an engine-specific group must not accidentally override the `*` group's allows (Yandex and others ignore `*` when a named group exists).
- **SE-003** · P1 · html, http — Engine verification values in `verification` are present (meta tag on the homepage head, outside frames, or the verification file returns 200); `"dns"` values are not checkable here and are skipped.
- **SE-004** · P1 · site — (Owner of lastmod format; IDX-003 owns lastmod source.) Sitemap `<lastmod>` uses W3C datetime **with time and timezone** (Bing prioritises recrawls with it) and only changes when content changes; for Baidu targets, plain sitemap files are also listed individually (Baidu doesn't support sitemap index files).
- **SE-005** · P1 · http — All indexable HTML responses support conditional requests (`ETag` or `Last-Modified` with `If-None-Match`/`If-Modified-Since` → `304`): Google, Bing and Yandex all use them to save crawl. (Programmatic pages: CRW-002 owns the stricter version.)
- **SE-006** · P0 · http — Non-HTML documents that are indexable (PDF, DOCX) carry canonical and robots control via HTTP headers (`Link: <…>; rel="canonical"`, `X-Robots-Tag`) when an HTML equivalent exists.
- **SE-007** · P1 · html, ast — URLs in internal links are valid per IETF STD 66 (reserved characters percent-encoded), slugs use hyphens rather than underscores, parameters use `=` and `&`; no internal `<a href>` to an indexable page contains a fragment starting with `#/` or `#!` (hash routing), and the adapter reports hash-based routers as findings.
- **SE-008** · W · edge — Bot verification is not broken: requests carrying the user agents of engines in `engines` from the edge pass (G8) aren't answered with 403/429/challenge pages on indexable URLs (W when the edge verifies bots by IP, review item to confirm firewall/CDN allowlists include each engine's published crawler IP ranges or reverse-DNS verification).
- **SE-009** · P1 · cfg, html, review — Webmaster tools are connected: `verification.google` and `verification.bing` are non-null (a value checked by SE-003, or `"dns"`). Part `submitted` (W, review): the Auditor confirms the sitemap index is submitted in Google Search Console and Bing Webmaster Tools for each production origin.

## 3. Google — `SE-1xx`

### 3.1 Search features and appearance
- **SE-101** · P1 · html — Every structured-data feature in `features` meets the **current required properties** from the ruleset feature table (§ 4), and recommended properties are reported as W when missing. Deprecated features present in markup are W ("no longer shown"), e.g. FAQ rich results (removed May 2026), practice problems, Sitelinks Search Box, HowTo, course info, estimated salary, learning video, special announcement, vehicle listing.
- **SE-102** · P1 · html — Site name: the homepage `WebSite` node carries `name` equal to `web-delivery.siteName` and to `og:site_name` (and `alternateName` when declared).
- **SE-103** · P1 · html — Discover (`discover.enabled`): article pages carry `max-image-preview:large` (meta robots), a primary image ≥ 1,200 px wide and > 300,000 pixels (16:9 preferred) referenced by `og:image` or `Article.image`, not a logo; titles don't use clickbait patterns from the ruleset list (W).
- **SE-104** · P1 · html, site — News (`news.enabled`): `NewsArticle` with `datePublished`/`dateModified`, author pages, and, with `news.sitemap`, a News sitemap containing only articles published within 2 days of the reference time (04 § 15).
- **SE-105** · P1 · html — Images: images referenced as `og:image`, `Article.image` or `Product.image` are also present as `<img src>` in `<main>` (not only CSS backgrounds); image license metadata (`license`, `acquireLicensePage`) is present when the `image-metadata` feature is enabled.
- **SE-106** · P1 · html, browser — Video watch pages (pages with `VideoObject` as the primary entity): a `<video>`, `<iframe>` embed or `<object>` is present in raw HTML, and at the mobile viewport its top edge is within the first viewport height.
- **SE-107** · P1 · html — Merchant listings (`merchant-listing`): `Product` + `Offer` with `price`, `priceCurrency`, `availability`, plus `shippingDetails` and `hasMerchantReturnPolicy` (or organization-level return policy) as the feature table requires; prices match visible values (SCH-006).
- **SE-108** · P0 · http, html — Expiring content: a 200 page must not carry `JobPosting.validThrough` or `Event.endDate` earlier than the reference time (04 § 15); expired postings return 404/410 or drop the markup.
- **SE-109** · P0 · html — Paywalled or gated content shown to crawlers but not to anonymous users is marked with `isAccessibleForFree: false` and `hasPart` + `cssSelector` for the gated section (otherwise it looks like cloaking).
- **SE-110** · W · html — Byline dates (owner of the "article shows a date" check; CQ-004 refers here): one visible publication/update date per article near the headline, matching `datePublished`/`dateModified` (AEO-006 owns cross-source consistency).
- **SE-111** · P1 · html — Product variants. A page has variants when its JSON-LD contains a `ProductGroup` or a `Product` with `inProductGroupWithID`, or its URL carries a `products.variantParams` parameter. Then: the `ProductGroup` has `productGroupID`, `variesBy` (schema.org property URLs or names, e.g. `https://schema.org/color`) and `hasVariant` with ≥ 2 `Product`s, each with `inProductGroupWithID` = `productGroupID`, a `url` and its own `Offer`; variant `url`s are distinct; either every variant URL is self-canonical, or every variant URL is canonical to the group page (mixed fails); on a variant URL, a visible price in `<main>` parses back (SCH-006) to the `Offer.price` of the variant whose `url` equals the requested URL; on the group URL, every visible price in `<main>` equals some variant's `Offer.price`.
- **SE-112** · P1 · html, http — Stock state. Part `availability`: let S be the set of stock states whose ruleset phrases (`stock-phrases.json` per locale: in stock, out of stock, sold out, pre-order, back-order, limited, discontinued) appear in `<main>` of a `Product` page; when S is non-empty, `Offer.availability` ∈ S. Part `out-of-stock`: pages whose markup or merchant feed (SE-113) says `OutOfStock` return 200, stay indexable and keep `Product` + `Offer` markup. Part `discontinued`: URLs matching `products.discontinued` redirect in one hop to `successor` or return 410; no 200 page carries `availability` `https://schema.org/Discontinued` or has S = {discontinued} (owner of discontinued products; `retired` paths stay URL-008).
- **SE-113** · P1 · data, html — Merchant feed (with `merchantFeed` set; RSS 2.0/Atom with the `g:` namespace, or TSV with Merchant Center column names, 03 § 14): each item's `link` returns 200 with a canonical equal to `link` (or to the group page under SE-111's group-canonical choice, matched via `item_group_id` = `productGroupID`); the page's `Offer` equals the item: `price` and currency (`g:price` / `g:sale_price` when active), `availability` (`in_stock`→`InStock`, `out_of_stock`→`OutOfStock`, `preorder`→`PreOrder`, `backorder`→`BackOrder`), and `gtin` equal to the page's `gtin`/`gtin8`/`gtin12`/`gtin13`/`gtin14` after left-padding to 14 digits. Items are sampled as HTTP pages (04 § 10).
- **SE-114** · P1 · data, html — Agentic-commerce feeds (with `agenticFeeds` set): each entry's `path` exists and parses by extension (`.json`, `.jsonl`, `.csv`, `.tsv`, `.xml`); fields are read through the per-`kind` map in ruleset `agentic-feeds.json` (`link`, `price`, `currency`, `availability`, `item_group_id` and availability value map), and for `kind: "other"` through the entry's `fields` map with the same keys (absent → `notConfigured(agenticFeeds.fields)`). Each item is checked exactly as in SE-113: `link` returns 200 with a canonical equal to `link` (or to the group page under SE-111), and the page's `Offer` `price`, `priceCurrency` and `availability` equal the item. Items are sampled as HTTP pages (04 § 10).

### 3.2 Spam-policy compliance (decidable parts)
- **SE-120** · P0 · html — Paid, affiliate and sponsored links (`sponsoredLinkSelectors`, and links to hosts in the `hosts` registry with purpose `affiliate`) carry `rel="sponsored"` (or `nofollow`); user-generated links (`ugcSelectors`) carry `rel="ugc"`.
- **SE-121** · P1 · html — Keyword stuffing signals: no text node or list in `<main>` containing > 10 comma/pipe/newline-separated items of ≤ 4 words each without a verb-bearing sentence (ruleset stop-word and verb lists per locale), unless each item is a link; no single non-stopword term above 5 % of `<main>` words on pages over 300 words (W below that); no more than 5 phone-number-shaped strings in a row without other text.
- **SE-122** · P0 · http, browser — No sneaky redirects: the final URL for Googlebot (smartphone and desktop), Chrome mobile and Chrome desktop is the same for every sampled page; no JavaScript redirect to another host on indexable pages.
- **SE-123** · P0 · browser — No hidden links (computed styles; same-colour per 04 § 15): links whose text is a single non-alphanumeric character, links with zero-size or same-colour text, or links hidden off-screen on indexable pages (accessibility skip links excepted).
- **SE-124** · P1 · browser — No intrusive interstitials: on mobile viewport after load, no overlay outside `interstitialAllowlist` (consent, age verification, legal notices) covers > 30 % of the viewport or blocks scrolling of the main content.
- **SE-125** · W · review — Site reputation abuse: third-party content sections hosted on the domain (coupons, partner articles) are declared with an owner and editorial oversight note.
- **SE-126** · W · html — Thin affiliate pages: on an indexable page, affiliate links (matching `sponsoredLinkSelectors` or pointing at hosts with purpose `affiliate`) number more than 1 per 100 `<main>` words (UAX #29), or `<main>` has < 300 words and ≥ 3 affiliate links.
- **SE-127** · W · review — Expired-domain abuse: with `domainHistory.previousUse: "unrelated"`, the Auditor confirms the site doesn't trade on the previous owner's reputation (content, retained URLs or backlinks from the old topic); a null `domainHistory` is itself the review item ("record the domain's history").

### 3.3 Faceted navigation (Google's 2024 guidance)
- **SE-130** · P0 · http — Facet parameters (`facets.params`): combinations with no results return 404 (not an empty 200 page or a redirect to a generic page); probed with the value `shipgate-none` (04 § 15).
- **SE-131** · P1 · http, html — Facet parameters appear in the order of `facets.params` with values equal to `facets.defaults` dropped; reordered or default-valued variants redirect once to the normalised URL.
- **SE-132** · P0 · http, html — Facet combinations not in `facets.indexable` are robots-disallowed (by parameter) or fragment-based, carry canonical-to-clean, and never `noindex` (URL-005, IDX-004).

## 4. Ruleset feature table

Each ruleset release ships `features/google.json` (and `bing.json`, `naver.json`, …) generated from the engines' documentation at release time: `{ feature, schemaTypes[], required[], recommended[], status: active|deprecated, deprecatedOn?, docUrl, checkedOn }`. SE-101 evaluates against the table of the pinned ruleset, so engine changes reach projects through ruleset bumps (05 § 6), never silently. The vendor's release process includes a documentation diff of every engine's structured-data and robots pages.

## 5. Bing and its index consumers (Copilot, DuckDuckGo, Yahoo) — `SE-2xx`

- **SE-201** · P1 · html, http — No `noarchive` or `nocache` on indexable pages unless declared in `answer-engines.snippetRules`: Bing documents that `noarchive` keeps content out of Copilot answers and grounding, and `nocache` limits citations to URL, title and snippet.
- **SE-202** · P1 · html — Bing minimum lengths: title ≥ 20 characters and meta description ≥ 50 (presence and uniqueness are owned by MET-001/002); Bing ties short titles/descriptions to lower indexing reliability and grounding eligibility.
- **SE-203** · P1 · html — Main content doesn't depend on JavaScript for Bing (RTE-001 already enforces raw-HTML parity; this rule records Bing as a reason) and isn't only inside images or video (AEO-009).
- **SE-204** · P1 · html — Multilingual sites, and every site targeting Baidu or Naver, add `<meta http-equiv="content-language">` (or `Content-Language` header) matching `<html lang>`: Bing treats hreflang as a weak signal and relies on content-language.
- **SE-205** · deprecated — tombstone; IndexNow is owned by AEO-007 (accepted by Bing, Seznam, Naver and Yandex).

## 6. Yandex — `SE-3xx`

- **SE-301** · P1 · http — With `yandex` in `engines`, robots.txt includes `Clean-param` entries for tracking and session parameters (`web-delivery.trackingParams` and session ids) in the Yandex group, and every directive Yandex needs is inside that group (Yandex ignores `*` when a Yandex group exists).
- **SE-302** · P1 · http — Last-Modified/If-Modified-Since handled correctly (SE-005); indexable documents ≤ 10 MB.

## 7. Naver — `SE-4xx`

- **SE-401** · P0 · http, browser — With `naver` in `engines`: the homepage is not redirected with JavaScript (browser check; meta refresh is RTE-009, robots.txt health is SE-001, Yeti access is SE-002).
- **SE-402** · P1 · html — `og:title`, `og:description`, `og:image` on every indexable page; `og:image` larger than 150×150 px, ≥ 5,000 bytes, aspect ratio ≤ 3:1, page-specific (not the sitewide logo).
- **SE-403** · P1 · html — Canonicals absolute (URL-004) and titles/descriptions concise for Naver display (title ≤ 40 characters and description ≤ 80 characters on Korean-locale pages: W).
- **SE-404** · W · html — `nosourceinfo` (Naver's opt-out from AI source explanations) only where declared in `answer-engines.snippetRules`.

## 8. Baidu — `SE-5xx`

- **SE-501** · P0 · html — With `baidu` in `engines`, Chinese-locale pages serve all main content and navigation in raw HTML (RTE-001 with parity 1.0 for those pages), with no dependence on resources blocked in mainland China (Google Fonts, YouTube, reCAPTCHA hosts listed in the ruleset) for rendering main content.
- **SE-502** · P1 · html — Chinese-locale pages: `<html lang="zh-CN">` and UTF-8 (the content-language declaration itself is owned by SE-204, which applies to Baidu targets too, since Baidu ignores hreflang).
- **SE-503** · P1 · html — Mobile/desktop relationship declared with Baidu's `applicable-device` meta (`pc,mobile` for responsive pages); separate mobile URLs use `mobile-agent` meta.
- **SE-504** · W · html — Meta keywords present on Chinese-locale pages (still read by Baidu; ignored by Google and Bing), 5–10 terms, no stuffing.
- **SE-505** · W · review — Hosting/CDN reachable from mainland China and ICP filing status recorded (off-site; not verifiable from the verify environment).

## 9. Seznam and Apple — `SE-6xx`

- **SE-601** · P1 · http — Seznam (`seznam` in `engines`): SeznamBot allowed; IndexNow accepted (AEO-007).
- **SE-602** · P1 · http — Apple (`apple` in `engines`): Applebot allowed for search; `Applebot-Extended` governed by `web-delivery.aiCrawlers` (training opt-out doesn't affect Apple search visibility).

## 10. Local search — `LOC-*`

Applies when `quality/data/business.json` exists (03 § 14); with `project.kinds` including `local-business` and no file, LOC rules are `notConfigured(business.json)`. Owner of name, phone, address and opening hours; prices, ratings and other business claims belong to the ux pack (UX-003). Phones compare as E.164 (default region: the location's `country`); addresses by normalised containment (NFKC, case-folded, whitespace-collapsed) of `street`, `locality` and `postalCode`; hours as day + 24-hour times.

- **LOC-001** · P0 · html, site — NAP and hours match the facts file on every indexable page. Part `phones`: every phone number shown in visible text (libphonenumber `isValidNumber` with the default region of 04 § 15) or in a `tel:` link equals a `business.json` `phones[].e164` or `locations[].phone`. Part `address`: the text of each `<address>` element that contains a postal code contains the `street`, `locality` and `postalCode` of one `locations[].address` (JSON-LD addresses: part `jsonld`). Part `jsonld`: `Organization`/`LocalBusiness` `name` equals `business.json` `name` or a location `name`; `telephone`, `address` (`streetAddress`, `addressLocality`, `postalCode`, `addressCountry`) and `openingHoursSpecification` of a `LocalBusiness` equal the location whose `pagePath` is the page (or, on other pages, the location its `@id` names), and are visible per SCH-006. Part `hours`: visible hours that parse back (SCH-006) on a location page equal that location's `hours`.
- **LOC-002** · W · html, review — Business Profile: each location page's `LocalBusiness` lists the location's `gbpUrl` (or its Google Maps URL) in `sameAs` or `hasMap` (html); the Auditor confirms each Business Profile's website link points to the location's `pagePath` (review).
- **LOC-003** · P1 · site, html — Location pages: every `locations[]` entry has exactly one indexable 200 page at its `pagePath` carrying a `LocalBusiness` (or subtype) node with `@id` `{canonical}#localbusiness`, unique across the site, and that location's name, address and phone (LOC-001); with ≥ 2 locations, `local.locationsHub` is an indexable 200 page linking every location page with plain `<a href>`.

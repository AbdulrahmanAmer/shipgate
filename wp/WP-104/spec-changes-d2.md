# WP-104 part d2 — spec problems, shape proposals, UNPROVEN and BLOCKED items

One section per author sub-task (R1 analytics/payments/placeholder ids/stock-preview hosts; R2 error pages/trust marks; R3 markers/autocomplete/testimonials; L1 regex locale files; L2 phrase lists; L3 label lists). Files named are under `rules/`.


---

## Section R1


Method for browser hit shapes: each vendor's install snippet, with a shape-valid FAKE id, served from http://127.0.0.1:8765 and run in headless Chrome 155 (CDP script `capture.mjs`, pages `pages/*.html`); requests to non-local hosts recorded 2026-10-22. Vendors that ignore an unknown id or a localhost origin (Plausible, Mixpanel, Segment, PostHog event capture, Clarity collect, Adobe) are documented from docs/open-source client code instead (see per-entry notes). Regexes are tested with the Rust `regex` crate (`rxtest`: 139 samples, 0 failures; a deliberately wrong sample goes red for the right reason).

## Spec problems and proposals (file, spec line, observation, what I did, proposal)

1. `payment-amounts.json` shape cannot express form arrays. Spec ux.md § 3: `items?: jsonPath`, a form *field* is a parameter name "evaluated relative to each element of `items`". Stripe Checkout sends `line_items[0][price_data][unit_amount]`. Done: for `format: "form"` I used `items: "line_items"` (a parameter-name prefix; element i is `line_items[i]`) and fields relative to it (`price_data[unit_amount]`, `price_data[currency]`, `price`). Proposal: state that for `form`/`query`, `items` is a parameter-name prefix with bracket indices.
2. `amount`/`currency` are listed as required, but several providers carry neither. Braintree GraphQL `chargePaymentMethod` has `transaction.amount` and no currency (the merchant account's); Lemon Squeezy checkouts have `custom_price` (cents) and no currency (the store's) plus the variant id; Shopify `/cart/add.js` has only the variant id; Stripe Checkout with `line_items[].price` has only a price id. UX-015 itself accepts "a provider price id equal to `providerId`". Done: those entries omit `amount`/`currency`/both. Proposal: make `amount`, `currency` optional in the shape, with at least `priceId` or `amount` present; say what is compared when `currency` is absent. The shipped file is valid only under that change. If the orchestrator rejects it, delete the entries `braintree`, `lemon-squeezy`, `shopify-cart` (the validator `rxcheck` lists exactly those 4 lines).
3. `eventParam` cannot read nested or array bodies. ux.md § 3: searched "in the query string, then a form-encoded body, then a top-level JSON body key". Umami nests the name in `payload.name`; Mixpanel's API takes a JSON array (`[{event, properties}]`); posthog-js and mixpanel-js send `data=<base64 JSON>`; Segment batches under `batch[]`. Done: Umami `eventParam: "$.payload.name"`, `idParam: "$.payload.website"` (idParam already allows `$` JSONPath, UX-025 part `match`); others use the top-level key their JSON API documents (`event`). Proposal: allow `$` JSONPath in `eventParam` too, and say whether a base64 `data` form field is decoded (if not, Mixpanel/PostHog browser hits are invisible to UX-010 and UX-025 `match`).
4. `pageView` cannot separate a page-view hit from an event hit. It matches the host, the path and the decoded body; the discriminator for GA4 (`en=page_view`), Pinterest (`event=init`), Matomo (`action_name` vs `e_*`), Fathom (no `name`/`gcode`/`dp`), LinkedIn, X, Bing (`evt=pageLoad`) is in the QUERY, which `bodyContains` does not see. So UX-010 would count every event as a page view ("≥ 2 = double counting") for those vendors. Done: `pageView.pathMatches` only (all hits on that path). Proposal: add `queryContains: string` (or `queryMatches: regex`) to `pageView`, and I will fill: GA4 `en=page_view`, Pinterest `event=init`, Bing `evt=pageLoad`, Matomo `action_name=`, X `event=%7B%7D`.
5. Vendors also send several identical page-view requests per load (LinkedIn: 3 `collect` hits with `cookiesTest`/`liSync`; X: `t.co` and `analytics.twitter.com`; GA4: one `page_view` plus the second POST for the first event). "Exactly one hit" will fail on a correct install unless the rule dedupes (e.g. by `pageLoadId`/`event_id`). Proposal: name a per-vendor dedupe key or drop "exactly one" for these.
6. `libraryIdParam` only names a query parameter, but several tag libraries carry the id in the PATH: Segment `/analytics.js/v1/<writeKey>/analytics.min.js`, Clarity `/tag/<id>`, Hotjar `/c/hotjar-<id>.js`, Meta `/signals/config/<id>`, Bing `/p/action/<id>.js`, Google Ads `/pagead/conversion/<id>/`. Done: `libraryPaths` set, `libraryIdParam` omitted, ids still found by `idPattern` in HTML/JS (UX-025 part `static`). Proposal: `libraryIdPath` (regex with group `id`) next to `libraryPaths`.
7. Entries without `pageView`/`eventParam`: GTM (loader only), Google Ads (conversion hits carry the id in the path), Hotjar and Clarity (recorders; Clarity posts binary to `https://www.clarity.ms/collect` per Microsoft's setup page, no id in the URL). ux.md says `pageView` and `eventParam` are required "on entries for analytics vendors". Done: left out, because there is no hit the rule could count. Proposal: say that an `analytics`-purpose host whose entry has no `pageView` is `notApplicable` for UX-010 (and still checked by UX-025), or mark vendor kind (`analytics`/`advertising`/`recorder`) in the entry.
8. `eventParam` is a single string, but the same hit differs by caller. Plausible's script sends `{"n":"pageview","u":..,"d":..}` (observed on plausible.io) while the documented Events API takes `name`/`url`/`domain`; I used the browser keys `n`/`d`. X puts the event in `txn_id` (`tw-<pixel>-<event>`) and the pixel id in the same field for `config`, so `idParam` is omitted for X (a pixel id check would mismatch every event hit). Proposal: let `eventParam`/`idParam` be a list of alternatives.
9. Self-hosted and first-party-domain installs (Matomo, Plausible, Umami, PostHog, Fathom custom domain, Adobe `data.example.com`, sGTM first-party GA4) cannot be listed by a vendor ruleset: the `hosts` shipped are the vendors' own cloud hosts only (`*.matomo.cloud`, `plausible.io`, `cloud.umami.is`/`gateway.umami.is`, `us|eu.i.posthog.com`, `cdn.usefathom.com`, `*.data.adobedc.net`, `*.2o7.net`). `ux.analyticsMatchers[host]` (same fields, replaces the entry whose `hosts` match that host) is the intended escape; copy the vendor's fields into it. No spec change needed; worth a line in the UX-010 `notConfigured(analyticsMatchers)` fix hint.
10. `stock-preview-hosts.json`: `pathPatterns` "glob" dialect is not defined in ux.md. I used SEC-025's dialect (`*` any characters except `/`, `**` anything) with a leading `/`, matched against the URL path. Host patterns cannot express `thumb[0-9].shutterstock.com`, so I used `*.shutterstock.com` plus path patterns. Proposal: cite 02 § 2.2 / SEC-025 glob definition in UX-024.
11. Currency exponents. UX-015 converts `unit: "minor"` with the ISO 4217 exponent. Stripe's own page https://docs.stripe.com/currencies says ISK and UGX are two-decimal in Stripe (5 ISK = amount 500) although ISO 4217 gives 0; Adyen has its own minor-unit table (https://docs.adyen.com/development-resources/currency-codes). Result: false `value-mismatch` for ISK/UGX on Stripe. Proposal: allow a per-provider `exponents` override in `payment-amounts.json` (e.g. `{ "ISK": 2, "UGX": 2 }` for Stripe).
12. Not mine but seen: `password-reset-paths` is "path segments" in ux.md § 3 and "path globs" in SEC-025 (owner of that file: the per-locale fork).

## UNPROVEN (kept out of the files or flagged)
- GA4 `/g/collect` + `tid`/`en`/`v=2`: Google's sGTM page documents only the path signatures `/collect`, `/g/collect`, `/j/collect` and `collect?v=2`; `tid`, `en`, `page_view` are not in a Google document, they are the parameters I observed on 2026-10-22 (also `analytics.google.com/g/s/collect`). `region1.google-analytics.com` is the host Google documents for the EU Measurement Protocol endpoint, I did not observe it for browser hits.
- Meta pixel id length: `{15,16}` is the spec's own example regex; no Meta page I could fetch states the length. Hits observed: `GET https://www.facebook.com/tr/?id=<pixel>&ev=PageView`.
- Mixpanel/Segment/PostHog capture bodies from a live page: these vendors send nothing for a fake token (Mixpanel/Segment) or batch/compress it (PostHog `data=<base64>` observed on `/flags/`), so paths come from vendor docs and open-source client code (mixpanel-js `api_host: https://api-js.mixpanel.com`, `track/`; analytics-next `api.segment.io/v1/<first letter of type>` and `/v1/b`; PostHog docs `/i/v0/e/`, `/capture/`, `/batch/`; `/e/` is posthog-js's path, NOT confirmed this run). The Segment EU host and the Mixpanel `api-js` EU/IN variants were not verified; `api-eu`/`api-in.mixpanel.com` come from the Mixpanel JS docs sentence on data residency.
- Mixpanel and Segment `idPattern` accept any alphanumeric token (formats not documented in anything I fetched).
- Hotjar hosts: only `static.hotjar.com` and `metrics.hotjar.io` were observed; `*.hotjar.com`/`*.hotjar.io` is a wildcard over the vendor's own domains.
- Adobe: only AppMeasurement image requests (`/b/ss/<rsid>/<n>/s<random>`, `events`, `pe`, `pageName` documented at developer.adobe.com) and the collection domains Adobe's trackingServer page names (`*.data.adobedc.net`, default `[rsid].2o7.net`). `sc.omtrdc.net` appears only in a web-search summary, so it is NOT in the file; the Web SDK (`edge.adobedc.net`, `configId`) is NOT covered (no fetchable page showed the request); no `idPattern` (no fetched source for the `s_account` spelling).
- Not covered: Google Ads conversion ids in URL paths, Meta `signals/config`, Measurement Protocol `/mp/collect?measurement_id=` (server-side; documented by Google but a second `idParam` per entry is impossible).
- PayPal JS-SDK client-only order creation (host not verified, not listed); Shopify Admin/Storefront order amounts (not fetched); Stripe subscriptions/invoice items (not fetched); Square sandbox/production hosts, Paddle hosts and Mollie host are documented (see provenance).
- Stock agencies: Shutterstock's site returns 403 to headless Chrome, curl and WebFetch (BLOCKED live observation; what would unblock: a browser session that passes its bot wall); its entry rests on example responses in https://api-reference.shutterstock.com/ (`image.shutterstock.com/...`, `thumb7.shutterstock.com/thumb_large|thumb_small/...`, `ak.picdn.net/shutterstock/photos|videos/...`). Alamy and Adobe Stock load only with a desktop Chrome user-agent; one CDN host each was observed (`c7.alamy.com/zooms/...`, `t3|t4.ftcdn.net/jpg/...`), other hosts of those CDNs (e.g. other `cN.alamy.com`) are covered by the wildcard but unobserved. Getty, iStock, Depositphotos observed live.


---

## Section R2


Scratch material: `scratchpad/r2/` (live/ = saved responses, src/ = upstream sources, img/ = downloaded badge images, px/ = hasher, match-test.mjs = fingerprint test against saved responses).

## error-pages.json: 36 entries
Verification against saved REAL responses (`node match-test.mjs`): live Vercel NOT_FOUND (examples.vercel.app, static-site.vercel.app), DEPLOYMENT_NOT_FOUND, Next default 404 (swr.vercel.app, nextjs.org, opensea.io, patreon.com, a Pages-router demo), Apache 2.4 default 404 (httpd.apache.org), IIS 10 custerr 404 (pubstore.acs.org, Server: Microsoft-IIS/10.0), IIS detailed 404.0 (saved page, ieee.org), GitHub Pages site/file 404, Firebase Hosting, Heroku no-such-app, Cloudflare WAF block (crunchbase.com) and challenge (1337x.to, truthfinder.com). Rendered locally: Express (production) 404/500, Django 404/500/debug 404 (pip django), Rails 404/500/422 static files. Negative controls that correctly match nothing: nginx.org's own custom 404, render.com 404, sec.gov, cdc.gov, state.gov, nuget.org, iis.net, svelte.dev, nuxt.com, vercel.com.
Matched by reading upstream source only (no live response obtained): nginx default pages (ngx_http_special_response.c), Apache 403/500/503 (http_protocol.c), Laravel (12.x minimal + legacy layout view), Symfony, Nuxt (@nuxt/ui-templates 1.3.4 + nuxt-error-page.vue), Next 16 global-error and Next <=15 "Application error: a server-side exception" (the latter two are client-rendered, so a server HTML response may not carry them), Vite base middleware.

### UNPROVEN / BLOCKED
- Netlify default 404: BLOCKED. `*.netlify.app` refused connections from this machine (curl, 2 hosts) and WebFetch failed too. Entry `netlify-default-404` uses only the fragment `broken link or entered a URL that`, taken from the titles of Netlify support-forum threads quoting the page. Exact title, apostrophe style and markup unverified. Unblock: one curl of a Netlify site without a 404.html from a network that reaches Netlify.
- Cloudflare 52x / 1xxx error pages (e.g. "Error code 522"): BLOCKED. No live example reachable, docs do not reproduce the page text. Not included. Unblock: a saved response of a 52x/1xxx page.
- Vercel 500 (INTERNAL_SERVER_ERROR, FUNCTION_INVOCATION_FAILED): UNPROVEN, not included (no live example found).
- Vite: the dev/preview server's plain 404 has an EMPTY body (notFoundMiddleware), nothing to fingerprint. Only the base-URL mismatch message is included.
- IIS 500/403 default pages: not included (no response fetched). IIS detailed 404.0 title version is generalised (`IIS [0-9.]+`) from one saved IIS 8.5 page.
- nginx, Laravel, Symfony, Nuxt, Apache 403/500/503 entries: from source only (see above); Docker was not running, so no nginx/Apache container was started.

### Spec problem (for wp/WP-104/spec-changes-d2.md)
UX-005 / ux § 3 say a response matches when its "entity-decoded body contains every `bodyContains` string" but do not say whether "body" is the raw response text (markup included) or visible text. Some entries (`django-*`, `apache-*`, `express-*`, `laravel-*`, `nginx-default`, `next-*`) use markup fragments (`<h1>Not Found</h1>`, `<pre>Cannot `, `<hr><center>nginx`, a Tailwind class string) because the visible text alone ("Not Found") is shared with customised pages. Proposal: state "body = the raw response body text after HTML entity decoding, markup included". If visible text is intended instead, these entries need rewriting. Also: Apache/Django strings that span a line break in the source are split into one-line fragments.

## trust-marks.json: 32 entries, 16 dHash values

### dHash convention used (the spec says only "9x8 greyscale, Lanczos3")
1. decode (PNG/JPEG via `image` 0.25; SVG via resvg 0.45 rendered with longest side 256 px);
2. flatten alpha over opaque white (spec silent on alpha);
3. greyscale = `image::DynamicImage::to_luma8`;
4. resize to 9 wide x 8 high, `FilterType::Lanczos3`, aspect ratio ignored;
5. rows y=0..7, columns x=0..7: bit = 1 when luma(x,y) > luma(x+1,y); row-major, first bit = most significant bit; 16 lowercase hex.
Tool: Rust (`scratchpad/r2/px`, target dir `C:/t/wp104d2-hash`). Cross-check with Pillow 12 `Image.LANCZOS` for the 5 raster images: Hamming distance Rust vs Pillow = 4 (fsc), 2, 1, 2 (paypal x3), 1 (securecode, not shipped). All within the 6-bit tolerance. SVG hashes have no second rasteriser to compare with. Minimum Hamming distance between hashes of different marks in the file: 19.

### Image source per shipped hash
| mark | hash | source image |
|---|---|---|
| trustpilot | a291860aa9b2753d | https://cdn.trustpilot.net/brand-assets/4.1.0/logo-black.svg |
| trustpilot | 555555aaaaaa5555, 545454aaaaaa5454, 545454a8a8a85454, 515153aaaaa25151 | .../stars/stars-5.svg, stars-4.5.svg, stars-4.svg, stars-3.svg |
| bbb-accredited | d0b219191191b2d0 | https://m.bbb.org/brand/seals/Accredited_Business_Seal_Rating_RGB.svg (named on bbb.org) |
| paypal | 102c2424287b7318 (pp-logo-200px.png and PP_logo_h_200x51.png), 10252424287b7318 (pp-logo-100px.png) | https://www.paypalobjects.com/webstatic/mktg/Logo/ |
| stripe-powered | 150134a6c67e0141 | https://images.stripeassets.com/fzn2n1nzq965/4M6d6BSWzlgsrJx8rdZb0I/733f37ef69b5ca1d3d33e127184f4ce4/Powered_by_Stripe.svg (preview on stripe.com/newsroom/brand-assets; the badge zip was not downloaded) |
| trusted-shops | 44f0e8d4ccf9306c | https://www.trustedshops.co.uk/hubfs/trustmark_intro.svg (the vendor's own trustmark graphic) |
| fsc | b864d6daa8b2d4d8 | https://fsc.org/themes/custom/fsc_theme/images/fsc-logo-black.png (the organisation's site logo) |
| ce-marking | c7840c2c2c0c84c7 | Wikimedia Commons "Conformité Européenne (logo).svg" (fallback, not an official page) |
| energy-star | 8eb2e026e7829a98 | Commons "Energy_Star_logo.svg" (fallback) |
| usda-organic | cc86615933b6f0f0 | Commons "USDA organic seal.svg" (fallback; US government work) |
| fairtrade | 8c34b4446030b464 | Commons "Fairtrade Certification Mark.svg" (fallback) |
| b-corp | 9af8e4aaaaf0f8ec | Commons "Certified B Corporation B Corp Logo 2022 Black RGB.svg" (fallback) |
Dropped on purpose: Trustpilot white logo (white on transparent flattens to an almost blank image, hash 80a08080a0a08000 would match nearly anything); Commons "MasterCard SecureCode.jpg" (it is a bank page screenshot, not a mark); plain Visa/Mastercard logos (acceptance marks, not trust marks); eKomi seal URL from ekomi.com returned an HTML page, not an image.

### Entries without any dhash (hashes need an image I could not obtain from an official page)
ekomi, yotpo, google-customer-reviews, norton-verisign-secured, digicert-seal (seals are drawn by script per site), sectigo-comodo-seal, trustwave-seal, mcafee-secure, card-authentication-programs, pci-dss (PCI SSC has no merchant seal), truste-trustarc, iso-9001/14001/27001 (no single badge: each certification body issues its own), eu-ecolabel (ec.europa.eu returned 403), rainforest-alliance, climate-neutral, carbon-trust, red-dot, if-design, webby. Unblock: a saved copy of the vendor's badge image.

### Hosts and names
imageHosts only where a fetch showed the host serving that vendor's seal/brand asset: cdn.trustpilot.net (assets fetched), m.bbb.org (seal SVG), seal.digicert.com (script on DigiCert KB page, HTTP 200), secure.trust-provider.com and secure.sectigo.com (cornertrust.js HTTP 200; install guides), privacy-policy.truste.com (tracker database entry; the root answered 302). UNPROVEN (left out): BBB `seal-*.bbb.org` (also not expressible, host patterns allow only a `*.` prefix), Norton `seal.websecurity.norton.com`, Trustwave `sealserver.trustwave.com`, Trusted Shops/eKomi/Yotpo widget hosts, Google badge host.
`names`, `altPatterns` and `fileNamePatterns` beyond verified file names (`Accredited_Business_Seal*`, `Powered_by_Stripe*`, `pp-logo-*px.png`, `PP_logo_h_*.png`) are authored from the programs' public names: 3-D Secure program names were checked against en.wikipedia.org/wiki/3-D_Secure; everything else (ISO standard numbers, award names, sustainability labels) is UNPROVEN as to source and conservative. Award entries (Red Dot, iF, Webby) are examples, not a complete list of awards.

### Spec problems / questions for the orchestrator
1. UX-019 matching is an OR over host, file name, alt and hash, so every criterion must be specific on its own. I therefore left out generic file names (`stars-*.svg`) and generic hosts.
2. Payment acceptance logos (PayPal, Stripe "Powered by") were requested but are not certifications: as shipped, every checkout showing the PayPal logo (by hash/file name/alt "PayPal secure") or a Stripe badge becomes a P0 `forbidden-value` unless `business.json` lists a `certifications[]` entry named "PayPal"/"Powered by Stripe" with evidence. Entries `paypal` and `stripe-powered` are in because the task named them; Operator should confirm or delete them (and decide whether acceptance marks are in UX-019's scope at all).
3. UX-019 does not say how alpha is handled or at what size SVG is rasterised; the implementation must follow the convention above or hashes will not match (proposal: state "flatten over white, greyscale, resize; SVG: not decoded, match by host/name/alt only").
4. `imageHosts` allows only `*.` prefixes (03 § 3.3), so BBB's regional `seal-<region>.bbb.org` hosts cannot be covered by host; they are covered by the `bbb` alt pattern only.


---

## Section R3


## Spec problems (spec line / observation / what I did / proposal)
1. `carousel-markers.json` has no shape. 04 § 15 line ~541 and A11-021 only say "a `carousel-markers.json` pattern". Done: `[CSS selector]` (10 library root selectors). Proposal: state "`[CSS selector]`; a region matches when it matches or contains an element matching a selector" in A11-021.
2. A11-022 (`autocomplete-map.json`): "first entry in file order wins" and the mapped token must be on the input. A single "Address" box that correctly carries `address-line1` would fail a `street-address` mapping, and a `<input type=hidden name=state>` (OAuth) would match `address-level1` by name. Done: `street-address` labels are narrow ("street address" and its equivalents), no bare "address" label; entries are ordered so combined labels reach the right entry first (name before given-name/family-name, address-line2 before address-line1, country before address-level1, cc-* before name). Proposal: A11-022 judges only visible, enabled `text`, `email`, `tel`, `search`, `url`, `number`, `password` inputs, `select` and `textarea` (never `hidden`, `checkbox`, `radio`, `submit`), and accepts `address-line1` where the map says `street-address`.
3. UX-020 `countdown-markers`: "an element matches ... by its visible text matching `textRegex`". Every ancestor of a matching element also contains the text. Done: `textRegex` entries are anchored to the whole element text (`^...$`). Proposal: say "the innermost element whose own visible text matches".
4. UX-020 `format`: "the first that matches gives the remaining duration" with one regex giving all groups, so a unit combination needs one regex each. Done: 15 formats per entry (digital clocks, label-first, number-first in 10 unit combinations). Proposal: none needed; noted so the typed loader allows the list length.
5. UX-014 `testimonial-markers` `attribution` is "evaluated inside the element matched by `selector`", but the HTML Standard says the attribution of a `<blockquote>` belongs outside it (https://html.spec.whatwg.org/multipage/grouping-content.html, "Attribution for the quotation, if any, must be placed outside the blockquote element"). Done: `blockquote` entry reads `cite, footer` inside it; the spec's own fallback (`<cite>`, `<figcaption>`) covers the rest. Proposal: let `attribution` fall back to a `figcaption` of the nearest `figure` ancestor.
6. `password-reset-paths` is not mine, but SEC-025 says path globs and UX says segment runs: flagged for the part that owns it.
7. UX-023-style locale `zh` covers Simplified and Traditional; phrases carry both scripts.

## UNPROVEN (authored, not verified against a fetched source)
- All per-locale phrases: `autocomplete-map` labels, `testimonial-markers` byline prefixes and team headings. Authored from knowledge of real form/page wording, kept narrow.
- `autocomplete-map` `names` regexes: field-name conventions (WooCommerce `billing_*`, `first_name`, ...), not fetched.
- `testimonial-markers`: `.testimonial, .testimonial-item` and its quote/attribution children, `team.section` (`.team`, `.our-team`, `.team-members`, `.team-section`, `#team`, `#our-team`) and `team.name` class selectors are generic site conventions. The Elementor, WordPress core, schema.org selectors are verified.
- `chrome-state-classes`: `current` (generic).
- `countdown-markers`: the rendered text order of FlipClock, FlipDown and TimeCircles is not verified (selectors are; formats cover label-first and number-first). Texts are English and digit-clock only; no localisation. A countdown whose digits render one per element ("0 1") will not parse and becomes a `parse-error` finding, which is the safe direction.
- `social-proof-widgets`: `selectors` are empty for Nudgify and TrustPulse (no marker class found in their docs).
- `rating-widget-markers`: Trustpilot `.trustpilot-widget` comes from a third-party Framer help page that shows the Trustpilot snippet (support.trustpilot.com was not reachable by search).

## BLOCKED (two attempts each)
- Loox (`loox-rating`, `looxReviews`): developers.loox.io returns HTTP 525 (WebFetch and curl). Would unblock: a reachable Loox developer page.
- PowerReviews (`#pr-reviewsnippet`, `#pr-reviewdisplay`): help.powerreviews.com answers a Cloudflare challenge, then redirects to community.1worldsync.com. Would unblock: the 4.x display guide text.
- Fomo hosts/selectors: help.fomo.com and docs.fomo.com do not resolve from this machine (ENOTFOUND). Would unblock: the install snippet from the dashboard.
- Proof (UseProof) pixel host: help.useproof.com shows the snippet only as an image. Provely: no install docs found. Would unblock: the snippet text.
- Embla (`.embla`): docs are client-rendered and the README has no markup; left out of `carousel-markers`.
- Reviews.io, eKomi, Google Customer Reviews, Foundation `is-active`, WordPress `current-page-ancestor`: not found in a fetched source; left out.
- Shopify and WooCommerce countdown-timer apps/plugins: no verifiable markup; left out.


---

## Section L1


## Spec problems (spec line / observation / what I did / proposal)

1. **Phrase-list matching for ko (ux § 3 "Phrase-list matching")**. Spec: substring matching only for `ja zh th km lo my`; other languages match "delimited by UAX #29 word boundaries". UAX #29 keeps Hangul syllables and digits in one word (WB9/WB10: `500명의`, `20년` are single words), and Korean particles attach to the noun, so a word-boundary match of `고객`, `재고 있음`, `단종` inside real Korean text fails. Did: wrote ko lists and the ko sample test assuming substring matching, like ja/zh. Proposal: add `ko` to the substring list.
2. **stock-phrases (SE-112): overlap and negation.** Spec: "matched whole-word, case-insensitive, after NFKC" and nothing on overlaps. "not in stock", "back in stock", "nicht auf Lager", "non disponibile in magazzino" contain an in-stock phrase. Did: listed the negated and compound forms under the state they mean (`out of stock`: "not in stock"; `in stock`: "back in stock"; de: "nicht auf Lager" ...) and tested with rule "longest match wins; a phrase match lying inside a longer match of any state is dropped". Proposal: write that rule into SE-112 (without it, the lists give wrong states).
3. **Boolean term kinds have no negation or condition support** (UX-023: `freeReturns`, `freeShipping`, `noCardRequired`, `cancelAnytime`). Without lookaround a regex cannot refuse "no free shipping", "free shipping over $50" (the latter is `freeShippingOver`, not an unconditional promise), or "you cannot cancel anytime". Did: `freeShipping` / `freeReturns` regexes must be followed by sentence end, `and`, `on all orders`, `worldwide` or the like (locale equivalents), so "free shipping not available" and "free shipping over $50" do not match; ja/zh/ko/tr put the unconditional qualifier in the regex (全国/全品/전 상품/tüm siparişlerde). Residual false positives: a negation BEFORE the phrase ("no free shipping", "cannot cancel anytime"), and a condition before the phrase in en/de/fr/... ("On orders over $50, free shipping."). Proposal: allow an optional `exclude: regex` on a term-patterns entry, or allow `fancy-regex` lookbehind for the ruleset.
4. **claimPatterns `sincePhrases` order.** Spec: a phrase followed by a 4-digit year. Turkish ("1998'den beri", "1998 yılından beri") and the common ja/zh form "2005年創業", "1998年成立" put the year first and cannot be expressed. Did: only the phrase-then-year orders (`創業2005年`, `成立于1998年`, `Kuruluş yılı 1998`, `kuruluş`, `est.`). Proposal: allow `sincePhrasesAfter` (phrases that follow the year).
5. **claimPatterns: bare "since"-type words** (en `since`, de `seit`, fr `depuis`, es `desde`, it `dal`, pl `od`, ru `с`, ro `din` ...) are kept because "Since 1998" badges are the main real case; they also fire on blog sentences ("since 2020, ..."). Mitigation is `factsIgnore`. Decision for the orchestrator.
6. **ratingPatterns numbers:** `ratingPatterns` capture raw numeric text for `value`, `best`, `count` (separators included), `best` is limited to `5|10` (also `٥|١٠` in ar); 100-point scales are not matched.
7. **Turkish capital İ.** Rust `(?i)` uses simple case folding: `İ` does not match `i`, `I` does not match `ı`. Page text in capitals (headings typed in capitals in the HTML, e.g. `ÜCRETSİZ KARGO`) is missed. Proposal: say whether the engine lowercases text with the locale's rules before matching.
8. **regulated-claims `organic` scope.** Spec example is bare "organic". Bare "organic" fires on "organic search", "organic traffic". Did: organic entries require a certification context (`certified organic`, `100 % bio`, `agriculture biologique`) or a product noun. ja: `有機` alone is not matched (有機EL, 有機溶剤); only 有機JAS / 有機栽培 / 有機野菜 ... Proposal: accept (this is a precision choice).

## Sources fetched, and what is NOT sourced
- Fetched: Regulation (EU) 2018/848 Annex IV (terms referred to in Article 30), from https://www.legislation.gov.uk/eur/2018/848/annex/IV on 2026-10-22. It is the copy derived from EUR-Lex on 31 Dec 2020. EUR-Lex itself answered every request with HTTP 202 and an empty body (AWS WAF challenge) to both WebFetch and curl (HTTP-level obstacle, two tools tried: BLOCKED for eur-lex.europa.eu; the UK copy was used instead). UNPROVEN: that Annex IV is unchanged in the current EU consolidated text.
  Annex IV terms used (my 13 EU locales only): cs ekologické/biologické, da økologisk, de ökologisch/biologisch, en organic, es ecológico/biológico/orgánico, fi luonnonmukainen, fr biologique, it biologico, nl biologisch, pl ekologiczne, pt biológico, ro ecologic, sv ekologisk. The Article 30 abbreviations ("bio", "eco", "luomu") are protected too and are used where they are the common retail form.
- NOT fetched, authored from knowledge: everything else. In particular no legal text was fetched for FDA / FTC "Made in USA" / Regulation 1924/2006 health-claims wording; the health, medical and origin regexes are the common retail phrasings, not quotations of a legal list. No claim of legal completeness.
- Non-EU organic terms (ru, tr, ja, ko, zh, ar, nb) are not from a fetched law: nb `økologisk` follows the EEA use of the EU term; tr `organik`, ja 有機JAS, ko 유기농, zh 有机, ru органический, ar عضوي are reserved or certified terms in their markets by my knowledge only. UNPROVEN.

## UNPROVEN-native-check (authored from knowledge, no native review)
All 20 locales of all 6 files. Confidence order, highest to lowest: en, de, fr, es, it, pt, nl, sv, nb, da; then pl, cs, ro, ru, fi, tr; lowest: ja, zh, ko, ar (shortest, most conservative lists; Chinese covers simplified and traditional; Arabic digits `٠-٩` are matched by `\p{Nd}`). Stock-phrase lists for nb/da/fi/cs/ro/tr/ar are the least certain (store wording varies by shop). Native review is the unblock.

## Test evidence
- `C:/t/rxcheck/release/rxcheck.exe rules <6 stems>`: 0 problem(s) (shapes, Rust-regex compile, group rules, kinds and units, NFKC stability, 20 locales, no BOM/CR).
- Sample test (`scratchpad/l1/sc`, Rust regex 1.13.1, NFKC applied to samples): 7393 assertions, 0 failures; every regex of ratingPatterns / term-patterns / stock-count-phrases / regulated-claims has >= 2 positive samples (checked by the harness: "0 regex/list(s) with < 2 positive samples"); named-group values are asserted for term-patterns and stock-count-phrases; per-locale generic negatives run against every regex. stock-phrases: one positive per state list plus negation negatives (in stock / out of stock); claimPatterns: 2-4 positives and 2 negatives per locale.
- Watched-fail: a copy of rules/ with one entry broken per file (`scratchpad/l1/watchfail.mjs`, each patch asserts its target exists) goes red for the right reason in all 6 files, the real files stay green.

## Counts
term-patterns 29-35 entries per locale (all 14 kinds in all 20 locales); ratingPatterns 7-13; stock-count-phrases 3-5; regulated-claims 9-10; claimPatterns 23-38 nouns and 4-15 sincePhrases; stock-phrases 7 states in all 20 locales, none empty.


---

## Section L2


## What is sourced and what is authored
- generic-green-claims: terms for the 13 EU languages (cs da de en es fi fr it nl pl pt ro sv) are quoted from the recitals of Directive (EU) 2024/825 as fetched from publications.europa.eu (Cellar, `Accept: application/xhtml+xml`, `Accept-Language: <lang>`) on 2026-10-22 (eur-lex.europa.eu itself answers HTTP 202 with a bot challenge to curl; the Cellar endpoint is the route that worked). Plus the offset-based climate claims recital. ar, ja, ko, nb, ru, tr, zh are authored: UNPROVEN-native-check. nb is the Norwegian Bokmal sibling of da (no EU official language version of the Directive exists for nb).
- no-results-phrases: phrases checked against fetched real strings: Shopify Dawn `templates.search.no_results` in 19 locales (MIT, raw.githubusercontent.com), WordPress Twenty Twenty-One / Twenty Twenty / core "No results found" / WooCommerce "No products were found matching your selection" translations (translate.wordpress.org PO export, GPL-2.0-or-later). ar and nb have no Dawn locale; ar/nb come from the WordPress strings. Extra phrases ("0 results", "nothing found" forms, ja "該当する商品はありません", nl "geen zoekresultaten", ...) are authored.
- claimPhrases, logo-wall-headings, affiliate-disclosure-phrases, incentive-disclosure-phrases: no published phrase list exists for these; all entries are authored from knowledge of how real pages in each language word them, following the spec's English examples. I did not fetch FTC 16 CFR 255/465, CAP Code or national law texts, so none is cited as a source.

## UNPROVEN-native-check (no native-speaker review; entries authored, conservative)
- All six files: ar, ja, ko, tr, zh, ru, ro, fi, cs, pl (every non-Germanic/Romance language I am less sure of idiom in). Germanic/Romance lists (de, fr, es, it, nl, sv, da, nb, pt) are from fluent knowledge but also not natively reviewed.
- claimPhrases: every non-en locale (authored). ko particles: Hangul words carry particles ("무료 견적을"), and the matcher is word-boundary based, so I listed common inflected forms; coverage of Korean/Finnish/Turkish/Arabic inflection is necessarily partial (false NEGATIVES possible, false positives unlikely).
- affiliate-disclosure-phrases: ja entries use a bracketed `pr` form because a bare `pr` would match inside `price` under ja substring matching; ko "쿠팡 파트너스" strings authored from knowledge of the Coupang Partners disclosure, not fetched.
- logo-wall-headings: headings are matched by containment in the heading text, so short headings ("press", "presse", "referenzen", "partners") also match longer headings that contain them as whole words.

## Deliberate omissions (conservative choices)
- generic-green-claims: "energy efficient" (listed in the Directive recital as a generic claim example) is left out in every language: EU energy-label statements make it a measurable spec claim in product text and the rule is P0 blocking. "natural"/"naturel"/"natürlich" also left out (flood). "green"-type colour words ARE included because the spec lists "green". If the orchestrator wants the full recital list, add the energy-efficiency entries from recital 9 (de energieeffizient, fr économe en énergie, ...).
- claimPhrases: no bare "best"-equivalents except where the spec lists "best" (en). de "beste/besten" is excluded ("Mit besten Grüßen"), sv "bästa" excluded ("Bästa hälsningar"). ja "no.1" excluded (substring-matches "No.12345").

## Spec problems / observations
1. ux.md § 3 *Phrase-list matching* says ja/zh/th/km/lo/my use substring matching but Hangul (ko) and Arabic/Turkish/Finnish agglutinated forms are matched on word boundaries only, so a phrase such as "무료 견적" does not match "무료 견적을". Observed while sample-testing. Done: inflected forms added to the lists where realistic. Proposal: for locale ko add it to the substring list, or state that per-locale lists must list inflected forms.
2. Licence of no-results-phrases: WordPress translations are GPL-2.0-or-later (BUILDER-BRIEF says GPL data is not usable). The file contains only short first-clause fragments of one-sentence UI strings (not copyrightable expression, to my reading), recorded as LicenseRef-shipgate-authored with the attribution above. Orchestrator decision: accept, or drop the WordPress-only fragments (the sentence "nothing matched your search" family and the ar/nb entries sourced only from WordPress).
3. Matcher + shopify strings: Dawn zh-CN puts the search term inside the sentence (`未找到“{{ terms }}”的结果`), so the zh entry `未找到“` was added to match it. A ja/zh substring phrase can never span a term placeholder.
4. generic-green-claims shape: spec says only "per-locale generic-green-claims.json" with literal list matching (UX-013 part green); written as `{ "<locale>": [string] }`.

## BLOCKED / not delivered
- Nothing BLOCKED in these six files. eur-lex.europa.eu HTML returned HTTP 202 with no body (bot challenge) twice; the Publications Office Cellar endpoint worked, so it was not a gap.


---

## Section L3


## Spec problems

### 1. `password-reset-paths.json`: UX-018 and SEC-025 describe two different shapes
- Spec: ux.md § 3: "per locale `[string]`; an entry matches an `href` when its percent-decoded, lower-cased path contains the entry as a whole run of path segments". security.md SEC-025: "Ruleset `password-reset-paths`: `string[]` of path globs (`*` = any characters except `/`, `**` = anything), matched against the request path". xtask/tests/wp_104.rs lists the file under PER_LOCALE (keyed by locale).
- Observed: three incompatible readings (per-locale vs flat; segment-run vs glob; `href` vs request path). A plain entry such as `reset-password` is a valid segment run but, read as a glob against `/api/auth/reset-password`, matches nothing.
- Done: UX-018 shape, keyed by 20 locales. Every locale's list starts with the same language-independent framework/CMS slugs (so a Laravel site with `/forgot-password` under `/de/` still matches), then the locale's own slugs. `en` holds exactly the framework slugs, so SEC-025 reading `en` (or the union of locales) gets all of them. Entries are lower-case, no leading/trailing slash; some entries are multi-segment (`password/reset`, `users/password/new`).
- Proposal: amend SEC-025 to "ruleset `password-reset-paths` (per locale, UX-018 matching: an entry matches when the request path contains it as a whole run of path segments); SEC-025 reads the union of all locales". The alternative (amend UX-018 to globs and un-key the file) conflicts with the test's PER_LOCALE list.

### 2. `password-reset-paths.json`: limits of the segment-run rule (no spec change needed, recorded for the loader)
- WordPress `wp-login.php?action=lostpassword` is a query string, not a path, so it cannot be an entry; WooCommerce `my-account/lost-password` is covered by `lost-password`. UX-018 still passes on WordPress through its label list (`Lost your password?`).
- Entries with a file extension (`forgot_password.php`, Moodle) match only that exact segment; `forgot-password.html`-style URLs are not matched. Chinese/Korean sites that use `findpwd.html` style URLs are therefore matched by the label list, not the path list.
- Shopify's customer reset link (`/account/reset/<id>/<token>`) is covered by `account/reset`; its "forgot" link is a fragment (`#recover`) and cannot be matched by path.

### 3. `carousel-controls.json`: English loanword labels are not in the non-English lists
- A11-021 matches the control's accessible name against the page locale's list. Many non-English sites ship English library defaults (Swiper `Next slide`, Bootstrap `Next`). I did not add English phrases to other locales' lists: a German page whose control says `Next slide` gets the P1 `missing-element` finding, which is the accessibility defect (control name in the wrong language). If the orchestrator prefers leniency, the proposal is a spec sentence "a locale's lists are merged with `en`" (one line in A11-021) rather than data duplication.

### 4. Matching of ja/zh substring rule vs short entries
- `ja` and `zh` lists are matched as substrings (ux.md § 3). Short entries (`再生`, `停止`, `播放`, `必須`, `必填`) are therefore broad by design; `次` alone was deliberately not listed (matches `目次`, `次回`). In `ja` the `play` entry `再生` also occurs inside the stop label `自動再生を停止`; harmless because A11-021 reads the lists per role, but a future rule that needs "is this the play control" must not assume the lists are disjoint.

## Matching facts the entries were authored against
- Both sides NFKC, case-folded, whitespace-collapsed; non-ja/zh phrases need UAX #29 word boundaries at both ends. Consequences handled: Korean compounds (`수신거부`, `구독취소`, `필수입력`) are listed as separate spaced/unspaced forms, because a Korean word followed by a particle in the same word (`구독 취소하기`) does not end at a boundary; Arabic one-letter prefixes (`لإلغاء الاشتراك`) are listed explicitly; Dutch/Danish separable verbs (`af te melden`, `afmelde dig`) are listed in the inflected position they take in sentences (found by the samples check).
- Curly and straight apostrophes are different code points under NFKC: both forms are listed for the `fr`/`it` entries that contain `'` and for English `i'm still here`.
- Romanian: `ș`/`ț` (comma below) are the standard letters; cedilla forms (`ş`, `ţ`) are listed only for the few short entries I know occur (`opreşte`, `porneşte`, `dezabonaţi-vă`).
- Turkish: a page whose text is upper-case with dotted `İ` casefolds to `i` + U+0307, which will not match; not handled (matcher-level issue, 04 § 15).
- Persian-/Arabic-Indic digit and diacritic variants were not added (the Arabic lists use the common unvocalised spellings plus tanwin variants where a vocalised form is common).

## UNPROVEN-native-check (authored from knowledge; no native-speaker or fetched corpus confirmation)
- password-reset-labels: all locales were cross-checked on the devise-i18n string (one anchor phrase each); every additional variant is authored. Weakest: `ar` (variants), `ja`, `ko`, `zh` (traditional variants), `ro`, `fi`.
- extend-session-labels: all 20 locales authored (no fetched source exists for this wording). Weakest: `ar`, `ko`, `ja`, `zh`, `tr`, `fi`, `ro`, `cs`.
- same-as-labels: all 20 authored. Weakest: `ar`, `ko` (`주문자 정보와 동일` means "same as orderer", the standard Korean address-copy label), `ja`, `zh` (traditional variants), `fi`, `tr`, `ro`, `cs`, `pl`.
- required-labels: all 20 authored. `ko` forms depend on word-boundary behaviour (see above). `ar`, `fi`, `cs` weakest.
- carousel-controls: `en` partly source-checked (APG); all other locales authored. Weakest: `ar`, `fi`, `ro`, `cs`, `ko`, `tr`, `da`, `nb`, `sv`.
- unsubscribe-labels: all 20 authored; `ar` weakest; `ko`, `ja`, `zh` follow common Mailchimp/Sendinblue-style wording from memory, not fetched.
- password-reset-paths: framework slugs are well known; all localised slugs are authored; `ja`, `ko`, `zh`, `ar`, `ru` (transliterations) weakest.

## BLOCKED
- No Mailchimp/Brevo/Klaviyo localisation files, WordPress `.po` files or Swiper/Splide i18n tables were fetched for the non-devise files (devise-i18n for password-reset-labels and the W3C APG carousel page were the only sources fetched; the others are authored). Unblock: download translate.wordpress.org exports (`Lost your password?`, `(required)`), Mailchimp "Unsubscribe" strings per language, and compare.


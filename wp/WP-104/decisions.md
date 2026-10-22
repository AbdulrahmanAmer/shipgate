# WP-104 — orchestrator decisions on the parts' spec questions

Applied to the spec in one batch when WP-104 closes (one `spec/CHANGES.md` entry), together with any data-file edits listed here. Nothing below is open: each item is accepted (with the edit) or rejected (with the reason).

## Part b (`spec-changes-b.md`)
| # | Decision | Spec edit | Data edit |
|---|---|---|---|
| 1 | accept: drop `formatVersion` from the 04 § 13 `secret-patterns.json` shape (03 § 1 exempts `rules/**`) | 04 § 13 shape → `{ patterns: [{ id, provider, regex }] }` | remove `formatVersion` from `rules/secret-patterns.json` |
| 2 | accept the shape `[{ provider, kind: "literal"\|"regex", pattern }]` | CFG-004: name `live-key-prefixes.json` and its shape | — |
| 3 | accept `[{ vendor, host }]` (03 § 3.3 host pattern) | A11-018 | — |
| 4 | accept `host: "*"` (any host) and `queryPattern?` (Rust regex over the query string) | 05 § 3.2 `writeApi` shape | — |
| 5 | accept `{path}` = the protected path | SEC-021 `override-headers` rewrite mode | — |
| 6 | accept: `ecosystem` ids are the 03 § 15 `dependencies.json` ecosystems | SEC-027 | — |
| 7 | reject a spec change: package-manager pins are read from the fixed fields OPS-009 itself names (`packageManager`, lockfile version), not from `runtime-pins.json` | — | — |
| 8 | accept: for cargo, the source string `registry+https://github.com/rust-lang/crates.io-index` (and the sparse `sparse+https://index.crates.io/`) is crates.io; `github.com` is never a cargo registry host | SEC-053 `registry` | `registries.json` cargo entry notes it if needed |
| 9 | no change (spec string verified live) | — | — |
| 10 | accept: path-style regional S3 `s3.*.amazonaws.com` | SEC-079 shipped list | add to `object-storage-hosts.json` |
| 11 | accept a field type `array` (value `["sg-ma-{n}"]`) | SEC-036 types | `permissions` → `array` in `mass-assignment-fields.json` |
| 12 | accept the provider/check vocabulary the part used | SEC-066 | — |
| 13 | accept: `jsonPath` is evaluated on the lockfile parsed to JSON (YAML lockfiles included); both pnpm v9 paths stay | SEC-053 `install-scripts` | — |

Part b UNPROVEN items (authored without a fetched source: EqualWeb/Max Access hosts, three debug-path signatures, Braintree/Adyen sandbox markers, Wix host and IndexNow endpoints in `write-apis.json`): accepted as experimental data — every rule ships `experimental` until its corpus passes (04 § 14), so a wrong entry surfaces as a corpus or dogfood false positive, not a release blocker. Listed in `rules/provenance.json` as `LicenseRef-shipgate-authored`.
`wp-lockout-signatures.json`: the strings are short factual messages, not copyrightable expression; no plugin code is copied. Accepted.

## Part a (`spec-changes-a.md`)
All "state the shape / rule in the spec" proposals are accepted as written by the part (items 1, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13): the spec text is amended to the shape the data uses, in the batch. Specific decisions:
- 2 `schemaorg.json` (CC-BY-SA-3.0): kept as a separate data file under its own licence with attribution (names and relations only, no descriptions); distributed as a fetched data snapshot (03 § 19 `purpose: "data"`, `refresh: "fetch"`) rather than compiled into the binary, so the closed binary isn't an adaptation of it. WP-102's manifest gets a `schemaorg` data item (I add it if WP-102 doesn't).
- 8 `geo-headers.json`: `ip-api` is not an npm package → removed from the shipped `packages` list (the spec example is corrected); `x-country-code` stays as a header some apps read, described as "custom header set by reverse proxies".
- 9 SE-107: reworded — `shippingDetails` and `hasMerchantReturnPolicy` are recommended (SE-101 `recommended`); SE-107 owns only the organisation-level return-policy fallback. SE-101 `recommended` skips entries covered by a satisfied `anyOf`.
- 11 `engine-crawlers.json`: add `honoursRobots` (default true); SE-010 `decision` skips rows with `false`.
- 13 `placeholder-handles.json`: one leading `@` is stripped before comparison (MET-011 `social`); the `@` duplicates are removed from the file.
- `gsc-indexed-states.json`: `da`, `ko`, `nb`, `ro` are empty because no source exists; an empty list is the 04 § 15 *No entry* outcome for that locale (ROL-003 then reports `notConfigured(indexing-export-locale)` unless another locale matches), never a silent pass. Recorded, not hidden.
- SE-501 example "Google Fonts": GreatFire reports both Fonts hosts reachable → the example list in SE-501 is changed to hosts the shipped `china-blocked-hosts.json` actually lists.
- UNPROVEN rows (special-announcement, vehicle-listing, Bing property lists, Bytespider `honoursRobots`, social-host handle segments, local-listing regions) ship as experimental data (04 § 14), listed in provenance as authored/inferred.

## Part c (`spec-changes-c.md`)
| # | Decision | Spec edit | Data edit |
|---|---|---|---|
| 1 | accept: `gcd` rows keyed by default-state class, `default`/`update` values may be `null` (not set), `update` read from the added `gcdLetters`; the table is derived from vendor documentation (CookieHub, UniConsent) because Google publishes none | privacy § 1 `google-tags.json` shape; PRV-011 reads `default` only; provenance marks the file `refresh: "fetch"` against a live tag capture (quarterly) | — (WP-206's loader accepts `null`) |
| 2 | accept: Rust `regex` dialect, inline `(?i)`, `\b` for space-delimited scripts, plain substrings for compound-word languages and scripts without spaces (same dialect statement as 03 § 6 `regexSinks`) | `regulated-product-regimes.json` shape note | — |
| 3 | accept: `perRegex` becomes `[regex]` (each with named groups `price`, `n`, `unit`; first match wins) so both orders are expressible | `unit-quantity-patterns.json` shape | add the unit-first form ("1 kg = 12,50 €") for de, fr, it |
| 4 | accept as written: `privacy` for kr-pipa, cn-pipl, br-lgpd, ca-pipeda, jp-appi, au-privacy, in-dpdp, us-state-privacy; us-tcpa → `privacy` + `terms` | `required-legal-pages.json` note | — |
| 5 | accept `tlds.eu = "EU"` and `regions.EU` (EU is an exceptionally reserved alpha-2 code); the matcher accepts it | `market-signals.json` shape: "ISO 3166-1 alpha-2, incl. the reserved `EU`" | — |
| 6 | accept the definition "opt-out = the regime does not require consent before non-essential cookies" and the part's split; it is a legal judgement → counsel review before CFG-006 leaves `experimental` (Operator ask) | CFG-006 states the definition | — |
| 7 | accept the five GB `placeNames` keys (SI 2015/17 reg. 25(2)(a)) | PRV-030 example | — |
| 8 | accept: `google-certified-cmps.json` and its `minTcfPolicyVersion` refresh by `fetch` (weekly upstream) | 03 § 19 note on the item | provenance `refresh: "fetch"` |
| 9 | accept the three Google-sourced hosts only; no invented hosts | the spec's "AdSense, Ad Manager, …" reads as these three | — |
| 10 | accept FR/IT entries from the spec text as UNPROVEN (Légifrance 403); experimental until checked | — | — |
| 11 | accept the authored `nb` withdrawal labels as UNPROVEN; Norway has not adopted 2023/2673 wording | — | — |

## Part d2 (`spec-changes-d2.md`)
All "state the shape the data uses" items are accepted as written (R1-1 form `items` bracket paths, R1-10 SEC-025 glob dialect for `pathPatterns`, R3-1 `carousel-markers.json` = `[CSS selector]`, R3-4, L1-6, L2-3, L2-4 `generic-green-claims.json` = `{ locale: [string] }`, L3-2, L3-4). Specific decisions:
- R1-2 `payment-amounts.json`: `amount` and `currency` become optional; UX-015 already accepts a provider price id alone. Braintree, Lemon Squeezy and Shopify entries stay.
- R1-3 `eventParam` accepts `$` JSONPath (as `idParam` does); a form field named `data` holding base64 JSON is decoded before matching (Mixpanel, PostHog browser hits).
- R1-4, R1-5 UX-010: `pageView` gains an optional `discriminator` (query-string or body key and value, e.g. GA4 `en=page_view`); "exactly one hit" counts distinct page-view hits per vendor id after dropping identical repeats within one page load.
- R1-6 add optional `libraryIdPath` (a regex with a named group `id`, matched on the script URL path) beside `libraryIdParam`.
- R1-7 `pageView` and `eventParam` are optional; loader-only and session-recorder entries are detected by library only.
- R1-8 `eventParam` may be `[string]` (first key present wins).
- R1-9 self-hosted installs are a known false negative of the vendor cloud host list; recorded in the UX-010 notes, no config key added.
- R1-11 `payment-amounts.json` entries may carry `minorExponent: { <currency>: n }` overrides (Stripe ISK and UGX = 2); otherwise ISO 4217.
- R1-12, L3-1 `password-reset-paths.json`: the UX-018 per-locale segment-run shape is the one shape; SEC-025 is reworded to read it. The `wp-login.php?action=lostpassword` query form is WordPress-adapter territory (parked, D-013).
- R2 error pages: `bodyContains` matches the raw response body after HTML entity decoding, markup included (as the entries are written).
- R2 trust marks: (1) accept; (2) **remove `paypal` and `stripe-powered`**: payment logos are not certifications and would raise a false P0 on every checkout showing them; (3) the dHash convention is stated as the part used it (flatten over white, `to_luma8`, Lanczos3 to 9×8, SVG rendered at longest side 256 with resvg); (4) BBB regional hosts are matched by alt text only.
- R3-2 A11-022: accept the part's proposal: only visible, enabled `text`, `email`, `tel`, `search`, `url`, `number`, `password` inputs, `select` and `textarea` are judged.
- R3-3 UX-020: the innermost element whose own visible text matches; entries stay anchored.
- R3-5 UX-014: attribution is looked up inside the matched element, then in the nearest following `figcaption` or `cite` sibling (the HTML Standard places a blockquote's attribution outside it).
- L1-1, L2-1 add `ko` to the substring-matching locales (ux § 3).
- L1-2 SE-112: longest match wins, so "not in stock" beats "in stock".
- L1-3 boolean terms: keep the part's trailing-context regexes; a negation *before* the phrase is a known residual false positive, mitigated by `factsIgnore`.
- L1-4 add `sincePhrasesAfter` (phrases that follow the year: tr "1998'den beri", ja and zh "2005年創業").
- L1-5 bare "since" words stay; `factsIgnore` is the mitigation.
- L1-7 text is lowercased with the locale's rules (tr: İ→i, I→ı) before case-insensitive matching.
- L1-8 accept: `organic` requires a certification or product context.
- L2-2 **remove the WordPress-only entries from `no-results-phrases.json`**: the brief bars GPL-sourced data from a closed-source product, so the conservative choice is to drop them. Shopify Dawn (MIT) and devise-i18n (MIT) entries stay.
- L3-3 carousel controls: English loanword labels ("Next", "Prev") are added to every locale list.

Part d2 BLOCKED and UNPROVEN items (Netlify 404, Cloudflare 52x, the Vercel and IIS pages, the unreachable vendors, the unhashed trust marks, the analytics wire formats not taken from vendor docs, no native review): accepted as experimental data under 04 § 14, so each surfaces as a corpus or dogfood finding rather than a release blocker. Netlify unblock: one fetch of a Netlify site without a `404.html` from a network that reaches Netlify.

## Part d1 (`spec-changes-d1.md`)
| # | Decision | Spec edit | Data edit |
|---|---|---|---|
| 1 | accept `rules/bool-labels.json` = `{ "<BCP 47 primary tag>": { "true", "false" } }`, display forms, not matched | 04 § 15 *Default field formats* names the file and shape | — |
| 2 | accept `rules/soft-404-phrases.json` = `{ "<tag>": [string] }` | 04 § 12 *Soft-404* and RTE-004 name the file | — |
| 3 | accept: `attribution-phrases.json` is matched whole-word like the pack's other per-locale lists (not substring); the multi-word entries stay | AEO-005 | bare `laut`, `segundo`, `potrivit` may be added later; not required |
| 4 | accept `x` as a wildcard digit in `phoneRanges` `from`/`to` (`+1xxx5550100`–`+1xxx5550199`) | MET-011 `contact` | replace the 792 NANP pairs with one wildcard pair |
| 5 | accept the `*` convention as the part used it (language-neutral facts, all `phoneRanges`, hashes, hosts under `*`; locale keys hold filler of that language) | web-delivery § 2 states it | — |
| 6 | accept: CJK (`ja`, `zh`) keyword rules use dictionary word segmentation (ICU dictionary break iterator); until the engine has it, multi-character `ja`/`zh` entries are inert and those rules report `ja`/`zh` as `notApplicable` with a reason, never a pass | 04 § 15 *Tokenisation*; KW-002/003, SE-121 | — |
| 7 | accept the part's stop-word coverage note as written | — | — |
| 8 | fictional phone ranges outside NANP, UK, DE and AU: NOT DONE, no source; recorded, never invented. MET-011 `contact` uses only the listed countries' ranges and reports others as `notApplicable` | MET-011 note | — |

Part d1 homographs (Romance verb forms equal to function words, e.g. fr `plus`, es `como`): accept the part's suggestion: SE-121 subtracts `stop-words.json` entries before counting verbs. UNPROVEN: NANP 555-01xx from the spec text only; UK ranges from a 2025 Wayback copy of Ofcom's page; every authored list unreviewed by native speakers; verb forms generated by helpers and sample-checked only. All experimental under 04 § 14.

## Part e (no `spec-changes-e.md`)
- `popular-packages/maven.txt`: **BLOCKED** (Sonatype API caps at 10,000 and ranks by namespace; deps.dev has no ranking; ecosyste.ms is CC-BY-SA). Unblock = Operator: a Google Cloud account for the deps.dev BigQuery dataset (CC-BY), or accept CC-BY-SA for names only. WP-104 is not claimed until it lands. Line shape when it lands: `group:artifact`, lower-cased (spec § 1 gets that sentence in the batch).
- npm candidate names come from wooorm/npm-high-impact (MIT), itself crawled from ecosyste.ms (CC-BY-SA); the order is recomputed from npm's official counts. Operator ruling asked together with Maven.
- Go list near rank 10,000: UNPROVEN (the crawl was still finding ~0.7% new modules); accepted as experimental.
- Registry metadata files carry `LicenseRef-*` ids: accepted.

## Part f (`spec-changes-f.md`)
| # | Decision | Spec edit |
|---|---|---|
| 1 | keep `formatVersion` in `recipes/*.json`; 03 § 1 names them as the exception to the `rules/**` exemption | 03 § 1 |
| 2 | accept: on Netlify and Cloudflare Pages a retired path's 410 comes from an edge function or Pages middleware; the `static-html` and `vite-spa` recipes say so | 02 § 5 `static-html` row; RTE-004 |
| 3 | accept: IDX-005's production half applies to HTML documents and robots.txt; `X-Robots-Tag` on sitemap XML is ignored. The Django recipe may keep its header-strip line (harmless) | IDX-005 |
| 4, 9 | update the version labels in 02 § 5 to the majors the part ran (React Router 8, Django 6, Spring Boot 4, SvelteKit 3, Astro 7, Laravel 13, .NET 10) | 02 § 5 |
| 5 | accept: PRF-008's HTML text recommends `no-cache` or `private, max-age=0, must-revalidate`, never `public`, so it can't collide with SEC-016 on cookie-setting pages | PRF-008 |
| 6 | no spec change; the recipes add an Origin / Sec-Fetch-Site check to public forms on purpose | — |
| 7 | accept the `next-app` error-pages note (Next 16.4.2 returns the right status with an empty shell for request-time `notFound()` and thrown errors); UX-005 reports it as a finding, which is correct. Linux and other minors: UNPROVEN | — |
| 8 | the `aspnet` adapter reads the static-asset manifest (`*.staticwebassets.endpoints.json`) for PRF-008; the hex name pattern stays for the others | 02 § 5 `aspnet` row; PRF-008 |

Part f BLOCKED: no Vite build ran (`esbuild.exe` would not install here); a `--webpack` Next build hung twice. UNPROVEN (full list in `spec-changes-f.md`): nothing run against shipgate itself; no real TLS/HSTS or Google tag id; `tanstack-start` and `react-router` type-checked only; `nuxt` parsed only; static-host `_headers` never served by Netlify or Cloudflare; database and mail paths used stand-ins (SQLite, H2, local webhook); no Linux run of Next.js. Accepted as experimental under 04 § 14; each closes when the adapter's WP runs its corpus.

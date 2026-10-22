# WP-104 part a — spec problems and shape proposals

Each entry: spec line, what I observed, what I did, proposal. Files named are under `rules/`.

## 1. `search-agents.json` shape differs between two places
- Spec: `spec/packs/web-delivery.md` § 2 data file shapes says `[{ token, variant, userAgent }]`; `BUILD_MAP.md` (Round-6 named files) says `[{ token, engine, variant, userAgent }]`.
- Done: rows carry `engine` as well as the three keys of § 2 (a superset: a loader that reads only `token`, `variant`, `userAgent` still works).
- Proposal: make § 2 say `[{ token, engine, variant, userAgent }]` so both places agree.

## 2. `schemaorg.json`: licence is CC-BY-SA-3.0
- Spec: web-delivery § 2 requires a pinned `schemaorg.json` built from the official release. `wp/WP-104/BRIEF.md` says CC-BY-SA data is "not usable".
- Observed: https://schema.org/docs/terms.html says the vocabulary is licensed under the Creative Commons Attribution-ShareAlike License 3.0. There is no other licence for the vocabulary.
- Done: file delivered (release v30.1, `schemaorg-current-https.jsonld`), reduced to names, relations and enumeration member URLs (no descriptions, no examples), licence recorded as `CC-BY-SA-3.0` with attribution. NOT decided by me whether shipping it is acceptable.
- Proposal: the Operator/orchestrator decides. If the licence is not acceptable, the alternative is to fetch the file at install time (`refresh: "fetch"` data snapshot, 03 § 19) instead of shipping it.

## 3. `schemaorg.json`: "properties" is ambiguous between declared and inherited
- Spec: `{ version, types: { "<Type>": { supertypes: [string], properties: { "<prop>": { ranges: [string] } } } }, enumerations: { "<Enum>": [member URL] } }`.
- Done: `supertypes` = direct `rdfs:subClassOf` parents that are schema.org types (external ontology classes such as `cmns-cls:Classifier` are dropped; the 7 data types get `DataType`); `properties` = every property valid on the type including those inherited through supertypes (flattened, so a lookup needs no walk and a walking consumer is still right). Superseded types and properties are kept. `ranges` are the property's `rangeIncludes`, short names (`Text`, `ItemAvailability`). Enumeration members are full `https://schema.org/<Member>` URLs.
- Proposal: state "flattened, includes inherited" in § 2.

## 4. `iso4217.json` and `web-features.json` have no shape in the spec
- Spec: only names the files (UX/PRF/PRV/PCF rules read them). Searching `spec/**` finds no key description.
- `iso4217.json` done as `{ "<CODE>": { "minorUnits": int|null, "numeric": "840", "name": "US Dollar" } }` (`minorUnits` is `null` for the funds/metals SIX lists as `N.A.`: XAU, XAG, XPD, XPT, XTS, XXX, XDR, XSU, XUA, XBA..XBD). List One published 2026-09-17, 178 codes. SIX gives no licence text, only "available online and free of charge" (provenance records `LicenseRef-SIX-ISO4217-List-One-free-of-charge`).
- `web-features.json` done as `{ "version": "3.43.0", "features": { "<id>": { "name", "baseline": "widely"|"newly"|"limited", "year": int|null, "bcd": [BCD key] } } }`; `year` = year of `baseline_low_date`; `widely` = Baseline high, `newly` = Baseline low, `limited` = `baseline: false`; features of kind `moved`/`split` are dropped. UX-008 reads `baseline` and `year`.
- Observation (upstream data, not changed): in web-features 3.43.0 the BCD key `javascript.operators.optional_chaining` belongs to the feature `object-object` (widely, 2015), not to a feature of its own, so UX-008 reports `?.` as "Object, widely, 2015". Same for `javascript.operators.object_initializer.spread_properties`.
- Proposal: add both shapes to the spec § 2 / ux § 3.

## 5. `lighthouse-audit-renames.json`: shape and scope
- Spec: performance § 3: "When a Lighthouse upgrade renames an audit, ruleset `lighthouse-audit-renames.json` maps the old id." No shape.
- Done: `{ "<old audit id>": "<id in Lighthouse 13.x>" }`. 25 legacy-to-insight mappings from the Chrome article "Moving Lighthouse to insights", `tap-targets` to `target-size`, and `layout-shift-elements` to `cls-culprits-insight` (two documented steps: replaced by `layout-shifts` in Lighthouse 11, then by the insight in 13). Audits removed with no replacement (`first-meaningful-paint`, `no-document-write`, `offscreen-images`, `uses-passive-event-listeners`, `uses-rel-preload`, `third-party-facades`, also `font-size`, `preload-fonts`, `no-unload-listeners`) cannot be expressed as a rename and are not listed.
- Proposal: say so in performance § 3, or allow `null` values for removed audits.

## 6. `bfcache-harness-reasons.json`: no criterion for "harness reason"
- Spec: performance PRF-018 ignores "reasons in the ruleset `bfcache-harness-reasons` list". No definition of which reasons the harness itself causes, and no shape.
- Done: a list of CDP `Page.BackForwardCacheNotRestoredReason` names: `BackForwardCacheDisabled`, `BackForwardCacheDisabledByCommandLine`, `BackForwardCacheDisabledByLowMemory`, `BrowsingInstanceNotSwapped`. Evidence: Playwright's default Chromium launch switches include `--disable-back-forward-cache` (chromiumSwitches.ts line 52); Lighthouse's gatherer notes that navigating through about:blank produces `BrowsingInstanceNotSwapped` (its issue 14665). UNPROVEN: that this is the complete set for the pinned Chromium; WP-102/PRF-018 must confirm with a live run and extend the list.
- Proposal: define the criterion (reason caused by the launch flags or the navigation method of the harness) in PRF-018.

## 7. `baseline-js-syntax.json`: `when` vocabulary
- Spec: ux § 3: `[{ node: <oxc AST node type>, when?: { <field>: <value> }, bcd }]`.
- Done: `node` = oxc_ast struct names (`Function`, `Class`, `PropertyDefinition`, `ImportMeta`, ...; checked against `oxc_ast/src/ast/js.rs` and `literal.rs`); `when` field names as oxc serialises them (`async`, `generator`, `await`, `static`, `type`, `kind`, `param`) and operator values as source text (`"??"`, `"??="`, `"**"`). Every `bcd` key was checked to exist in the pinned web-features data. Top-level `await` and regex flags are not expressible with a one-field node test and are not listed.
- Proposal: state the field/value vocabulary (oxc ESTree serialisation) in ux § 3.

## 8. `geo-headers.json`
- Spec: shipped headers include `x-country-code`; shipped packages include `ip-api`.
- Observed: `x-country-code` — WordPress VIP's page (https://docs.wpvip.com/?p=14640) lists it as a response header with description "ISO 3166-1 country code"; I found no CDN page documenting it as an incoming request header. `ip-api` — `https://registry.npmjs.org/ip-api` answers 404, so there is no npm package of that name (ip-api.com is a web service).
- Done: both kept, because the spec says every shipped entry must be present. The other headers are confirmed in the vendor pages (Cloudflare, AWS CloudFront, Vercel, Google App Engine).
- Proposal: drop or replace `ip-api` with a real package name, and say what `x-country-code` is.

## 9. Feature tables (search-engines § 4) — gaps found while filling them
- `deprecatedOn` is not defined. Done: the date of the vendor's own statement (effective date where the notice gives one: FAQ 2026-05-07, special-announcement 2025-07-31). Proposal: add this sentence to § 4.
- Removed Google features have no page any more; `docUrl` is the changelog entry (https://developers.google.com/search/updates). Property lists of removed features come from Wayback copies dated before the removal; for `special-announcement` and `vehicle-listing` no copy was retrieved, so their `schemaTypes` are schema.org names and `required`/`recommended` are empty: UNPROVEN (unblock: a Wayback snapshot id of those two pages).
- SE-107 says `shippingDetails` and `hasMerchantReturnPolicy` are what the table "requires". Google lists both under Recommended, so they are in `recommended[]`. Proposal: reword SE-107.
- § 4 cannot express a feature with several types and different property lists, or a property required only when its parent is present. Done: such features are split into rows (course-list = Course, carousel = ItemList, review-snippet = Review, aggregate-rating = AggregateRating); conditional properties are left out of `required[]`.
- `recommended[]` repeats Google's table including alternatives that also sit in a required `anyOf` (discussion-forum text/image/video, image-metadata creator/creditText/copyrightNotice/license). Proposal: SE-101 part `recommended` skips entries covered by a satisfied required `anyOf`.
- Bing publishes no property table; its per-scenario pages use the legacy data-vocabulary.org vocabulary (only ClaimReview and SpecialAnnouncement are in schema.org terms). Done: a property is carried into `bing.json` only when its name equals the schema.org name (case aside), checked against the schema.org release; others are left out (UNPROVEN mapping for breadcrumb, Event `summary`). Bing is the "engine" with the weakest data: 10 rows, none deprecated.
- Naver: 14 rows from its structured-data guides; the guide writes `recipeInstruction` in the table but `recipeInstructions` in every example (stored the schema.org name); the `site-channels` and `video-channel` rows both match Person nodes, so a consumer must key on `feature`.

## 10. `gsc-indexed-states.json` (03 § 18)
- Google's current Page indexing help no longer lists coverage-state names, and the URL Inspection API gives `coverageState` as a free string. Done: the two Valid-status labels per language ("Submitted and indexed", "Indexed, not submitted in sitemap") were taken from the Internet Archive copies (2020-2022) of Search Console Help article 7440203, 16 language/script variants, each label found by string search in the saved page. These are the help-page wording of that time, not verified against today's UI.
- BLOCKED for `da`, `ko`, `nb`, `ro`: no archived copy still lists the labels (earliest copies are the 2022-23 rewrite; `nb` has no copy). Their keys are empty arrays so that D-010 coverage holds and no wrong label is shipped. Unblock: a Search Console export or help page in that language, or the Operator's own export.
- `pt` uses the pt-BR wording (no pt-PT copy exists); `zh` holds both the simplified and traditional wording.
- Proposal: say in 03 § 18 which UI language an export uses and that API exports are English.

## 11. Crawler and agent files
- `ai-agents.json`: `userAgent` is `""` for `Google-Extended` and `Applebot-Extended` (robots.txt-only tokens with no HTTP user agent). `userAgent` is the bare token for ClaudeBot, Claude-SearchBot, Claude-User, Bytespider, LinkedInBot (social-agents) and TelegramBot (social-agents): the vendors publish no full string. Proposal: define "empty = robots.txt-only token, agent-parity skips it"; define "bare token" convention.
- `W.X.Y.Z` also appears in `search-agents.json` and in Amazon/Google rows; the substitution rule is stated only for `ai-agents.json`. Proposal: state it once for every file with `userAgent`.
- `Bytespider`: BLOCKED, no ByteDance page; `docUrl` is a robots.txt that names the token and `honoursRobots: true` is an assumption (UNPROVEN).
- Bing's help page is script-rendered; the Bingbot strings come from Bing's own 2022 blog post (UNPROVEN that they are unchanged in 2026). `Twitterbot/1.0` comes from a 2024 Wayback copy of X's docs.
- Chrome rows in `search-agents.json` are built from the reduced-UA format (chromium.org) with major version 156 from Chrome's version-history API.
- The `honoursRobots: false` statements of IDX-008 match the Google, OpenAI and Perplexity pages (no contradiction). Also `false` from vendor wording: `Amzn-User`, `meta-externalfetcher`. Not listed because `category` cannot hold them: OAI-AdsBot, Meta-ExternalAds, GoogleOther.
- `engine-crawlers.json`: Yandex says YandexFavicons ignores robots.txt and Baidu says Baiduspider-video does not support the rules; the shape cannot say so. Proposal: add `honoursRobots` to rows and skip the SE-010 `decision` part for `false` rows. `fallbackTokens` are `["Yandex"]` for the Yandex rows and `["Baiduspider"]` for the Baidu rows, as the vendor pages state.
- `content-signals.json` matches the spec. Cloudflare writes the directive `Content-signal` and is testing a fourth field `use=immediate|reference|full` (its managed robots.txt now emits `use=reference`); IDX-014 does not cover it.

## 12. `agentic-feeds.json`, `fetch-tools.json`
- SE-114 allows one `items` string per kind, but a kind arrives in several file types (OpenAI documents jsonl/csv/tsv/parquet; Google product data is TSV or XML). Done: `openai-product-feed.items` is `null`; `google-ucp.items` is the RSS XPath. Proposal: make `items`/`fields` a per-extension map.
- `fields` has no namespace rule; the Google `g:` fields use `*[local-name()='price']`.
- `google-ucp`: no Google page defines a separate UCP feed layout; UCP eligibility is signalled by extra Merchant Center attributes (`native_commerce`, `consumer_notice`, `merchant_item_id`). The entry maps the standard Merchant Center attributes; that the standard attributes apply to UCP is UNPROVEN.
- SE-114 does not say whether availability values are short names or full URLs; the file uses the short names SE-113 uses. OpenAI `unknown` and Google `build_to_order` have no mapping; OpenAI `sale_price` and field aliases are not expressible.
- `fetch-tools.json` has entries for `claude-code` only (Playwright MCP `browser_navigate`, MCP fetch server `fetch`). The `/0/text` response pointer was observed with a fake MCP server under `claude -p`, not with the real Playwright server (UNPROVEN). codex, cursor, opencode, antigravity: no documented or observable MCP-tool payload; WP-101 must observe them.

## 13. Host lists
- `china-blocked-hosts.json`: SE-501 names Google Fonts as an example, but GreatFire (2026-10-22) reports `fonts.googleapis.com` reachable and `fonts.gstatic.com` reachable at its last test, so they are NOT listed (a source says the block exists or the entry is out). The Operator can decide whether "unreliable" hosts belong in (fonts.googleapis.com, gstatic.com, apis.google.com, accounts.google.com, doubleclick.net, github.com, snapchat.com and others GreatFire marks "unreliable"). The host grammar is host-only, so reCAPTCHA on `google.com/recaptcha` can only be listed as `www.google.com` and `google.com`, which also flags other google.com loads; `recaptcha.net` (Google's documented alternative) is reachable and not listed.
- `model-hosts.json`: the host grammar allows only a leading `*.`, so Bedrock (`bedrock-runtime.<region>.amazonaws.com`, 22 regions) and Vertex (`<region>-aiplatform.googleapis.com`, 36) are listed region by region; a later region is missed until the next ruleset release. Stability AI: BLOCKED (docs are a JavaScript shell). `api.together.xyz` and `api-inference.huggingface.co` are not listed because the docs fetched name `api.together.ai` and `router.huggingface.co`.
- `social-hosts.json`: 16 networks. Medium is BLOCKED (403); WhatsApp, Discord, Mastodon omitted by design. Most `handleSegment` values rest on observed 200 responses, not vendor docs (UNPROVEN); the Facebook `/sharer/sharer.php` path is not documented anywhere that could be fetched and is not in `sharePaths`. `handleSegment` is one integer, so a network with several URL shapes (YouTube, Snapchat, Tumblr blogs) only gets its canonical shape. Proposal: allow an array.
- `placeholder-handles.json` lists each handle bare and with a leading `@`, because the spec does not say whether `@` is stripped before comparison. Proposal: strip one leading `@`.
- `local-listing-sources.json`: regions are sourced only for Yandex (RU, BY) and Apple (availability table; the page does not name the feature as the Business Connect claiming feature); `bing` `[]`, `naver` KR, `baidu` CN, `seznam` CZ are assumptions (UNPROVEN). Yandex's `/sprav/add` answers 488 to a script, so its liveness is unproven. The vendor-terms licences were not read; all are recorded as `LicenseRef-vendor-documentation-facts`.

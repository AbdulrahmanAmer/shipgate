# Coverage — round-5 should-adds carried into round 06 (orchestrator)
Verdict: COVERAGE INCOMPLETE      Gaps: 0 Must, 5 Should — all five get added this round (the Operator: nothing parked).

Fixers: adapt the text to your file's definitions; IDs are the next free ones at the time of writing — re-check.

| # | Rank | Gap | Why existing rules don't cover it | Evidence | Location (pack · ID · owning WP) |
|---|---|---|---|---|---|
| 1 | Should | Agent copies third-party text it fetched into the site | CQ-002/CQ-008 compare the site's own pages with each other; nothing compares with what the agent read | Google spam policies: scraped content | spec/packs/web-delivery.md · CQ-010 · WP-501 (recording: WP-306, 05 § 3 xfile) |
| 2 | Should | A form that works locally can still lose leads in production (production CRM keys, mail routing) | UX-001 proves delivery in the verify environment only; production write probes are rejected by the decision log | Decision log row "Remote/production targets" | spec/packs/ux.md · UX-022 · WP-609 |
| 3 | Should | UK consumer rules: order-button wording, VAT-inclusive prices, drip pricing | PRV-023/PRV-026 apply only with EU consumer jurisdictions | Consumer Contracts Regulations 2013 reg. 14(3); Price Marking Order 2004; DMCC Act 2024 Part 4 (drip pricing, in force 2025-04-06) | spec/packs/privacy.md · PRV-023/PRV-026 parts · WP-606 |
| 4 | Should | Re-platforming loses image search traffic when image URLs change | REF-010 covers page URLs, not image URLs | Google Search Central: image SEO (keep image URLs stable or redirect) | spec/packs/refactor.md · REF-014 · WP-801 |
| 5 | Should | SaaS signup lets unverified email addresses use the product | SEC-* probes cover sessions, auth bypass and tenants, not email-ownership verification | OWASP ASVS 5.0 V6 (authentication: verify email ownership before trust) | spec/packs/security.md · SEC-067 · WP-607 |

## Proposed rule text

**1 — web-delivery**
- **CQ-010** · P1 · html — No copied third-party text: the visible `<main>` text of each sampled public page contains no run of ≥ 30 consecutive words (NFKC, case-folded, punctuation stripped, whitespace collapsed) that also occurs in a document the agent fetched in any session recorded for this tree (the session fetch store, 03 § 15: text of every web fetch, search result and browser-tool page the host reports, 05 § 3) whose host is neither a service origin nor `organization.sameAs`/`socialProfiles` of `business.json`. Runs inside `<blockquote>` or `<q>` with a `cite` attribute, or with an `<a href>` to the fetched URL inside the same element, are quotations and pass. No session fetch store (CI, or a host that doesn't report fetches) → `skipped(no-fetch-store)`.
  xfile → `spec/05-integrations.md` § 3 (post-hook records fetch events into the store; per-host field mapping in 03 § 16) and `spec/03-formats.md` § 15 (store: user state dir `fetches/<repo-id>/<session-id>.jsonl`, `{ url, host, fetchedAt, textHash, text }`, text capped at 200,000 characters per document, store capped at 50 MB per repo, oldest sessions evicted first).

**2 — ux**
- **UX-022** · P1 · review — Production conversion check at launch: in a run whose edge pass targets production (`edge.production: true`) and that finds no `IDX-011`/`SEC-065` blockers, the review list contains one item per UX-001 form (route, selector, expected outcome: email recipient, CRM host or database) asking the Operator to submit it once on production and confirm the outcome arrived. Each item must be answered in `quality/audit/review.json` (04 § 1.7) with `confirmed` and a date on or after the lock's `createdAt`; an unanswered or `failed` item is a finding owned by `operator`. shipgate never submits forms on production (decision log: remote targets are read-only).

**3 — privacy**
- Jurisdiction `"uk-consumer"` (UK consumer law: Consumer Contracts Regulations 2013, Price Marking Order 2004, DMCC Act 2024).
- PRV-023: applies with `eu-consumer` **or** `uk-consumer`; source line adds "Consumer Contracts Regulations 2013 reg. 14(3)"; ruleset `order-button-labels.json` gains `en-GB` entries.
- PRV-026 part `indication`: applies with `eu-consumer` **or** `uk-consumer` (VAT-inclusive price for consumers); part `total` already applies everywhere — add DMCC Act 2024 to its sources.

**4 — refactor**
- **REF-014** · P1 · baseline, http — Re-platforming keeps image URLs: with a remote baseline, every same-origin image URL recorded in it (`<img src>`/`srcset` candidates and `<picture><source srcset>` in baseline `<main>`, `og:image`, image-sitemap `<image:loc>`) answers 200 with an `image/*` type, or redirects in one hop (301/308) to a URL that does. A 404/410 or a redirect to an HTML page is a finding listing the image URL and the baseline pages that used it. Applies only to images of pages that REF-010 keeps (retired pages' images are exempt).

**5 — security**
- **SEC-067** · P1 · browser, http — Email ownership before trust (when `project.kinds` contains `saas` and a flow has `journey: "signup"`; mutating stage, 04 § 4.2 step 8). Part `gate`: right after the signup flow, before the verification email is opened, a request with the new account's session to each route matching `security.signup.verifiedOnly` (default: every `app` surface pattern) answers 401/403 or redirects to a verification page; `security.signup.verification: "none"` declares that the product allows unverified use and makes the part `notApplicable`. Part `single-use`: the verification link from the SMTP sink works once; a second request with it does not verify again or log in (401/403/410 or the "already verified" page without a new session cookie). Without an SMTP-sink email after signup: finding (the product doesn't verify email at all), unless `verification: "none"`.
  Policy: `security.signup: { "verification": "link" | "code" | "none" (default "link"), "verifiedOnly": [] (default: `app` surfaces) }`.

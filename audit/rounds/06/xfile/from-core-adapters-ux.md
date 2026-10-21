# Cross-file requests from core-adapters-ux (round 06, pass A)

Owner files: spec/01-core.md, spec/02-adapters.md, spec/packs/ux.md. Every request below is an edit in a file this group does not own. Where another group's request touches the same sentence (e.g. from-programmatic-search X4 on 04 § 1.2), apply both; the edits below are written as insertions so they compose.

## C1 — spec/04-algorithms.md § 1.2, Facts-oracle rules list
Old: `UX-020 `social-proof` and `stock``
New: `UX-020 `social-proof`, `stock` and `timer``
and in the same paragraph's content list, after `stock counts` insert `, countdown timers`.
Serves: concreteness-core-adapters-ux #22 (UX-020 `timer` with `offers` absent is a blocking `forbidden-value`, ux.md UX-020).

## C2 — spec/04-algorithms.md § 1.2, Required-facts rules list
Old: `PRV-025):**`
New: `PRV-025; UX-015 when a provider price id is sent and the `prices[]` entry has no `providerId`; UX-022 launch-form confirmations):**`
and in the same paragraph, after `a missing `legal` value` insert `, a missing `prices[].providerId`, a missing `launch-forms.json` entry`.
Serves: #1 (UX-015 operator-owned `missing-element`) and coverage-r05-carryover #2 (UX-022 operator-owned `missing-element`, so the run ends in an `operator-owned` handoff, never a PASS).

## C3 — spec/04-algorithms.md § 15, Reference time bullet
Insert at the end of the bullet: ` Date comparisons that gate verification (expiries, activation dates, "already happened" dates) use the expiry clock of 01 § 5.4, which combines the reference time with the wall clock; UX-020 part `timer` reads the wall clock directly. Both are non-deterministic (TR-103).`
Serves: #3 (an agent-set commit date can't keep an expired waiver/debt item alive).

## C4 — spec/04-algorithms.md § 16, Caching
Insert after the `Key = SHA-256 of (…)` paragraph: `Outcomes that depend on the wall clock (01 § 5.4 expiry clock, UX-020 `timer`) are recomputed on every run and never served from the cache.`
Serves: #3.

## C5 — spec/03-formats.md § 17 Report example
Old: `"dependenciesAdded": [], "handoff": null }`
New: `"dependenciesAdded": [], "auditTargets": ["web:/blog/{slug}", "apps/web/app/page.tsx"], "handoff": null }`
and append after the example: `` `auditTargets`: up to 20 route-group ids and changed-file paths drawn with the lock-digest PRNG (01 TR-103, label `audit-targets`) from their sorted union; the Auditor writes one `review.json` entry per target (01 § 10.2). ``
Serves: #10.

## C6 — spec/03-formats.md § 6 Adapter manifest table
Insert a row after the `priority` row: `| `role` | `"primary"` \| `"addon"`; `auto` selects the highest-`priority` matching primary plus every matching addon (02 § 3) | yes | — |`
and in the sentence `for an addon, only `id`, `detect` and `priority` are required` replace with `for an addon, only `id`, `role`, `detect` and `priority` are required`.
Serves: #19 (nothing marked an adapter as primary or addon).

## C7 — spec/03-formats.md § 6 Adapter manifest table, `regexSinks` row
Old: `for template languages with no maintained grammar; caps that language's rules at tier 2`
New: `for template languages with no maintained grammar; a service whose files include such a language has coverage level at most `structural`, and template rules on those files report the declared `precision` in the finding (02 § 4)`
Serves: #20 (per-rule tier cap contradicted the one-level-per-service coverage model).

## C8 — spec/03-formats.md § 14 Business facts, `prices[]`
Old: `prices: [{ id, label, amount, currency, kind?: "item"|"fee" (default item), recurring?: "month"|"year", providerId? }]`
New: `prices: [{ id, label, amount: decimal string in major units (e.g. "49.00"), currency: ISO 4217, kind?: "item"|"fee" (default item), recurring?: "month"|"year", providerId? }]`
Serves: #31 (UX-015 converts `amount` to minor units with the ISO 4217 exponent; UX-003 compares page text in major units).

## C9 — spec/03-formats.md § 14, after the `Page approvals` bullet
Insert: `- **Launch-form confirmations** — `quality/approvals/launch-forms.json` (Operator-written, covered by the lock through `quality/approvals/**`, 03 § 8): `{ "formatVersion": 1, "forms": [{ "key": string, "result": "arrived" | "failed", "confirmedOn": YYYY-MM-DD, "note"?: string }] }`. `key` is the UX-022 form key `<flow id>#<submitting step index>→email:<to>|egress:<host>|db:<db>`; the report lists every key that lacks an entry.`
Serves: coverage-r05-carryover #2 (UX-022). The confirmation must be Operator-owned: `quality/audit/review.json` is Auditor-written (agent), so it can't be the oracle (STANDARD C10).

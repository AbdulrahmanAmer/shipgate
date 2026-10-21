# Cross-file requests from web-delivery — round 06 pass A

Each request: target file, location, exact edit, the finding it serves. web-delivery.md already uses the new names (it now reads `renderModes`, `hydrationErrorPatterns`, `slugApis`, the `{locale}` capture of `i18nCatalogs`, the 04 § 12 token overlap, the session fetch store).

## X1 — spec/03-formats.md § 6 (adapter manifest field list)
Serves: concreteness-web-delivery #6 (RTE-002), #7 (RTE-013), #11 (URL-007), #22 (I18-009, MET-008). Coordinate with concreteness-formats-integrations #14 (adapter field types): use the same type notation that fixer chooses.

Old text:
`i18nCatalogs[]` (globs of message catalogues for MET-008)

New text:
`i18nCatalogs[]` (globs of message catalogues for MET-008 and I18-009; each glob contains exactly one `{locale}` placeholder that matches one path segment or file-name stem, e.g. `messages/{locale}.json`, `locales/{locale}/*.json`; the matched text is the catalogue's BCP-47 locale), `renderModes[{ pattern, mode: "ssr"|"ssg"|"isr"|"csr" }]` (RTE-002: ast-grep patterns over route files, tried in order, the first match decides; the list ends with a catch-all entry for the framework default; e.g. Next app router: page file whose first statement is `'use client'` → `csr`, `export const dynamic = 'force-static'` → `ssg`, `export const revalidate = <n>` → `isr`, catch-all `ssr`), `hydrationErrorPatterns[]` (regexes over browser console messages, e.g. React `Hydration failed`, `Text content does not match`, `There was an error while hydrating`, Vue `Hydration .* mismatch`, Svelte `hydration_mismatch`; RTE-013 `hydration`), `slugApis[]` (calls that generate slugs from text, e.g. `slugify(…)`, `@sindresorhus/slugify`, Django `slugify`, Rails `parameterize`; URL-007 `recompute`)

## X2 — spec/04-algorithms.md § 12 (Parity)
Serves: concreteness-web-delivery #3 (RTE-001, RTE-014, IDX-013). Same gap as concreteness-algorithms #26 — merge into one definition. Note the reference for RTE-014: #3 proposed the smartphone response, which is wrong — with smartphone as the reference, content present only on desktop never lowers the score, which is exactly the defect RTE-014 exists to catch. Algorithms #26 has it right (desktop). web-delivery.md RTE-014 now says "reference = the desktop response".

Insert after the "Mobile vs desktop (RTE-014)" bullet:
- **Token overlap:** text is NFKC-normalised, case-folded and split into UAX #29 words (punctuation-only tokens dropped); overlap = |A ∩ B| / |A| over **multisets**, where A is the reference text and B the compared text. References: rendered `<main>` for RTE-001 `main`; the desktop response for RTE-014; the page's raw-HTML `<main>` for IDX-013; the no-fault response for RES-003. Link overlap (RTE-014) uses the same formula over the multiset of canonicalised (§ 10 normalisation) `a[href]` targets in `<main>`. A reference with 0 tokens counts as overlap 1.

And in the "Mobile vs desktop (RTE-014)" bullet, old: `overlap ≥ \`parity.mobileMinOverlap\`` → new: `token overlap (reference: desktop) ≥ \`parity.mobileMinOverlap\``.

## X3 — spec/04-algorithms.md § 1.4 (Gate status, SKIPPED)
Serves: concreteness-web-delivery #23 (CQ-002, CQ-008; also CQ-010, new, channel `content`).

Old text: `G5 with no families`
New text: `G5 when no programmatic family exists and every rule with a \`content\` channel (CQ-002, CQ-008, CQ-010) is \`notApplicable\``

(The second half of #23 — "CQ-002 and CQ-008 need a complete crawl" — is placed in the rule text of CQ-002 and CQ-008 in web-delivery.md instead of 04 § 1.5, since it is a per-rule outcome, not a gate prerequisite; 04 § 10 "Graph rules" already defines `skipped(incomplete-crawl)`. No 04 § 1.5 edit needed.)

## X4 — spec/04-algorithms.md § 1.8 (Partial severities)
Serves: concreteness-web-delivery #4 (RTE-010 parts).

Old text: `- **RTE-010:** \`behaviour\` P0†, \`source-hint\` W.`
New text: `- **RTE-010:** \`behaviour\` P0†, \`empty-ua\` W, \`source-hint\` W.`

## X5 — spec/04-algorithms.md § 15 (Visible dates)
Serves: concreteness-web-delivery #15 (SCH-005 now uses the visible-dates definition).

Old text: `- **Visible dates (AEO-006, AEO-012, mainTextHash):**`
New text: `- **Visible dates (AEO-006, AEO-012, SCH-005, mainTextHash):**`

## X6 — spec/03-formats.md § 15 (Agent-side and state files)
Serves: coverage-r05-carryover #1 (CQ-010).

Insert after the "State dir" bullet:
- **Session fetch store** (`<state dir>/shipgate/<repo-id>/fetches/<session-id>.jsonl`, written only by shipgate's post-tool hook, 05 § 3): one line per fetched document `{ url, host, kind: "web-fetch"|"web-search"|"browser", fetchedAt, textHash, text }`. `text` is the document's visible text (HTML: `<body>` text without `<script>`, `<style>`, `<template>`; search results: titles and snippets), capped at 200,000 characters per document; `textHash` is SHA-256 of `text`. The store is capped at 50 MB per repo-id; the oldest sessions are evicted first and each eviction is recorded in `attempts.json`. Read by CQ-010.

## X7 — spec/03-formats.md § 16 (Normalised hook events)
Serves: coverage-r05-carryover #1 (CQ-010).

Old text: `tool: "edit"|"write"|"shell"|"read"|"mcp"|"other", paths[], command?, prompt?,`
New text: `tool: "edit"|"write"|"shell"|"read"|"fetch"|"mcp"|"other", paths[], command?, prompt?, fetch?: { url, kind: "web-fetch"|"web-search"|"browser", text },`

Append to the paragraph: `\`fetch\` events come from post-tool payloads that carry fetched content (Claude Code \`WebFetch\`/\`WebSearch\`; browser-tool MCP calls whose result contains page text); hosts that don't report them are marked in 05 § 3.3.`

## X8 — spec/05-integrations.md § 3.3 (Host matrix) and § 3.1 (protected paths)
Serves: coverage-r05-carryover #1 (CQ-010: recording, and no escape by deleting the store).

§ 3.3, insert after the table (before **Invariants**):
`**Fetch events (CQ-010):** the post-tool hook appends every \`fetch\` event (03 § 16) to the session fetch store (03 § 15). Which hosts report fetched content (e.g. Claude Code \`WebFetch\`/\`WebSearch\` PostToolUse \`tool_response\`) is recorded per host by WP-101 from a live hook run; until a host's row is verified it counts as "reports no fetch events" and CQ-010 is \`skipped(no-fetch-store)\` for their sessions. Other / none: no fetch events.`

§ 3.1, append a bullet:
`- shipgate's own state dir (\`<state dir>/shipgate/**\`, outside the repo: attempts, session snapshots, sealed verdicts, the session fetch store).`

## X9 — spec/packs/answer-engines.md AEO-014 part `agent-parity`
Serves: concreteness-web-delivery #4 (RTE-010 now defines the user-agent ruleset and the text-masked skeleton; AEO-014 reuses both but names neither).

Old text: `with the \`userAgent\` of Bingbot and of each`
New text: `with the \`userAgent\` of Bingbot (ruleset \`search-agents.json\`, variant \`desktop\`) and of each`

Old text: `its \`<main>\` masked skeleton hash (04 § 11) equals the Chrome one`
New text: `its \`<main>\` masked skeleton hash (as RTE-010 \`behaviour\`: 04 § 11 steps 1 and 3, every non-whitespace text node replaced with \`⟦t⟧\`, then step 6) equals the desktop Chrome one (\`search-agents.json\`)`

(Without the text masking, 04 § 11 steps 1–6 keep all non-`data-fact` text, so the "skeleton" hash would really be a text hash, contradicting the next clause that compares text only when Chrome is stable.)

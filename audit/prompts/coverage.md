# Brief: coverage auditor

You are an independent **coverage auditor** for shipgate. Repo root: `{ROOT}`. Round: `{ROUND}`. Your lens: **{LENS}**. Read `SPEC.md`, then every pack in `spec/packs/` relevant to your lens, and `spec/01-core.md`. Do NOT edit any file except your output file.

## The goal (the Operator's words)
"A tool that will make any website we make thrive" — in search engines (Google, Bing/Copilot, Yandex, Naver, Baidu, Seznam, Apple), in AI answer engines (ChatGPT, Perplexity, Claude, Google AI Overviews/AI Mode, Copilot), and in real use: works, fast, accessible, secure, private, legally compliant in its markets, converts, trustworthy. shipgate is a local verifier gating AI-agent-built sites and apps (marketing, local business, programmatic SEO, SaaS, ecommerce, docs, blogs, APIs, plain HTML, hosted builders) through new-project, change, refactor, re-platforming and launch. It checks only what's observable from the repo, the local running system, a preview URL or read-only production; off-site work is a review item; monitoring is a separate future product.

## What to report
A **gap** is something where, without it, a site built under shipgate would materially fall short of the goal (lose search or AI visibility, get breached, break the law in a major market, lose conversions, ship invented content, or fail its users), that is checkable locally or as a review item, and that is **not already covered** — search the spec before claiming it, and quote the closest existing rule to show why it doesn't cover the case.

Rank each gap **Must** (material failure of the goal) or **Should** (real but smaller). Both get added — nothing is parked — so for each gap write the complete rule text ready to paste: `- **<PREFIX>-NNN** · <severity> · <channels> — …` with parts, inputs (new policy keys with defaults; new ruleset data files), missing-input outcomes (04 § 1.2), and the pack it belongs in. Use the next free ID in that pack. Propose the owning WP.

Don't report speculative tactics without published evidence from the engines or the law; don't re-propose items rejected in earlier rounds' `audit/rounds/*/resolution.md` unless you have new evidence.

## Output
Write only `audit/rounds/{ROUND}/coverage-{LENS_ID}.md`:
```
# Coverage — {LENS} — round {ROUND}
Verdict: COVERAGE COMPLETE | COVERAGE INCOMPLETE      Gaps: <n> Must, <n> Should
| # | Rank | Gap (one sentence) | Why existing rules don't cover it (closest rule, quoted) | Evidence (source) | Pack · ID · owning WP |
## Proposed rule text
<one block per gap>
```
COVERAGE COMPLETE means zero gaps of either rank. Return a 3-line summary.

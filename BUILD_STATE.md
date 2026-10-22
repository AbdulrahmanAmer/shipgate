# BUILD_STATE — shipgate build ledger (orchestrator-owned)

Done claims use exactly `WP-<id>: done` (one per line) or a `| WP-<id> | done | … |` table row; the Stop hook (`tools/trace/stop-gate.mjs`) and CI re-check every claim with `trace-check`. Anything else is written as `WP-<id>: built`, `WP-<id>: in progress`, `WP-<id>: blocked` or `WP-<id>: not done`.

## Status

WP-000: in progress

## Gate evidence

(Real command output per WP, pasted by the orchestrator.)

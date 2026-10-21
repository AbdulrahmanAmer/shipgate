# Pack: resilience

> How the system behaves when its dependencies are down or slow, proven by fault injection in the verify environment.

---

## 1. Policy section

```jsonc
"resilience": {                                // HTTP dependencies = hosts[] entries with dependency: true; databases = verifyEnv.databases
  "timeouts": { "upstreamMs": 5000, "pageMs": 8000 },
  "degradable": [ { "dependency": "search.internal", "routes": "web:/blog/**" } ]   // pages that must still render without it
}
```

Faults use the core fault-injection facility (04 § 4.5). Database-down behaviour on pages is owned by RTE-007 (web-delivery); this pack covers the rest.

## 2. Rules — `RES-*`

- **RES-001** · P0 · http — Database unavailable: **API** requests return 5xx/503 with the declared error shape, never 200 with empty data and never 404 (pages are owned by RTE-007).
- **RES-002** · P1 · http — Slow upstream (delayed beyond `upstreamMs`): the service responds within `pageMs` with either the page (dependency degraded) or 5xx/503; no request hangs.
- **RES-003** · P1 · http — `degradable` routes still render their primary content (RTE-001 parity) when the listed dependency is refused or returns 5xx.
- **RES-004** · P1 · browser — Third-party script hosts blocked: public pages still render main content, and flows whose `requires` list doesn't include that host still pass.
- **RES-005** · P1 · http — Recovery: after the dependency returns, the service serves normal responses again without a restart.
- **RES-006** · P1 · ast — Outbound HTTP calls set explicit timeouts (adapter `httpClientApis`); retries are bounded with backoff.
- **RES-007** · W · http — 503 responses during dependency failure carry `Retry-After`.

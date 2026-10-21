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

Faults use the core fault-injection facility (04 § 4.5). Database-down behaviour on pages is owned by RTE-007 (web-delivery); this pack covers the rest. No dependency hosts and no databases: RES-001…RES-005 `notApplicable`.

## 2. Rules — `RES-*`

- **RES-001** · P0 · http — Database unavailable: **API** requests return 5xx/503 with the declared error shape, never 200 with empty data and never 404 (pages are owned by RTE-007).
- **RES-002** · P1 · http — Slow upstream (the egress proxy holds each request to the dependency for `pageMs` + 5,000 ms before answering): the service responds within `pageMs` with either the page (dependency degraded) or 5xx/503; no request hangs.
- **RES-003** · P1 · http — `degradable` routes, while the listed dependency is refused or returns 5xx, still answer 200 with `<main>` text whose token overlap with the same route's no-fault response is ≥ `web-delivery.parity.minOverlap` (04 § 12).
- **RES-004** · P1 · browser — Third-party script hosts blocked: for each `hosts[]` entry with `browser: true` that served a script on a browser-sampled public page, with that host answering connection-refused in the browser (one host at a time), those pages' rendered `<main>` text overlap with the unblocked render is ≥ `web-delivery.parity.minOverlap`, and flows whose `requires` list doesn't include the host still pass.
- **RES-005** · P1 · http — Recovery: after each fault ends, within 30 s (one request per sampled route per second), every sampled route again answers the status it answered before the fault, with no service restart.
- **RES-006** · P1 · ast — Each adapter `httpClientApis` call passes the entry's `timeoutArg` (03 § 6; e.g. `fetch` `signal: AbortSignal.timeout(n)`, axios `timeout`, `requests` `timeout=`), or is made on a client created by a `clientFactory: true` entry's call that sets it. Part `retry`: retry loops around such calls (a loop or recursion whose body catches the call's error) have an integer bound ≤ 10 and a delay call (`clockApis`/`sleepApis`) inside the loop.
- **RES-007** · W · http — 503 responses during dependency failure carry `Retry-After`.

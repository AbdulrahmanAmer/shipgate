# Resolution — security — pass B — round 06

Inputs scanned: all 8 files `audit/rounds/06/xfile/from-*.md`. Only one request targets `spec/packs/security.md`: from-algorithms X7. (`from-security.md` holds this group's own outgoing requests to 03/04/data-api; none target security.md. from-algorithms X8 targets `spec/CHANGES.md` and goes to the orchestrator.)

| Finding (file#row) | Req | Outcome: fixed / adapted / rejected / xfile | Where (file:line) | Note |
|---|---|---|---|---|
| xfile-security#X1 (from-algorithms X7; serves concreteness-algorithms #37) | Add probe target `http://10.255.255.1:{canary}/sg{n}` (only when the alias is bound, 04 § 4.6) to SEC-046 | adapted | spec/packs/security.md:118 | Target inserted after `http://2130706433:{canary}/sg{n}` exactly as requested. I also changed the `{canary}` definition from "a shipgate listener on a free loopback port" to "a free loopback port on which shipgate listens at `127.0.0.1`, `[::1]` and, when bound, `10.255.255.1` (04 § 4.6)". This matches 04 § 4.6 (l.213: same `{canary}` port on all three listeners, the report says so when the alias can't be bound). "Fails when the canary receives any request" now covers the alias listener too. Nothing weakened, and no conflict with pass-A text. |

## Ownership rows
None (no new rule IDs or parts).

## Ruleset data
None.

## Policy keys added (key · type · default · file)
None.

## spec-lint (last three lines)
```
spec-lint: {"requirements":526,"rules":507,"toolRequirements":19,"rulesWithParts":142,"errors":0,"warnings":62}
  errors by check: none
  warnings by check: ruleset-unsourced=62
```
Note: an earlier run during this pass showed `ownership=5` errors and `channel-infra=5` warnings. They were gone on the next two runs, so they came from parallel fixers' edits in progress, not from this file. The 62 `ruleset-unsourced` warnings were there before this pass (e.g. `session-lifetimes`, `sri-hosts`, `csrf-token-names`, `weak-hash-apis`, `ci-hardening`, `install-script-flags` in security.md). The orchestrator owns those through BUILD_MAP WP-104.

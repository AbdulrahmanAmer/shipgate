p='spec/packs/data-api.md'
s=open(p,encoding='utf-8').read()
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt, (old[:80], s.count(old))
    s=s.replace(old,new)
rep("Part `apply`: applying all migrations to an empty disposable database (04 § 4.2 step 4) exits 0.",
    "Part `apply`: applying all migrations to an empty disposable database (04 § 4.2 step 4) exits 0; a finding makes the service's later G4–G7 checks `blocked(prerequisite: DB-001)`, owner `builder` (04 § 1.5).")
rep("(Postgres: `varchar(n)`→`varchar(m>n)`, `varchar`→`text`, `numeric(p,s)`→`numeric(p'>p,s)`; MySQL: INSTANT/INPLACE-eligible changes);",
    "(Postgres: `varchar(n)`→`varchar(m>n)`, `varchar`→`text`, `numeric(p,s)`→`numeric(p'>p,s)`; MySQL: no ruleset list — a change is safe when, in 04 § 4.2 step 4 before its migration file is applied, the same `ALTER TABLE` run against an empty structural copy of the table (`CREATE TABLE sg_probe LIKE <table>`, dropped afterwards) succeeds with `, ALGORITHM=INSTANT` appended, or else with `, ALGORITHM=INPLACE, LOCK=NONE` appended; both refused → finding);")
rep("- **DB-008** · P1 · ast — No N+1 patterns: a query call (adapter `queryApis`) inside a loop over the result of another query, in changed code. Adapters without `queryApis` → `noAdapterSupport`.",
    "- **DB-008** · P1 · ast — No N+1 patterns, in changed code (04 § 13 DB-008): a finding is a `queryApis` call whose nearest enclosing loop in the same function — `for`, `for…of`, `for…in`, `while`, `do…while`, a Python/Ruby/Rust loop or comprehension, or a callback passed to `map`, `forEach`, `flatMap`, `reduce`, `each` (including `Promise.all(x.map(…))`) — iterates a value whose data-flow origin (same function, as AGT-003 in 04 § 13) is the result of another `queryApis` call. Calls reached only through a callee are not followed. Failure class `pattern-match` (file, line of both calls). Adapters without `queryApis` → `noAdapterSupport`.")
rep("the owner's own get must succeed; a refusal is a finding (`access-denied-wrongly`, owner `builder`).",
    "the owner's own get must succeed. An owner's get that is refused is a finding `access-denied-wrongly`; an unauthenticated or other-uid get, update, delete or create that is not refused is a finding `access-allowed`; both owner `builder`.")
open(p,'w',encoding='utf-8',newline='\n').write(s)
print("ok")

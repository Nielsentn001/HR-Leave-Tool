# Engineering decisions

## 1. Team capacity is validated at approval time, not at submission

**Decision:** `LeaveService.submit_request()` validates that dates are
well-formed and that the request doesn't overlap an existing *approved*
request for the same employee. It deliberately does not check the 30% team
capacity rule. Capacity is only checked in `approve_request()`, immediately
before a request transitions to Approved.

**Alternatives considered:** Validating capacity at both submission and
approval, or rejecting a submission outright if it would currently exceed
capacity.

**Reasoning:** The spec states that pending requests do not block each
other, and that capacity applies to *approved* leave on a given day. If
capacity were enforced at submission, the order in which people happened to
submit requests would silently determine who's even allowed to ask — which
contradicts "pending requests do not block each other." Deferring the
capacity check to approval means multiple employees can submit overlapping
requests, and it's the manager's approval decision that resolves who
actually gets the limited capacity. This also means Rule 8's requirement to
"validate the business rules again before approving" is doing real,
necessary work, not just re-confirming something already guaranteed true.

---

## 2. Tests run against in-memory SQLite, not the production PostgreSQL database

**Decision:** `tests/conftest.py` provisions a fresh in-memory SQLite
database per test, rather than pointing tests at the same Postgres instance
used in development.

**Alternatives considered:** Running tests against a real (possibly
containerized, ephemeral) Postgres instance, matching production exactly.

**Reasoning:** None of the business rules in `LeaveService` depend on
anything Postgres-specific (no JSON columns, arrays, or Postgres-only SQL
functions) — they're plain relational queries and date arithmetic. SQLite
gives fully isolated, dependency-free tests that run in milliseconds and
don't require Docker to be running just to execute `pytest`. The tradeoff is
a small, accepted risk of behavioral divergence between SQLite and Postgres
in an area this project doesn't touch; if the schema ever grew to use
Postgres-specific features, this decision would need revisiting.

---

## 3. Domain exceptions are split from HTTP concerns, and split by kind

**Decision:** `LeaveService` raises two distinct exception types —
`LeaveNotFoundError` for missing employees/requests, and
`LeaveValidationError` for business rule violations (overlap, capacity,
invalid dates) — rather than raising `HTTPException` directly or using one
generic exception for every failure.

**Alternatives considered:** Raising `fastapi.HTTPException` directly from
inside `LeaveService`, or using a single generic exception type and
distinguishing cases by matching on the error message string.

**Reasoning:** `LeaveService` has no reason to know it's being called from a
web API — that coupling would make the service harder to test in isolation
and impossible to reuse from, say, a CLI or a background job. Raising plain
Python exceptions keeps the service framework-agnostic, and the API layer
(`app/api/leave.py`) is responsible for translating them into the correct
HTTP status codes. Splitting "not found" from "invalid" as two exception
types (rather than one, matched by string) means that translation is
structural and can't silently break if an error message's wording changes
later — `except LeaveNotFoundError` can't accidentally miss a case the way
`if "not found" in str(error)` could.

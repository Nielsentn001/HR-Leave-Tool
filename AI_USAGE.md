# AI usage

## AI tools used

Claude (Anthropic), used as a pair programmer throughout the entire build —
backend architecture and models, business rule implementation in
`LeaveService`, API layer, database seeding, frontend components, and this
documentation. Work was done incrementally: one piece at a time, explained,
verified by actually running it (tests, real Postgres, real end-to-end API
calls), then committed, rather than generating the whole project in one
pass.

## Two useful prompts

**1. The initial project brief** — a detailed spec covering tech stack,
architecture (React → FastAPI → LeaveService → SQLModel → PostgreSQL),
exact business rules (30% team capacity, weekend/holiday handling, overlap
rules, inclusive date ranges), endpoint contracts, and an explicit
instruction to build incrementally with confirmation at each step. Having
this upfront meant every subsequent step had an unambiguous spec to
implement against, rather than the design being invented ad hoc.

**2. "Explain all that we just did with all the code involved so I am not
lost if asked in my interview or someone alters the code"** — asked after
the initial project scaffold. This shifted the workflow from "generate code
and move on" to "generate code, then justify every non-obvious decision out
loud." It's directly responsible for things like the mutation-testing check
in `LeaveService` (deliberately breaking the capacity rule to confirm the
test suite actually catches it, not just that it passes), and the
end-to-end verification runs against the real backend rather than trusting
that code which compiles is code that works.

## An AI suggestion that was rejected

While building the `LeaveGrid` frontend component, an alternate
implementation surfaced in the working directory that fetched its own data
directly inside the component via a `useEffect` hook, rather than receiving
already-fetched data as a prop. It was functional, but rejected in favor of
the props-based version that shipped.

**Why it was rejected:** the project brief is explicit that "React should
contain presentation logic only" and business/data logic shouldn't live
scattered across components. A component that fetches its own data can't
be reused or tested in isolation without a live API, and — more
importantly for this app specifically — approving or rejecting a leave
request needs to update *two* different pieces of UI at once (the pending
list shrinks, the approved-leave grid grows). If each component fetched its
own data independently, there'd be no single place responsible for keeping
those two views consistent with each other. The shipped design instead
centralizes all data fetching and refetch-after-action logic in one place
(`pages/LeaveDashboard.tsx`), and every component underneath it is a pure
function of the props it's given.

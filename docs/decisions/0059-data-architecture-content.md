# ADR 0059: Entities vs. Distributed Transactions content citing Pat Helland, module 27 session 1

## Status

Accepted

## Context

Continuing the computed prioritization plan (ADR 0056-0058). Recomputing the prerequisite graph after module 3 shipped confirmed modules 4 and 7 became newly unlocked as predicted. Among the remaining tied-top candidates (27, 47, each unlocking 2 further modules), module 27 (Data Architecture) was picked for its strong tie-back to module 35 (Distributed Fundamentals, already shipped) and a distinctive citation: Pat Helland's 2007 CIDR paper "Life Beyond Distributed Transactions: An Apostate's Opinion." Researching the citation surfaced that the paper is sometimes loosely associated with the BASE consistency model in secondary sources, but that attribution couldn't be verified against the paper itself (BASE is more commonly credited to Eric Brewer and Dan Pritchett) -- the session was deliberately scoped around Helland's actual, verifiable contribution (modeling data as independent "entities" to avoid distributed transactions) rather than repeating an unverified secondary claim.

## Decisions

1. **New section** `content/curriculum/27-data-architecture/`, attaching to the existing placeholder under "Data & Storage" (reusing `Module` id 5, the same one module 25 uses).
2. **Session 1 covers subtopic 27.1 (entity modeling and invariants)**, anchored entirely on Helland's real argument: distributed transactions (two-phase commit, etc.) promise the same guarantee a local transaction gives, but the coordination cost -- every participant held captive until the slowest one responds -- makes that promise fragile at real scale, which is why large systems avoid relying on it.
3. **A worked bank-account example makes entity boundaries concrete**: a deposit (same entity) is cheap and local; a transfer between two accounts (crossing an entity boundary) becomes a sequence of local transactions connected by a message, reaching consistency eventually rather than instantly -- explicitly tied back to module 35's CAP/PACELC framing as the same tradeoff applied to one concrete operation.
4. **The closing block reframes the design question itself** -- not "how do we make cross-machine coordination more reliable" but "how do we draw entity boundaries so the common case never crosses one" -- with a cross-team/cross-service example distinguishing a real ownership boundary (can't be designed away) from an accidental one (can).
5. **Citation attribution was deliberately scoped to what's verifiable**: the session discusses entities and the fragility of distributed transactions (Helland's actual, confirmed argument) without asserting he coined BASE, an attribution the research couldn't confirm against the primary source.
6. **No code exercise** -- distributed-transaction/entity-boundary reasoning doesn't reduce to a gradable function, consistent with every other conceptual session this effort has built.
7. **First-draft bias audit flagged 2 of 4 quizzes**, rebalanced to 0/4; five of six blocks needed length-padding to clear 900 characters.

## Consequences

- `pytest` 139 passed (unchanged -- pure content; confirmed the section reused `Module` id 5 rather than creating a duplicate). Grepped the test suite for the new slug before running it, per the lesson from ADR 0058 -- no WIP-example test referenced `27-data-architecture`, so no additional test fixes were needed this time.
- Verified against the live dev stack: section and lesson pages render, the Helland paper reference link renders with the correct href and resolves live, and the two-phase-commit fragility quiz was answered correctly through the real UI. Zero console/page errors. All test-generated rows deleted afterward.
- Recomputing the prerequisite graph after this module should be the first step of the next priority pass, per the standing method -- this ADR's snapshot (27 and 47 tied at the top) is now out of date with 27 shipped.

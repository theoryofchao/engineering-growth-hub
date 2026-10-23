# ADR 0044: Partial Failure and CAP content citing Martin Kleppmann, module 35 session 1 (new domain)

## Status

Accepted

## Context

Continuing both threads from ADR 0042/0043: content breadth (Distributed Systems is one of the 8 remaining fully-unauthored domains) and citing a genuinely-fitting influential engineer's real work. Martin Kleppmann (author of *Designing Data-Intensive Applications*) wrote a specific, well-known, directly-on-topic critique for this exact subtopic: his 2015 post "Please stop calling databases CP or AP" (confirmed live, `martin.kleppmann.com/2015/05/11/please-stop-calling-databases-cp-or-ap.html`) argues CAP's "C" means linearizability specifically, not whatever a team colloquially means by "consistent" -- directly useful content, not a citation bolted onto unrelated material.

## Decisions

1. **New section** `content/curriculum/35-distributed-fundamentals/`, attaching to the existing placeholder (`Topic` "Distributed Systems", reused `Module` id 7).
2. **Session 1 covers subtopics 35.1 and 35.2 together** (partial failure/network partitions, then CAP/PACELC), rather than one subtopic per session as earlier modules did -- partial failure is the *reason* CAP exists, so introducing CAP without it first would be reciting a theorem without its motivation.
3. **Kleppmann's critique is the session's spine for the CAP block, not a tacked-on link** -- the content itself teaches the nuance his post makes (CAP's "C" = linearizability specifically; real systems often make different tradeoffs per operation, which a single CP/AP label can't represent), with the `reference_links` citation on that exact block.
4. **PACELC is framed as the more operationally relevant model for everyday (non-partition) operation**, since CAP only speaks to the partition case -- and explicitly noted as independent from a system's CAP choice (a system's partition-time behavior and its normal-operation latency/consistency tradeoff are separate decisions), to avoid the common conflation of the two.
5. **A dedicated block on per-operation tradeoffs** (reads vs. writes, or per-request consistency levels) makes Kleppmann's "a single label erases real nuance" point concrete with its own worked example, rather than leaving it as an abstract caveat in the CAP block.
6. **No code exercise** -- distributed-systems tradeoff reasoning doesn't reduce to a gradable function, consistent with every conceptual session this effort has built so far (modules 25, 40, 10).
7. **First-draft bias audit needed two passes**: the session was also restructured from 5 to 6 blocks (adding the per-operation-tradeoffs block) after the first length/bias check, since 5 blocks under-filled the 6-7 target.

## Consequences

- `pytest` 139 passed (unchanged -- pure content; `Topic.query.count()` stayed 17, confirming no duplicate domain).
- Verified against the live dev stack: section and lesson pages render, the Kleppmann reference link renders with the correct href and was re-confirmed live (`curl` 200) both before and after drafting, and the timeouts-as-a-guess quiz was answered correctly through the real UI. Zero console/page errors. All test-generated rows deleted afterward.
- Opens the Distributed Systems domain (10th of 16 now with real content). Module 35's own prerequisites (05, 25, 30) are only partially met (25 now authored; 05 and 30 are not) -- picked anyway because the domain-breadth and citation fit outweighed waiting on its own prerequisite chain, unlike the prior several picks which were chosen specifically *because* their prerequisites were already satisfied.

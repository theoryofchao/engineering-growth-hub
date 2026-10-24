# ADR 0087: Control Plane (etcd, API Server, Scheduler) content, module 46 session 1

## Status

Accepted

## Context

Continuing the single-module-domain-gap heuristic adopted after the prereq-unlock-count method was exhausted (ADR 0086). Module 46 (Kubernetes) was the next pick, closing Infrastructure & Cloud to 5/5 -- its prerequisites (44, 45, 47) were all already authored.

Session 1 covers subtopic 46.1 (Control plane, API server, etcd, scheduler), following the module's natural subtopic order.

## Decisions

1. **New section** `content/curriculum/46-kubernetes/`, attaching to the existing placeholder under "Infrastructure & Cloud" (reusing `Module` id 9, the same one modules 44/45/47/48 use).
2. **Two citations, both confirmed via WebSearch before drafting**: **the official Kubernetes components documentation** (`kubernetes.io/docs/concepts/overview/components/`), confirmed verbatim ("The API server is the front end for the Kubernetes control plane"; the scheduler "watches for newly created Pods with no assigned node, and selects a node for them to run on"); **etcd's own "Why etcd" docs** (`etcd.io/docs/v3.5/learning/why/`), confirmed to actually discuss Raft before citing it as the consistency mechanism.
3. **Two deliberate, substantive continuity callbacks, not restatements**: the declarative desired-state framing is tied directly to module 48's Terraform content (same question, asked continuously instead of via one-shot plan/apply); etcd's Raft-based consistency is tied directly to module 36's majority-commit safety property, applied here to cluster state instead of general distributed data.
4. **The scheduler's narrow scope (deciding where, not running) is treated as the session's central non-obvious claim**, deliberately distinguished from the kubelet's actual-execution role (mentioned but explicitly out of scope for this session).
5. **A traced single-request worked example (block 5)** makes the "API server as sole door to etcd" claim concrete by following one `kubectl apply` end to end.
6. **No code exercise** -- control-plane architecture reasoning doesn't reduce to a gradable function, consistent with other conceptual sessions this effort has built.
7. **First-draft bias audit flagged 2 of 4 quizzes**; rebalanced to 0/4 over two passes on one quiz (a second length adjustment was needed after the first attempt left it still flagged by a small margin). Five of six blocks needed a padding pass to clear 900 characters.

## Consequences

- **Milestone: Infrastructure & Cloud (modules 44-48) is now the fourth domain with every module fully authored**, after Distributed Systems, Performance Engineering, and Backend & APIs. Verified via direct DB query (session counts per section).
- `pytest`: 139 passed (unchanged -- pure content; confirmed the section reused `Module` id 9 rather than creating a duplicate). Grepped the test suite for the new slug before seeding -- no hits, so no test fixes were needed this time.
- Verified against the live dev stack via Playwright: section and lesson pages render, both reference links (Kubernetes components docs, etcd's Raft-consistency docs) render with correct hrefs and resolve live (200), the Raft-majority-commit quiz was answered correctly through the real UI, and no raw/unparsed markdown leaked into rendered text. Zero console/page errors. All test-generated `exercise_submissions`/`exercise_review_states`/`user_progress` rows deleted afterward via direct `psql`.
- Three single-module domain gaps remain (modules 9, 34, 73) as candidates for the next picks in this pass.

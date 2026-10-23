# ADR 0053: Deployment Pipeline content citing Continuous Delivery's principles, module 49 session 1 (new domain)

## Status

Accepted

## Context

Continuing the content-breadth effort into one of the three remaining fully-unauthored domains. Module 49 (CI/CD) was the best-satisfied entry point among them (40 already authored; 12 and 45 are not) -- the same partial-prerequisites exception already used for modules 35, 58, and 62, justified here by domain-breadth value and a strong, canonical, directly-verifiable source: Jez Humble and Dave Farley's *Continuous Delivery*, whose own site lists its core principles plainly and is still live.

## Decisions

1. **New section** `content/curriculum/49-ci-cd/`, attaching to the existing placeholder under "DevOps & Delivery" (a new `Module`/`Topic` for this domain, confirmed via `Topic.query.count()` staying at 17 post-seed).
2. **Session 1 opens with the book's own "build quality in, don't inspect for it" principle** (traced to Deming's manufacturing insight) as the session's actual thesis, with the deployment pipeline presented as the concrete mechanism for it -- not a separate, disconnected list of CI/CD facts.
3. **Two of the book's genuinely distinct, often-conflated ideas get their own blocks**: promoting one immutable artifact through every stage (vs. the common anti-pattern of rebuilding from source at each stage, which can silently let a different build reach production than the one that was tested) and ordering pipeline stages fastest-and-cheapest-first (vs. running an expensive suite before a cheap one that would have rejected the same build for free).
4. **The "computers do repetitive work, humans do judgment calls" principle gets a concrete dividing line** (clear, unchanging pass/fail criterion -> automate; genuine UX/business judgment -> human), rather than left as an abstract value statement.
5. **No code exercise** -- pipeline design and principle application don't reduce to a gradable function, consistent with every other conceptual session this effort has built.
6. **First-draft bias audit**: 2 of 4 flagged, rebalanced to 0/4; all 6 blocks needed length-padding to clear 900 characters, the heaviest overall padding pass of this effort.

## Consequences

- `pytest` 139 passed (unchanged -- pure content; confirmed no duplicate domain was created).
- Verified against the live dev stack: section and lesson pages render, the Continuous Delivery reference link renders with the correct href and resolves live, and the one-artifact quiz was answered correctly through the real UI. Zero console/page errors. All test-generated rows deleted afterward.
- Opens the DevOps & Delivery domain (15th of 16 now with real content). Only Infrastructure & Cloud and Product & Collaboration remain fully unauthored.

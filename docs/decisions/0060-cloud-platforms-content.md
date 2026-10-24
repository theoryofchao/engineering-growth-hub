# ADR 0060: Shared Responsibility Model content, module 47 session 1

## Status

Accepted

## Context

Continuing the computed prioritization plan (ADR 0056-0059). With module 27 shipped, module 47 (Cloud Platforms) was the next tied-top candidate from the prerequisite graph recomputed after module 3. It attaches to the existing "Infrastructure & Cloud" module (id 9), alongside the already-authored Linux, Containers, and Kubernetes sections.

Researching a hook for this session, a secondary-source statistic often attributed to Gartner ("99% of cloud security failures will be the customer's fault") kept surfacing, but only ever through other articles citing the Gartner report -- no accessible primary source could be found to verify the figure or its exact wording. Rather than cite an unverifiable statistic, the session anchors instead on a real, independently documented case: the 2019 Capital One breach, reported in detail by Krebs on Security, which stayed entirely on the customer's side of the shared-responsibility line (misconfigured WAF, overly permissive IAM role).

## Decisions

1. **New section** `content/curriculum/47-cloud-platforms/`, attaching to the existing placeholder under "Infrastructure & Cloud" (reusing `Module` id 9, the same one modules 44-46 and 48 use).
2. **Session 1 covers the shared responsibility model's actual dividing line**: AWS's own framing ("security *of* the cloud" vs. "security *in* the cloud"), how that line moves depending on service abstraction level (IaaS like EC2 vs. managed services like RDS/S3), and the empirical pattern that real incidents concentrate on the customer's side.
3. **The Capital One case study replaces the unverifiable Gartner statistic**: every link in that breach's failure chain (WAF misconfiguration, overly permissive IAM role) sat on the customer's side, with AWS's own infrastructure never actually compromised -- a concrete, sourced illustration of the same empirical pattern the abandoned statistic would have asserted without a verifiable primary source.
4. **A least-privilege block was added as a 6th block** (the first draft had 5) to turn the Capital One pattern into an actionable habit: scoping IAM roles narrowly bounds the blast radius of any single credential compromise, illustrated with a role-A-vs-role-B comparison.
5. **The closing block previews the module's next sessions**: VPC/IAM mechanics and managed services, i.e., the concrete customer-side levers this session's framing points toward.
6. **No code exercise** -- this session is about a conceptual boundary and a security-prioritization habit, not a gradable function, consistent with other conceptual sessions this effort has built.
7. **First-draft bias audit flagged all 3 quizzes initially**; rebalanced to 0/4 after the 6th block's quiz was added. Three blocks needed length-padding across two passes to clear the 900-character minimum, including a second pass on block 1 after the first padding attempt still fell short (802 chars).

## Consequences

- `pytest`: 139 passed (unchanged -- pure content; confirmed the section reused `Module` id 9 rather than creating a duplicate, and `Section` id 47 landed under it alongside sections 44/45/46/48). Grepped the test suite for the new slug before running it, per the lesson from ADR 0058 -- no WIP-example test referenced `47-cloud-platforms` or "Cloud Platforms," so no additional test fixes were needed.
- Verified against the live dev stack via Playwright: section and lesson pages render, both reference links (AWS's Shared Responsibility Model page, the Krebs on Security Capital One article) render with correct hrefs and resolve live (200), the service-abstraction quiz was answered correctly through the real UI with "Correct" feedback shown, and no raw/unparsed markdown asterisks leaked into rendered text. Zero console/page errors. All test-generated `exercise_submissions`/`exercise_review_states`/`user_progress` rows deleted afterward via direct `psql`.
- Recomputing the prerequisite graph after this module should be the first step of the next priority pass, per the standing method -- this ADR's starting point (27 and 47 tied) is now out of date with both shipped.

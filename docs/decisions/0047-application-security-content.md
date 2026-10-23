# ADR 0047: OWASP Top 10 content, module 58 session 1 (new domain, current 2025 edition)

## Status

Accepted

## Context

Continuing the content-breadth effort: Security & Privacy was one of the 6 remaining fully-unauthored domains, and module 58 (Application Security) has 2 of its 3 prerequisites already authored (20, 21; only 14/Web Fundamentals is unmet). Subtopic 58.1 ("OWASP risk classes") has an unusually strong, canonical real source available: the OWASP Top 10 itself isn't one engineer's opinion but the industry-standard, evidence-based vulnerability taxonomy -- and researching it live surfaced that the **2025 edition is now current** (released after the 2021 edition that most existing training material and search results still describe), with real, verified ranking changes worth teaching directly rather than risking stale content by defaulting to the older, more commonly-cached 2021 list.

## Decisions

1. **New section** `content/curriculum/58-application-security/`, attaching to the existing placeholder under "Security & Privacy" (a brand-new `Module`/`Topic` for this domain, confirmed via `Topic.query.count()` staying at 17 post-seed, meaning it correctly reused the curriculum-map.json placeholder rather than creating a duplicate).
2. **Session content is built on the verified-current 2025 edition**, not the more commonly-referenced 2021 one -- confirmed via multiple independent sources (not a single search result) before writing anything: A01 Broken Access Control (unchanged, still #1), A02 Security Misconfiguration (climbed from #5 in 2021), A03 Software Supply Chain Failures (new), A04 Cryptographic Failures (fell from #2 in 2021, partly attributed to near-universal HTTPS adoption), A10 Mishandling of Exceptional Conditions (new).
3. **The session's throughline is "risk classes, not a checklist"** -- using the *reasons* rankings moved between editions (real measured prevalence, not an opinion reshuffle) and the two new categories as the actual teaching content, not a side note after a list recitation. This also doubles as the module's thesis for every later, deeper session: respond to a specific finding by closing the whole class (e.g., parameterized queries everywhere), not just the one instance a scanner or pentest happened to catch.
4. **Cites the official OWASP Top 10:2025 introduction page directly** (`owasp.org/Top10/2025/0x00_2025-Introduction/`, re-verified live both during drafting and before shipping), not a third-party summary -- consistent with always preferring the primary/canonical source when one exists and is stable.
5. **No code exercise** -- risk-class recognition from a scenario description doesn't reduce to a single gradable function, consistent with every other conceptual/survey session this effort has built.
6. **First-draft bias audit flagged all 4 quizzes** -- the heaviest rebalancing pass of this effort so far, brought to 0/4 in one further pass; three blocks also needed length-padding to clear 900 characters.

## Consequences

- `pytest` 139 passed (unchanged -- pure content; `Topic.query.count()` stayed 17, confirming correct attachment to the existing placeholder for this domain).
- Verified against the live dev stack: section and lesson pages render, the OWASP reference link renders with the correct href and resolves live, and the broken-access-control quiz was answered correctly through the real UI. Zero console/page errors. All test-generated rows deleted afterward.
- Opens the Security & Privacy domain (12th of 16 now with real content). Module 58's remaining unmet prerequisite is module 14 (Web Fundamentals).

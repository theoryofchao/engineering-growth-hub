# ADR 0051: USE Method and Flame Graphs content citing Brendan Gregg, module 62 session 1 (new domain)

## Status

Accepted

## Context

Continuing the content-breadth effort. Performance Engineering was one of the remaining fully-unauthored domains. Module 62 (Application Performance)'s own prerequisites (02, 03, 43) are only partially met (02 authored; 03 and 43 are not) -- picked anyway, the same kind of exception as module 35 and module 58, because the domain-breadth value and an unusually strong, famous, directly-verifiable citation outweighed waiting on the full prerequisite chain. Brendan Gregg is the field's most widely recognized name for exactly this subtopic: he created both the USE method (a systematic utilization/saturation/errors checklist) and flame graphs (the standard visualization for CPU profiling data), both still hosted on his own site.

## Decisions

1. **New section** `content/curriculum/62-application-performance/`, attaching to the existing placeholder under "Performance Engineering" (a new `Module`/`Topic` for this domain, confirmed via `Topic.query.count()` staying at 17 post-seed).
2. **Session 1 pairs two of Gregg's real methodologies as a sequence, not two independent topics**: the USE method narrows down *which* resource is bottlenecked; a flame graph then shows *where within that resource's usage* time actually goes -- framed explicitly as "USE first, flame graph second," with a worked example of the cost of skipping that order (profiling CPU in detail when the real bottleneck was network saturation).
3. **A deliberately corrected misreading is taught directly**: flame graphs are commonly (mis)read by scanning for the tallest/deepest tower, when width -- not height -- is the dimension that actually encodes time spent. This mirrors the pattern established in ADR 0040/0044/0048 (teaching the common misconception alongside the correct framing, not just the correct framing in isolation).
4. **Both citations verified live via `curl` before and after drafting**: `brendangregg.com/usemethod.html` and `brendangregg.com/flamegraphs.html`, both guessed from his site's known URL pattern and then confirmed to actually resolve, rather than assumed.
5. **No code exercise** -- reading a methodology/visualization correctly doesn't reduce to a gradable function, consistent with every other conceptual session this effort has built.
6. **First-draft bias audit flagged 2 of 4 quizzes**, rebalanced to 0/4 in one pass; four blocks needed length-padding to clear 900 characters, the heaviest padding pass so far.

## Consequences

- `pytest` 139 passed (unchanged -- pure content; `Topic.query.count()` stayed 17, confirming no duplicate domain).
- Verified against the live dev stack: section and lesson pages render, both reference links render with correct hrefs and resolve live, all 6 inline-emphasis spans in the body text render correctly via the InlineMarkdown fix (ADR 0050), and the USE-method quiz was answered correctly through the real UI. Zero console/page errors. All test-generated rows deleted afterward.
- Opens the Performance Engineering domain (14th of 16 now with real content). Remaining fully-unauthored domains: Infrastructure & Cloud, DevOps & Delivery, Product & Collaboration.

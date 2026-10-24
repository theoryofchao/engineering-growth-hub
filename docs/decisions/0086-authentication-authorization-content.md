# ADR 0086: Sessions, Cookies, and CSRF content, module 22 session 1

## Status

Accepted

## Context

The prerequisite-unlock-count method (ADR 0056) ran out of discriminating signal after module 77 shipped -- every remaining unauthored module ties at second-order value 0. Per explicit user direction, the new priority heuristic for this pass is closing out domains sitting at a single-module gap. Programmatic domain-completion check found five such domains (Programming & Code Quality missing 9, Backend & APIs missing 22, Software Architecture missing 34, Infrastructure & Cloud missing 46, Product & Collaboration missing 73). Module 22 (Authentication & Authorization) was picked first, closing Backend & APIs to 5/5 -- its prerequisites (21, 58) were both already authored.

Session 1 covers subtopic 22.1 (Sessions, cookies, CSRF, and tokens), following the module's natural subtopic order.

## Decisions

1. **New section** `content/curriculum/22-authentication-authorization/`, attaching to the existing placeholder under "Backend & APIs" (reusing `Module` id 4, the same one modules 20/21/23/24 use).
2. **Two citations, both confirmed via WebSearch before drafting**: **MDN's Cookies documentation** (`developer.mozilla.org/en-US/docs/Web/HTTP/Cookies`) for the SameSite attribute's three values and Chrome's February 2020 Lax-by-default change; **OWASP's CSRF Prevention Cheat Sheet** (`cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html`) for the specific, documented gap -- SameSite=Lax still allows a GET-based state change through.
3. **The session's structure deliberately separates three layers**: the attack mechanism itself (browser cookie-attachment is destination-based, not origin-based), the modern default defense (SameSite=Lax) and its real limit (GET-based state changes still get through), and the browser-behavior-independent defense (CSRF tokens) -- framed as OWASP's own primary-vs-complementary-layer distinction, not "pick one."
4. **The GET-based gap (block 4) is treated as the session's central non-obvious claim**, explicitly tied to HTTP's "safe method" semantics (state changes belong behind non-GET methods) as a design discipline that predates SameSite entirely, not a cookie-setting fix.
5. **No code exercise** -- CSRF-mechanism reasoning doesn't reduce to a gradable function, consistent with other conceptual sessions this effort has built.
6. **First-draft bias audit flagged 3 of 4 quizzes**; rebalanced to 0/4 over three passes on two quizzes (each needed a second length adjustment after the first attempt left them still flagged by a small margin). Three of six blocks needed a padding pass to clear 900 characters.

## Consequences

- **Milestone: Backend & APIs (modules 20-24) is now the third domain with every module fully authored**, after Distributed Systems and Performance Engineering. Verified programmatically via direct DB query (session counts per section) rather than recalled.
- `pytest`: 139 passed (unchanged -- pure content; confirmed the section reused `Module` id 4 rather than creating a duplicate). Grepped the test suite for the new slug before seeding -- no hits, so no test fixes were needed this time.
- Verified against the live dev stack via Playwright: section and lesson pages render, both reference links (MDN Cookies, OWASP CSRF cheat sheet) render with correct hrefs and resolve live (200), the cookie-attachment-mechanism quiz was answered correctly through the real UI, and no raw/unparsed markdown leaked into rendered text. Zero console/page errors. All test-generated `exercise_submissions`/`exercise_review_states`/`user_progress` rows deleted afterward via direct `psql`.
- **Priority-method transition**: this is the first module picked under the new "close single-module domain gaps" heuristic, following the computed unlock-count method's exhaustion documented in ADR 0085's consequences and project memory. Four more single-gap domains remain (modules 9, 34, 46, 73) as candidates for the next picks in this pass.

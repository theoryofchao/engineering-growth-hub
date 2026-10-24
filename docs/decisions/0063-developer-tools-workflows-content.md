# ADR 0063: Git Internals content, module 12 session 1

## Status

Accepted

## Context

Continuing the computed prioritization plan (ADR 0056-0062). Recomputing the prerequisite graph after module 4 shipped surfaced module 12 (Developer Tools & Workflows) as the clear leader for the first time since this method started -- second-order unlock value 2, ahead of every other candidate's value of 1. Its only prerequisite (module 8) was already authored.

Session 1 covers subtopic 12.1 (Git internals, branching, rebasing, bisect), following the module's natural subtopic order. This subtopic also has an unusually strong continuity opportunity: `git bisect` is literally binary search applied to commit history, letting the session explicitly tie back to module 02 (Algorithms & Problem Solving), already shipped.

## Decisions

1. **New section** `content/curriculum/12-developer-tools-workflows/`, attaching to the existing placeholder under "Programming & Code Quality" (reusing `Module` id 2, the same one modules 8/9/10/11/13 use).
2. **Session 1 covers git's content-addressable object model as the root explanation** for three behaviors engineers encounter directly: branches being near-free (a branch is just a pointer to a commit hash), rebase producing new commit hashes even for byte-identical content (a commit's hash includes its parent's), and `git bisect`'s efficiency (binary search over commit history, explicitly tied back to module 02's binary-search content).
3. **Citations: the official Pro Git book's Git Internals chapter** (`git-scm.com/book/en/v2/Git-Internals-Git-Objects`) for the object-model framing, and **git's own official `git-bisect` documentation** (`git-scm.com/docs/git-bisect`) for the automated `bisect run` detail -- both official/primary sources rather than a third-party blog.
4. **A worked scenario (block 5) ties bisect to commit granularity**: bisect's precision is bounded by how finely commits are split, making the case for small, focused commits as a practical consequence of the mechanism, not just a style preference.
5. **No code exercise** -- git's object model and workflow reasoning don't reduce to a gradable function, consistent with other conceptual sessions this effort has built.
6. **First-draft bias audit flagged 1 of 4 quizzes**; rebalanced to 0/4. Four of six blocks needed length-padding to clear 900 characters, the most blocks needing padding of any session so far this pass.

## Consequences

- `pytest`: 139 passed (unchanged -- pure content; confirmed the section reused `Module` id 2 rather than creating a duplicate). Grepped the test suite for the new slug before seeding -- no hits, so no test fixes were needed this time, unlike module 4's round.
- Verified against the live dev stack via Playwright: section and lesson pages render, both reference links (Pro Git's Git Internals chapter, git's own bisect documentation) render with correct hrefs and resolve live (200), the branch-pointer quiz was answered correctly through the real UI with "Correct" feedback shown, and no raw/unparsed markdown leaked into rendered text. Zero console/page errors. All test-generated `exercise_submissions`/`exercise_review_states`/`user_progress` rows deleted afterward via direct `psql`.
- Recomputing the prerequisite graph after this module should be the first step of the next priority pass, per the standing method -- this ADR's starting point (12 leading at value 2) is now out of date with 12 shipped.

# ADR 0034: Rubric-based self-assessment for STAR stories

## Status

Accepted

## Context

ADR 0024 §6 deferred "rubric-based self-assessment/scoring" for leadership stories without further detail. With ADR 0033 (behavioral-question decision tree) shipped, this was the one remaining Milestone 3 item. Two design points confirmed with the user up front:
- The rubric scores a story on **several fixed dimensions** (not a single overall rating), so it tells you *what* to fix, not just *whether* to.
- A **cross-story "needs work" summary** exists on the leadership home page, not just a score shown on each story's own page.

## Decisions

1. **Five fixed rubric dimensions**, hardcoded as a Python constant (`leadership_service.RUBRIC_DIMENSIONS`) rather than a configurable/authorable taxonomy — same posture as `BREAK_MINUTES`/`PROGRESS_STATUS_RANK` elsewhere in this codebase: Clarity, Specificity of Action, Quantified Result, Relevance to Competency, Reflection & Growth. Exposed read-only via `GET /api/v1/leadership/rubric-dimensions` so the frontend doesn't duplicate the labels/descriptions.
2. **`LeadershipStory.rubric_scores`**, a JSON column (`{dimension_key: 1-5}`), mirroring the `examples`/`reference_links` JSON-column shape already used elsewhere — not a separate per-dimension table, since there's no need to track score history over time. A dimension's *absence* from the dict means "not yet scored," not a zero.
3. **`overall_score` is computed, never stored** — `None` until *every* dimension has been scored, then the average, rounded to 1 decimal. A partial average would make a half-reviewed story look falsely weak or strong; requiring full coverage keeps "unscored" and "scored-and-weak" distinguishable.
4. **Scored through the existing `PATCH /stories/<id>` endpoint**, not a new one — `rubric_scores` was just added to that route's allowed-fields filter and to `leadership_service._validate_fields`'s dispatch (new `_validate_rubric_scores`: rejects unknown dimension keys and non-1-to-5 values). `create_story` also accepts an optional `rubric_scores` for symmetry, though in practice scoring happens after writing, via the edit form.
5. **The rubric section only renders in `StoryForm`'s edit mode**, not create mode — you can't meaningfully self-assess a story before it exists. Each dimension is a `<select>` of 1-5 plus a "Not yet scored" option that removes the key entirely (not a 0) when chosen, keeping the "absent = unscored" contract intact client-side too.
6. **"Needs work" on the leadership home page splits into two groups, not one sorted list**: low-scoring stories (rated, below a `4`-of-5 threshold, sorted ascending) first, then unscored stories after. An unscored story isn't necessarily worse than a rated one, so merging them by a single sort key (e.g. treating "unscored" as the lowest possible score) would misrepresent stories nobody's reviewed yet as the weakest ones.
7. **A real `undefined`-vs-`null` bug was caught by the test suite, not by inspection**: both `story-form.tsx` and `leadership-home.tsx` initially checked `overall_score !== null` to decide whether to render a score, calling `.toFixed()` on the result. Existing test fixtures (pre-dating this feature) simply didn't include the field, making it `undefined` — which passes a `!== null` check and then crashes on `.toFixed()`. Fixed by switching every such check to `typeof overall_score === "number"`, which safely handles `undefined` and `null` alike; fixtures were also updated to include the field explicitly so this doesn't silently regress.

## Consequences

- Backend: `pytest` 119 passed (112 before this slice + 7 new), covering the fixed dimension list, `overall_score` staying `None` until fully scored vs. correctly averaging once it is, and rejecting an unknown dimension key or an out-of-range value.
- Frontend: `vitest run` 199 passed (192 before this slice + 7 new, across `story-form.test.tsx` and `leadership-home.test.tsx`), covering the rubric section's edit-only visibility, submitting scores in the PATCH payload, the overall-score display, and the "Needs work" grouping/sorting/threshold behavior.
- Verified against the live dev stack with a real browser (Playwright): created a real story, scored all 5 dimensions via the actual form, confirmed the resulting 3.0/5 overall score appeared both on the story's own page and as a badge on the leadership home page, and confirmed it correctly appeared under "Needs work" (below the 4.0 threshold). Zero console/page errors. Test story deleted afterward.
- `tsc --noEmit`, `eslint`, `prettier --check` all clean.
- This closes out Milestone 3 (`docs/ROADMAP.md`) — competency catalog, STAR story CRUD, the behavioral-question decision tree, and rubric-based self-assessment are all now built.

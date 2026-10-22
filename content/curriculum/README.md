# Curriculum content

Seed data (topics, modules, sections, learning sessions, exercises) imported by `apps/api/app/seed.py` rather than hard-coded into application code, per `docs/ARCHITECTURE.md` and `docs/ROADMAP.md`.

Naming (see `docs/decisions/0027-topic-section-module-rename-and-routing.md`): a **topic** is a top-level area like "Computer Science Foundations" or "Programming & Code Quality"; a **section** is the thing a learner actually opens under a topic, e.g. "AI-Assisted Software Development" — this is CURRICULUM.md's own "module" granularity. `Module` is a separate, currently-unexposed internal grouping layer between the two; don't confuse it with CURRICULUM.md's "module" vocabulary, which maps to `Section` here.

## File layout

Each section is a directory named after its slug, not a single file — this is what keeps a section's content from growing into one unbounded JSON file as it gains sessions (see `docs/decisions/0014-per-session-content-files.md`):

```
content/curriculum/
  curriculum-map.json                 # the full 80-module breadth map (metadata only, no lesson content)
  <section-slug>/
    section.json                      # {topic, module, section} metadata for this one section
    01-<short-session-slug>.json      # one learning session: {title, sequence, ..., content_blocks: [...]}
    02-<short-session-slug>.json
    ...
```

`seed_all()` iterates every directory under `content/curriculum/` and loads `section.json` plus every other `*.json` file in it as one session each — a new section just needs its own directory, no registration list to edit. The leading `NN-` in a session filename is for human navigation only; the session's own `sequence` field inside the file is what actually controls ordering. The loader is idempotent and upserts by `(section.slug)` / `(learning_session.sequence)` / `(content_block.sequence)`, so re-running `flask seed` after editing a file updates existing rows in place.

## Authoring a learning session: sizing rule

This is the standing authoring target for any new session file, derived from measuring the existing corpus and first established by `docs/decisions/0009-content-depth-and-exercise-quality.md`, then reaffirmed sizing a new session in `docs/decisions/0012-claude-code-native-toolkit-lesson.md` and formalized as a going-forward rule in `docs/decisions/0013-content-sizing-rule.md`.

- **Blocks per session:** 6–7 `content_blocks`. Each block is one slide — split prose into blocks yourself; the loader does not auto-chunk text.
- **Block body length:** ~900–1800 characters (~140–300 words). Short enough to read in one sitting without scrolling the slide view, long enough to carry one real idea with a concrete example (a code/config snippet, a worked scenario, a named source) rather than restating a claim in more words.
- **Exercises per block:** most teaching blocks get 1 `multiple_choice` exercise pinned to that block (nest it inside the block's own `exercises` array, not the session-level one — session-level `exercises` is legacy, kept only for the 2 lessons seeded before per-block pinning existed). A block covering two distinct ideas can carry 2. The session's opening (context-setting) and closing ("bottom line" / "practical takeaway") blocks normally carry none.
- **Worked examples:** a block may carry an `examples` array (`[{"label": ..., "content": ...}]`), rendered as a collapsed accordion under the body — see `docs/decisions/0026-content-block-examples-accordion.md`. Use this instead of embedding a fenced code block directly in `body`: body text renders as plain prose (no Markdown parsing), so backticks/fences in `body` show up literally. A longer code/config sample belongs in `examples`, not stretched into the body's own character budget.
- **Reference links:** a block may carry a `reference_links` array (`[{"label": ..., "url": ...}]`) of external further-reading/citation links, rendered as a plain list under the body — see `docs/decisions/0032-content-block-reference-links.md`. Author-provided, like `examples`, not learner-generated like notes. Only link to something you've actually verified exists and is stable (official docs, specs, a named source) — don't guess a URL.
- **Exercise quality bar:** 4 options, a `definition.explanation` of 1–3 substantive sentences (not just "correct"), and option lengths that don't tip off the answer — audit this programmatically before shipping new exercises:

  ```python
  import json
  session = json.load(open("content/curriculum/<section-slug>/<NN-session-slug>.json"))
  for block in session["content_blocks"]:
      for ex in block.get("exercises", []):
          opts = ex["definition"]["options"]
          ci = ex["definition"]["correct_index"]
          lens = [len(o) for o in opts]
          if lens[ci] == max(lens) and lens.count(max(lens)) == 1:
              print("FLAG (uniquely longest):", ex["prompt"][:60])
  ```

  Target: well under 25% of a session's exercises flagged (the un-audited baseline for 4 options is ~25% by chance; ADR 0009 found a real, unintentional 80% rate before this became a standard check). Display-order shuffling happens at runtime in `ExerciseQuiz`, so don't manually rotate `correct_index` to compensate.
- **A session is ~25 minutes of reading + interaction** (the `duration_minutes` field is check-constrained to `25` or `50` — use `50` only for labs/longer exercises, matching `docs/PRODUCT.md`'s Pomodoro sizing). 6–7 blocks at the length above is what actually fits that budget; don't stretch a thinner section to hit the block count, and don't cram extra ideas into one oversized block to avoid adding another one — split into a second session instead.

Before seeding new content, validate it's well-formed JSON and re-run `apps/api/tests/test_seed.py` / `test_learning_sessions.py` — both hardcode a session count per section that a new session will need bumping (see ADR 0011/0012 for the pattern).

## Authoring a code exercise

A `type: "code"` exercise (Monaco editor, in-browser JS execution) is graded by the server comparing submitted *output values* to a stored answer key — the same trust model as `multiple_choice`'s `selected_index`/`correct_index`, generalized to N test cases. See `docs/decisions/0028-code-exercises-client-side-sandbox.md` for why. That trust model only works if grading stays a single equality check per case, which puts two constraints on how a code exercise's problem statement and test cases are written:

- **Canonical output required.** If a problem has multiple validly-shaped answers (e.g. "the two indices," which could be reported in either order), the prompt must pin down one agreed form — "return indices in ascending order" — and every test case's `expected_output` must match that form. No order-insensitive or fuzzy comparison is done.
- **Return the full graded result — don't rely on in-place-mutation-only grading.** A problem like "remove duplicates in place" normally returns just a new length and expects the judge to separately inspect the mutated array; here, the function must return the result that fully determines correctness on its own (e.g. the deduplicated array itself), since grading only ever looks at the one returned value.

`definition` shape:

```json
{
  "language": "javascript",
  "function_name": "reverseInPlace",
  "starter_code": "function reverseInPlace(nums) {\n  // your code here\n}",
  "timeout_ms": 2000,
  "visible_test_cases": [
    { "input": [[1, 2, 3]], "expected_output": [3, 2, 1] }
  ],
  "hidden_test_cases": [
    { "input": [[5]], "expected_output": [5] }
  ]
}
```

`input` is always a list of positional arguments, spread into the call (`fn(...input)`) — this stays generic across arities without a separate schema per problem. `visible_test_cases` are shown to the learner (with their expected output, so Run gives real feedback while coding); `hidden_test_cases`' inputs are sent to the client too (the Worker has to run them to grade on Submit), but their `expected_output` never leaves the server until after a submission is scored.

- **Minimum hidden cases:** at least 2, covering at least one edge case (empty input, a single element, duplicates — whatever's relevant to the problem).
- **Default `timeout_ms`:** 2000. Only raise it for a problem that's legitimately compute-heavier, not to paper over an inefficient reference solution.
- **One exercise per block.** A code exercise's Monaco editor + Run/Submit footprint is heavier than a quiz's; don't stack a quiz on top of a code exercise in the same block the way a block can otherwise carry two `multiple_choice` exercises.

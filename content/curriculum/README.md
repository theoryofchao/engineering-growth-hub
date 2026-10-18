# Curriculum content

Seed data (domains, modules, topics, learning sessions, exercises) imported by `apps/api/app/seed.py` rather than hard-coded into application code, per `docs/ARCHITECTURE.md` and `docs/ROADMAP.md`.

## File layout

Each topic is a directory named after its slug, not a single file — this is what keeps a topic's content from growing into one unbounded JSON file as it gains sessions (see `docs/decisions/0014-per-session-content-files.md`):

```
content/curriculum/
  curriculum-map.json                 # the full 80-module breadth map (metadata only, no lesson content)
  <topic-slug>/
    topic.json                        # {domain, module, topic} metadata for this one topic
    01-<short-session-slug>.json      # one learning session: {title, sequence, ..., content_blocks: [...]}
    02-<short-session-slug>.json
    ...
```

`seed_all()` iterates every directory under `content/curriculum/` and loads `topic.json` plus every other `*.json` file in it as one session each — a new topic just needs its own directory, no registration list to edit. The leading `NN-` in a session filename is for human navigation only; the session's own `sequence` field inside the file is what actually controls ordering. The loader is idempotent and upserts by `(topic.slug)` / `(learning_session.sequence)` / `(content_block.sequence)`, so re-running `flask seed` after editing a file updates existing rows in place.

## Authoring a learning session: sizing rule

This is the standing authoring target for any new session file, derived from measuring the existing corpus and first established by `docs/decisions/0009-content-depth-and-exercise-quality.md`, then reaffirmed sizing a new session in `docs/decisions/0012-claude-code-native-toolkit-lesson.md` and formalized as a going-forward rule in `docs/decisions/0013-content-sizing-rule.md`.

- **Blocks per session:** 6–7 `content_blocks`. Each block is one slide — split prose into blocks yourself; the loader does not auto-chunk text.
- **Block body length:** ~900–1800 characters (~140–300 words). Short enough to read in one sitting without scrolling the slide view, long enough to carry one real idea with a concrete example (a code/config snippet, a worked scenario, a named source) rather than restating a claim in more words.
- **Exercises per block:** most teaching blocks get 1 `multiple_choice` exercise pinned to that block (nest it inside the block's own `exercises` array, not the session-level one — session-level `exercises` is legacy, kept only for the 2 lessons seeded before per-block pinning existed). A block covering two distinct ideas can carry 2. The session's opening (context-setting) and closing ("bottom line" / "practical takeaway") blocks normally carry none.
- **Exercise quality bar:** 4 options, a `definition.explanation` of 1–3 substantive sentences (not just "correct"), and option lengths that don't tip off the answer — audit this programmatically before shipping new exercises:

  ```python
  import json
  session = json.load(open("content/curriculum/<topic-slug>/<NN-session-slug>.json"))
  for block in session["content_blocks"]:
      for ex in block.get("exercises", []):
          opts = ex["definition"]["options"]
          ci = ex["definition"]["correct_index"]
          lens = [len(o) for o in opts]
          if lens[ci] == max(lens) and lens.count(max(lens)) == 1:
              print("FLAG (uniquely longest):", ex["prompt"][:60])
  ```

  Target: well under 25% of a session's exercises flagged (the un-audited baseline for 4 options is ~25% by chance; ADR 0009 found a real, unintentional 80% rate before this became a standard check). Display-order shuffling happens at runtime in `ExerciseQuiz`, so don't manually rotate `correct_index` to compensate.
- **A session is ~25 minutes of reading + interaction** (the `duration_minutes` field is check-constrained to `25` or `50` — use `50` only for labs/longer exercises, matching `docs/PRODUCT.md`'s Pomodoro sizing). 6–7 blocks at the length above is what actually fits that budget; don't stretch a thinner topic to hit the block count, and don't cram extra ideas into one oversized block to avoid adding another one — split into a second session instead.

Before seeding new content, validate it's well-formed JSON and re-run `apps/api/tests/test_seed.py` / `test_learning_sessions.py` — both hardcode a session count per topic that a new session will need bumping (see ADR 0011/0012 for the pattern).

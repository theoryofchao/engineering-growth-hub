# ADR 0013: Formalize the learning-session/block sizing rule for future content

## Status
Accepted

## Context
User request, while reviewing the Claude Code lesson added in ADR 0012: turn the de facto sizing convention (established empirically by ADR 0009's content-depth pass, and matched by eye when authoring ADR 0011's and 0012's new sessions) into an explicit, documented rule, so future lesson authoring — by a person or by Claude Code — doesn't have to re-derive it by measuring the existing corpus each time. Also asked where such a rule belongs, given `CLAUDE.md`'s own stated role is a short, high-level index that points to other docs rather than holding authoring-level detail itself.

Options considered (presented to the user directly):
1. Put the full numeric rule in `CLAUDE.md`. Rejected: `CLAUDE.md` is deliberately short and points elsewhere for detail (`docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`); numeric authoring targets sit oddly next to its architectural/process rules and would drift from the actual corpus with nothing tying it back to measurement.
2. ADR only. Rejected as the sole location: captures the "why" but isn't where someone opening `content/curriculum/` to author a new lesson would look.
3. `content/curriculum/README.md` only. Rejected as the sole location: fixes that file's staleness and is maximally discoverable to content authors, but drops the rationale and leaves `CLAUDE.md`'s "Read first" list unaware the rule exists.
4. **Chosen: split across all three**, each doing the job it's already good at in this repo's existing documentation structure.

## Decisions
1. **`content/curriculum/README.md`** now carries the actual numeric rule (blocks/session, body length, exercises/block, the exercise-quality audit snippet, and the test-count-bump reminder) — the file physically next to the content it governs, and the one a content author (human or agent) opens first. It also stopped being stale (it previously said "Empty intentionally: no curriculum content has been seeded yet," despite 6 sessions of real content existing by this point).
2. **This ADR** is the durable record of *why* these specific numbers (not a different set) and why the rule lives where it does — matching this repo's existing pattern of using `docs/decisions/` for exactly this kind of "a mistake/ambiguity became a rule so it doesn't recur" decision (CLAUDE.md's own instruction: "Capture important decisions in `docs/decisions/` with brief ADRs").
3. **`CLAUDE.md`** gets one new line in its existing "Read first" list pointing at `content/curriculum/README.md`, matching the pattern already used for `docs/PRODUCT.md` / `docs/ARCHITECTURE.md` / `docs/ROADMAP.md` — a pointer, not the rule itself, keeping `CLAUDE.md` from growing a second, divergence-prone copy of the numbers.
4. **No change to the numbers themselves.** The rule formalizes what ADR 0009 already established empirically (6–7 blocks/session, ~900–1800 chars per block, 1–2 exercises on non-wrap-up blocks, programmatic option-length audit) rather than inventing a new target — ADR 0012's session was already sized to this before the rule existed in writing, so nothing needs re-authoring to comply.

## Consequences
- No code, schema, or test changes — this is documentation-only.
- Future lesson content (this module or any other topic file under `content/curriculum/`) has one canonical place to check sizing (`content/curriculum/README.md`) and one canonical place explaining why (this ADR), instead of requiring a fresh measurement of the existing JSON each time, as ADR 0012's own research step had to do.
- If the sizing target ever changes deliberately (e.g. a product decision to make sessions denser or lighter), that's a new ADR superseding this one, updating `content/curriculum/README.md` to match — the same pattern this ADR itself follows from ADR 0009.

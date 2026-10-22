# ADR 0032: External reference links on content blocks

## Status

Accepted

## Context

Roadmap milestone 2 lists "reference links" alongside notes/examples/exercise authoring as a curriculum-browsing feature, but no model/field for it existed — `ContentBlock.examples` covers worked code/config examples (ADR 0026) and `Note` covers a learner's own free text (ADR 0008), but neither fits an author-provided citation or further-reading link. Asked the user which of several possible next roadmap items to pick up; this was the smallest, most scoped choice among reference links / leadership rubrics / scenario decision-trees / multi-session projects.

## Decisions

1. **New `reference_links` JSON column on `ContentBlock`**, not a separate table — same shape and reasoning as `examples` (ADR 0026 decision 1): a list of `{label, url}` objects, `db.Column(db.JSON, nullable=False, default=list)`, migration `015ea01490d7`. Reference links are author-provided content edited in the seed JSON alongside `heading`/`body`/`examples`, not learner-generated data like `Note` — there's no user-facing add/edit UI for them, matching how `examples` works.
2. **Seed loader (`seed.py`) reads `block_data.get("reference_links", [])`** on both the insert and update branches, identical to how `examples` is read — same optional-with-empty-default contract.
3. **New `ReferenceLink` Pydantic schema** (`{label: str, url: str}`) and a `reference_links: list[ReferenceLink] = []` field added to `ContentBlockDetail`, serialized in `learning_sessions.py`'s `_serialize` the same way `examples` already is.
4. **New `ReferenceLinks` frontend component** (`reference-links.tsx`), rendered directly under `ExampleAccordion` in both page view and slide view of `ContentBlocks` — a plain list of links (`target="_blank" rel="noopener noreferrer"`), not collapsed like the examples accordion, since a short labeled link doesn't compete for the slide's space the way a long worked example does.
5. **No real curriculum content was added in this slice.** Unlike ADR 0026 (which had a specific user-requested slide to fix), this was a general "build the mechanism" task with no requested content edit, and the user instructions explicitly warn against guessing URLs — fabricating a plausible-looking external link (e.g. an MDN page) without verifying it actually exists and is stable would be worse than shipping no example at all. `content/curriculum/README.md` documents the field and explicitly tells future authors to verify a URL before adding it, rather than guessing.

## Consequences

- Backend: `pytest` 98 passed (96 before this slice + 2 new) — one confirming every seeded block still defaults `reference_links` to `[]` (no real content uses the field yet), one confirming a block's `reference_links` round-trip correctly through `GET /api/v1/learning-sessions/<id>`. `tsc`/`eslint` N/A here; no backend lint issues.
- Frontend: `vitest run` 183 passed (181 before this slice + 2 new, in `reference-links.test.tsx`). `tsc --noEmit`, `eslint`, `prettier --check` all clean.
- Verified against the live dev stack (real Postgres) with a real browser (Playwright): a reference link set directly in the database (not seeded content — a throwaway DB write for verification only, reverted afterward) rendered correctly as a new-tab-opening link in both page view and slide view. Zero console/page errors.
- Not done: no real curriculum content uses `reference_links` yet — the first author to add one should follow the README's "verify the URL first" guidance rather than treat this ADR's test fixture (`https://example.com/test-ref`) as a real citation.

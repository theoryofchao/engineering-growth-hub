# ADR 0050: Inline Markdown rendering for content-block body text, plus a bolded-takeaway trial

## Status

Accepted

## Context

The user asked for ideas to make lesson content more approachable given a short attention span for long/wordy text, having already split content into blocks/slides. The agreed-on next lever was leading each teaching block with a bolded one-line takeaway, trialed on one already-shipped session before deciding whether to apply it more broadly. Checking the actual render path first (`apps/web/src/components/content-blocks.tsx`) surfaced that **no Markdown rendering exists anywhere in the chain** -- `block.body` is interpolated as a raw string inside a `<p className="whitespace-pre-wrap">`, so `**bold**` would show as literal asterisks. It also surfaced that content authors have been using single-asterisk `*word*` emphasis as an informal convention across a large number of already-shipped sessions (confirmed via `grep` across `content/curriculum/`) -- all of it currently rendering as literal asterisks on the page, a real pre-existing bug unrelated to this request.

## Decisions

1. **New component `apps/web/src/components/inline-markdown.tsx`**, a small, deliberately non-extensible parser for exactly two patterns -- `**bold**` and `*italic*` -- not a general Markdown renderer (no links, lists, or headings; `whitespace-pre-wrap` on the parent already handles paragraph breaks without this component's help). Wired into both of `content-blocks.tsx`'s existing render sites (page view and slide view), replacing the raw `{block.body}` interpolation with `<InlineMarkdown text={block.body} />`.
2. **Backtick code spans are split out and protected before emphasis parsing runs**, discovered as a real bug mid-implementation: body text occasionally contains a literal multiplication `*` inside a backtick-quoted expression (e.g. `` `base_address + i * element_size` ``), and the first draft's single-pass regex read that `*` as an opening italic delimiter, then greedily matched forward to the *next* real `*` anywhere later in the text -- merging unrelated sentences into one bogus `<em>` that swallowed the real, intended `*middle*` emphasis along the way. Fixed by splitting on backtick spans first, rendering them as untouched literal text, and only running emphasis parsing on the segments outside them.
3. **This fix benefits far more than the one trial session** -- a repo-wide `grep` found the `*word*`/`*phrase*` emphasis convention already in use across roughly 15 already-shipped sessions spanning multiple modules (01, 02, 08, 10, 21, 25, 40, 58, and several `ai-assisted-software-development` sessions), all of which were rendering literal asterisks until this fix. Spot-checked three of them live (module 01 session 2, module 25, module 40) after the fix to confirm multi-word phrases (e.g. "most recently opened," "this specific codebase") render as complete, correctly-bounded `<em>` spans, not just single words.
4. **Bolded one-line takeaways were added to the 4 teaching blocks (not the opening/closing framing blocks) of module 01 session 1** as the actual trial: each states the block's core point in one bolded sentence before the existing prose, so skimming surfaces the point without reading the full paragraph, while the paragraph itself stays exactly as long as it was -- no block exceeded the 900-1800 character sizing ceiling after adding its takeaway.

## Consequences

- `vitest run` 217 passed (211 before this slice + 6 new in `inline-markdown.test.tsx`, including a regression test for the code-span/multiplication-asterisk bug). `tsc --noEmit`, `eslint`, `prettier --check` all clean on touched files.
- Backend: `pytest` 139 passed (pure content edit to one session file; no schema change).
- Verified against the live dev stack in both page and slide view: the bolded takeaway renders as real bold text (not literal asterisks) in both views, the pre-existing `*middle*`/`*same*`/`*read*`/`*which*` emphasis in the same file now renders as real italics with no bogus merged spans, and the one remaining literal `*` on the page (the multiplication inside backticked code) is exactly the one that should stay literal. Zero console/page errors.
- Mid-session the `docker compose` dev stack needed a status check after an earlier, unrelated external interruption (ADR 0049) -- confirmed still running before this verification pass, no further issue.
- This is presented to the user as a trial, not a decision to retroactively apply everywhere yet -- the ~15 other sessions using `*word*` emphasis get the rendering fix "for free" from this change regardless, but the bolded-takeaway pattern itself is only applied to this one session pending the user's reaction to it.

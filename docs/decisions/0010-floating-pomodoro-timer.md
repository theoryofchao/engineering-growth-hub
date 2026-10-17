# ADR 0010: Floating Pomodoro timer

## Status
Accepted

## Context
Lesson pages got substantially longer after ADR 0009 tripled content depth. The Pomodoro timer was embedded inline near the top of the page, so checking remaining time or pausing meant scrolling back up — exactly what a focus timer shouldn't require. User asked for it to float so it stays visible while working through a lesson.

## Decisions

1. **Fixed-position floating widget, not `position: sticky`.** Sticky positioning only pins an element once you've scrolled past its natural position and depends on the nearest scrolling ancestor's geometry — more moving parts than needed here. A plain `fixed` element pinned to the viewport (bottom-right on desktop, full-width-ish bar at the bottom on small screens via `inset-x-4` without the `sm:` override) is simpler to reason about and guarantees visibility regardless of scroll position or page length.

2. **Single `FloatingWidget` wrapper, all five phases pass through it.** The component already branched into five return statements (loading/error/idle/running/completed); rather than repeating fixed-position classes in each, extracted one wrapper and kept each phase's existing `role` (`status`/`alert`) on an inner element. No behavioral change to any phase, purely a layout wrapper.

3. **z-40, one level below the notes modal's z-50.** When the notes panel (ADR 0008) is open, its backdrop covers the floating timer along with the rest of the page — intentional, not a conflict: there's no reason to keep the timer visible over a focused note-taking view, and picking a lower z-index means I didn't have to add any explicit coordination between the two components.

## Consequences
- Vitest: 58 tests pass (one new test asserting the rendered root carries the `fixed` class, i.e. the widget actually floats rather than rendering inline).
- `tsc`, ESLint, `next build` all clean. No backend change — this is a pure CSS/layout change to an existing component, same props, same API calls.
- Verified against the live stack with Playwright: confirmed the timer is still visible and in-viewport-bounds after scrolling to the bottom of a long lesson, confirmed a running timer (with Pause/Finish controls) stays visible under the same scroll, and confirmed the notes modal cleanly layers above it without any visual conflict. Zero console errors; screenshots taken for both the idle-at-bottom and running-at-bottom states.

## Revision (same day, after user tested it live)
Decision #3's "z-40 under the modal's z-50 is fine" reasoning was incomplete: it only considered *visibility*, not *position*. The notes panel is a full-height flyout anchored to the right (`NotesPanel`, ADR 0008), and the timer was *also* anchored to the right (bottom-right) — so whenever notes were open, the opaque panel sat directly on top of the timer, not just dimmed behind a translucent backdrop like the rest of the page. User reported exactly this: "covered up by the add notes modal on the right."

Fix: moved the widget's anchor from bottom-right to **bottom-left** (`sm:right-4` → `sm:left-4`). The notes panel only ever occupies the right side of the screen, so the left is permanently conflict-free — no cross-component "is the modal open" coordination needed, just picking a corner the modal structurally can't reach. Verified with Playwright: computed bounding boxes for the timer and the open dialog and confirmed zero overlap; the timer remains legible (dimmed consistently with the rest of the background, same as any element behind the modal's translucent backdrop — expected modal behavior, not a defect). Clicking the timer's own buttons while the modal has focus is still blocked by the backdrop, which is correct, standard modal behavior (the same reason the backdrop exists at all) and not something this fix changed or should change.

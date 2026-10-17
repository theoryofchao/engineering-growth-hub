# ADR 0007: Navigation between a topic's multiple lessons

## Status
Accepted

## Context
After ADR 0006 added a 3rd and 4th learning session to the `AI-Assisted Software Development` topic, the user couldn't find the new content from the app. Diagnosis: the homepage only ever links to a topic's *first* learning session (`TopicListItem.first_learning_session_id`), and nothing in the lesson page itself links to that topic's other lessons. This was a latent gap in the original design (ADR 0002) that only became visible once a topic actually had more than one or two lessons.

## Decisions

1. **`LearningSessionDetail` gained a `topic_sessions` field** — every learning session in the current one's topic (including itself), ordered by sequence. Populated from the existing `Topic.learning_sessions` relationship (already ordered), so no new query or migration was needed — purely an additive response field.

2. **A `TopicLessonNav` component on the lesson page**, not a separate "topic overview" route. Shows the full ordered lesson list (current lesson as plain text, others as links) plus quick prev/next links. Chose this over a dedicated `/topics/<slug>` browsing page because the immediate problem was "I'm already on a lesson and can't get to the others" — solving that doesn't require a new route, and a fuller topic-browsing page is still open Milestone 2 scope ("nested curriculum browsing beyond the homepage's flat domain list").

3. **Hidden when there's only one lesson** (`sessions.length <= 1` returns `null`) — this nav would be dead weight for every other topic in the curriculum right now, since only this one has more than 2 lessons.

4. **Verified navigation with Playwright, not just the static response shape.** Clicking a nav link in a real browser initially looked broken — `page.locator("h1")` found two elements after navigating. Checked `isVisible()` on each before concluding anything: the new page's `<h1>` was visible, the old one was not. That's Next.js's own router segment cache keeping the previous route's DOM hidden (for instant back-navigation), not a bug — confirmed by also taking a full-page screenshot, which showed only the correct, single lesson rendered with no visual duplication.

## Consequences
- `pytest`: 28 tests pass (new test asserts `topic_sessions` is present, ordered, and includes the requested session).
- Vitest: 49 tests pass (new tests for the nav's presence/absence and correct prev/next link hrefs).
- `tsc`, ESLint, `next build` all clean. No migration — this was a pure API-response and frontend addition.
- Verified against the live stack: lesson 1 of the AI-Assisted Software Development topic now shows all 4 lessons and links correctly to the two new ones; clicking through to lesson 4 in an actual browser renders the complete, correct page with zero console errors.

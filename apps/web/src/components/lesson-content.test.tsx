import { render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LessonContent } from "./lesson-content";

function baseLessonResponse(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 1,
    title: "Critical Rendering Path",
    duration_minutes: 25,
    objective: "Explain the critical rendering path.",
    content_blocks: [
      {
        id: 1,
        sequence: 1,
        heading: "Overview",
        body: "The critical rendering path is...",
        note: null,
        exercises: [],
      },
    ],
    access_tier: "free",
    topic: { id: 1, title: "Browser Rendering", slug: "browser-rendering" },
    topic_sessions: [{ id: 1, title: "Critical Rendering Path", sequence: 1, duration_minutes: 25 }],
    exercises: [],
    ...overrides,
  };
}

describe("LessonContent", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows loading state before the response resolves", () => {
    (fetch as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));

    render(<LessonContent sessionId={1} />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading lesson");
  });

  it("renders lesson content on a successful response", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => baseLessonResponse(),
    });

    render(<LessonContent sessionId={1} />);

    await waitFor(() =>
      expect(screen.getByText("Critical Rendering Path")).toBeInTheDocument(),
    );
    expect(screen.getByText("Browser Rendering")).toBeInTheDocument();
    expect(screen.getByText("25 minutes")).toBeInTheDocument();
    expect(screen.queryByText("Check your understanding")).not.toBeInTheDocument();
  });

  it("renders an exercise quiz when the lesson has one", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () =>
        baseLessonResponse({
          exercises: [
            {
              id: 5,
              type: "multiple_choice",
              prompt: "Which step is skipped by background-color changes?",
              options: ["Layout", "Paint"],
            },
          ],
        }),
    });

    render(<LessonContent sessionId={1} />);

    await waitFor(() =>
      expect(screen.getByText("Check your understanding")).toBeInTheDocument(),
    );
    expect(
      screen.getByText("Which step is skipped by background-color changes?"),
    ).toBeInTheDocument();
  });

  it("renders a block-pinned exercise inline with its slide, not in the wrap-up section", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () =>
        baseLessonResponse({
          content_blocks: [
            {
              id: 1,
              sequence: 1,
              heading: "Overview",
              body: "Body text.",
              note: null,
              exercises: [
                {
                  id: 7,
                  type: "multiple_choice",
                  prompt: "Pinned to this slide?",
                  options: ["Yes", "No"],
                },
              ],
            },
          ],
        }),
    });

    render(<LessonContent sessionId={1} />);

    await waitFor(() => expect(screen.getByText("Pinned to this slide?")).toBeInTheDocument());
    // No session-level exercises were returned, so no wrap-up section.
    expect(screen.queryByText("Check your understanding")).not.toBeInTheDocument();
  });

  it("does not render topic lesson nav when the topic has only one lesson", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => baseLessonResponse(),
    });

    render(<LessonContent sessionId={1} />);

    await waitFor(() =>
      expect(screen.getByText("Critical Rendering Path")).toBeInTheDocument(),
    );
    expect(screen.queryByText("Lessons in this topic")).not.toBeInTheDocument();
  });

  it("renders topic lesson nav with prev/next links when the topic has multiple lessons", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () =>
        baseLessonResponse({
          topic_sessions: [
            { id: 1, title: "Critical Rendering Path", sequence: 1, duration_minutes: 25 },
            { id: 2, title: "Compositing", sequence: 2, duration_minutes: 25 },
            { id: 3, title: "Layout Thrashing", sequence: 3, duration_minutes: 25 },
          ],
        }),
    });

    render(<LessonContent sessionId={1} />);

    await waitFor(() => expect(screen.getByText("Lessons in this topic")).toBeInTheDocument());

    const nav = screen.getByRole("navigation", { name: "Lessons in this topic" });
    // Current lesson is listed as plain text (not a link).
    expect(within(nav).getByText("1. Critical Rendering Path")).toBeInTheDocument();
    expect(
      within(nav).queryByRole("link", { name: /Critical Rendering Path/ }),
    ).not.toBeInTheDocument();

    // Other lessons are links.
    expect(within(nav).getByRole("link", { name: "2. Compositing" })).toHaveAttribute(
      "href",
      "/learning/2",
    );

    // No "previous" since this is lesson 1, but there's a "next".
    expect(within(nav).queryByText(/^←/)).not.toBeInTheDocument();
    expect(within(nav).getByText("Compositing →")).toHaveAttribute("href", "/learning/2");
  });

  it("renders a not-found state for a missing lesson", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: "Learning session not found" }),
    });

    render(<LessonContent sessionId={999} />);

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Lesson not found."),
    );
  });

  it("renders an error state when the API is unreachable", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Failed to fetch"),
    );

    render(<LessonContent sessionId={1} />);

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Could not load the lesson.",
      ),
    );
  });
});

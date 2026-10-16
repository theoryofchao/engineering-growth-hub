import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LessonContent } from "./lesson-content";

function baseLessonResponse(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 1,
    title: "Critical Rendering Path",
    duration_minutes: 25,
    objective: "Explain the critical rendering path.",
    content: "The critical rendering path is...",
    access_tier: "free",
    topic: { id: 1, title: "Browser Rendering", slug: "browser-rendering" },
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

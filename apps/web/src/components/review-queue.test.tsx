import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ReviewQueue } from "./review-queue";

const dueItem = {
  exercise: {
    id: 5,
    type: "multiple_choice" as const,
    prompt: "Which step is skipped by background-color changes?",
    options: ["Layout", "Paint"],
  },
  box: 2,
  due_at: "2026-10-20T00:00:00Z",
  topic: { name: "Browser Rendering", slug: "browser-rendering" },
  section_title: "Browser Rendering",
  section_slug: "browser-rendering",
  learning_session_id: 7,
  learning_session_title: "Critical Rendering Path",
};

describe("ReviewQueue", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows an empty-state message when nothing is due", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true, json: async () => [] });

    render(<ReviewQueue />);

    await waitFor(() => expect(screen.getByText(/Nothing due for review/)).toBeInTheDocument());
  });

  it("renders a due exercise with its lesson context and box number", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => [dueItem],
    });

    render(<ReviewQueue />);

    await waitFor(() =>
      expect(
        screen.getByText("Which step is skipped by background-color changes?"),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText(/Browser Rendering/)).toBeInTheDocument();
    expect(screen.getByText(/Critical Rendering Path/)).toBeInTheDocument();
    expect(screen.getByText("Box 2")).toBeInTheDocument();
  });

  it("marks an item Reviewed after it's answered, without removing it", async () => {
    (fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: async () => [dueItem] })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          exercise_id: 5,
          is_correct: true,
          score: 1.0,
          correct_index: 1,
          explanation: "Paint only, no layout needed.",
        }),
      });

    render(<ReviewQueue />);

    await waitFor(() => expect(screen.getByLabelText(/Paint/)).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText(/Paint/));
    fireEvent.click(screen.getByText("Submit answer"));

    await waitFor(() => expect(screen.getByText("Reviewed")).toBeInTheDocument());
    // Still rendered -- the exercise's own "Correct!" feedback shows too.
    expect(screen.getByText("Correct!")).toBeInTheDocument();
  });
});

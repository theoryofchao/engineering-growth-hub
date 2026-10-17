import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ExerciseQuiz } from "./exercise-quiz";

const exercise = {
  id: 5,
  type: "multiple_choice",
  prompt: "Which step is skipped by background-color changes?",
  options: ["Layout", "Paint"],
};

describe("ExerciseQuiz", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("disables submit until an option is selected", () => {
    render(<ExerciseQuiz exercise={exercise} />);

    expect(screen.getByText("Submit answer")).toBeDisabled();

    fireEvent.click(screen.getByLabelText(/Layout/));
    expect(screen.getByText("Submit answer")).not.toBeDisabled();
  });

  it("submits the selected index and shows a correct result", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        exercise_id: 5,
        is_correct: true,
        score: 1.0,
        correct_index: 1,
        explanation: "Paint only, no layout needed.",
      }),
    });

    render(<ExerciseQuiz exercise={exercise} />);

    fireEvent.click(screen.getByLabelText(/Paint/));
    fireEvent.click(screen.getByText("Submit answer"));

    await waitFor(() => expect(screen.getByText("Correct!")).toBeInTheDocument());
    expect(screen.getByText("Paint only, no layout needed.")).toBeInTheDocument();
    // "Paint" is options[1], so the submitted index must be 1 regardless
    // of where it was displayed (display order is shuffled, selection
    // tracks the original index).
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/exercises/5/submissions"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ selected_index: 1 }),
      }),
    );
  });

  it("shows an incorrect result without claiming success", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        exercise_id: 5,
        is_correct: false,
        score: 0.0,
        correct_index: 1,
        explanation: "Paint only, no layout needed.",
      }),
    });

    render(<ExerciseQuiz exercise={exercise} />);

    fireEvent.click(screen.getByLabelText(/Layout/));
    fireEvent.click(screen.getByText("Submit answer"));

    await waitFor(() => expect(screen.getByText("Not quite.")).toBeInTheDocument());
  });

  it("shows an error state when the submission request fails", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false, status: 500 });

    render(<ExerciseQuiz exercise={exercise} />);

    fireEvent.click(screen.getByLabelText(/Layout/));
    fireEvent.click(screen.getByText("Submit answer"));

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
  });

  it("labels options A, B, C... in whatever order they're displayed", () => {
    const fourOptionExercise = {
      id: 6,
      type: "multiple_choice",
      prompt: "Pick one",
      options: ["First", "Second", "Third", "Fourth"],
    };
    render(<ExerciseQuiz exercise={fourOptionExercise} />);

    expect(screen.getByText("A.")).toBeInTheDocument();
    expect(screen.getByText("B.")).toBeInTheDocument();
    expect(screen.getByText("C.")).toBeInTheDocument();
    expect(screen.getByText("D.")).toBeInTheDocument();
  });

  it("shuffles display order (original index still drives selection and scoring)", () => {
    // Force Fisher-Yates to produce a specific, reversed permutation so
    // this test is deterministic rather than asserting on randomness.
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);

    render(<ExerciseQuiz exercise={exercise} />); // options: ["Layout", "Paint"]

    const labels = screen.getAllByRole("radio").map((radio) => radio.closest("label")?.textContent);
    expect(labels).toEqual(["A.Paint", "B.Layout"]); // reversed from authored order

    randomSpy.mockRestore();
  });
});

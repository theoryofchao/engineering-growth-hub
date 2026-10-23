import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ExerciseProject } from "./exercise-project";

const exercise = {
  id: 9,
  type: "project" as const,
  prompt: "Add a feature flag to a real project.",
  checkpoints: [
    {
      title: "Checkpoint 1: Define the boundary",
      acceptance_criteria: ["Write down what the flag wraps", "Name why no new service is needed"],
    },
    {
      title: "Checkpoint 2: Implement the toggle",
      acceptance_criteria: ["A flag controls a real branch"],
    },
  ],
  checked_criteria: {},
};

describe("ExerciseProject", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders every checkpoint and its acceptance criteria", () => {
    render(<ExerciseProject exercise={exercise} />);

    expect(screen.getByText("Checkpoint 1: Define the boundary")).toBeInTheDocument();
    expect(screen.getByText("Checkpoint 2: Implement the toggle")).toBeInTheDocument();
    expect(screen.getByText("Write down what the flag wraps")).toBeInTheDocument();
    expect(screen.getByText("A flag controls a real branch")).toBeInTheDocument();
    expect(screen.getByText("0/3")).toBeInTheDocument();
  });

  it("checking a criterion updates the count and PUTs the new state", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ checked_criteria: { "0:0": true } }),
    });

    render(<ExerciseProject exercise={exercise} />);
    fireEvent.click(screen.getByLabelText("Write down what the flag wraps"));

    await waitFor(() => expect(screen.getByText("1/3")).toBeInTheDocument());
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/exercises/9/project-progress"),
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ checkpoint_index: 0, criterion_index: 0, checked: true }),
      }),
    );
  });

  it("shows 'Complete' on a checkpoint once every one of its criteria is checked", async () => {
    const singleCriterionExercise = {
      ...exercise,
      checkpoints: [exercise.checkpoints[1]], // only 1 criterion
    };
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ checked_criteria: { "0:0": true } }),
    });

    render(<ExerciseProject exercise={singleCriterionExercise} />);
    expect(screen.queryByText("Complete")).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("A flag controls a real branch"));

    await waitFor(() => expect(screen.getByText("Complete")).toBeInTheDocument());
  });

  it("rolls back the checkbox and shows an error when the request fails", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false, status: 500 });

    render(<ExerciseProject exercise={exercise} />);
    const checkbox = screen.getByLabelText("Write down what the flag wraps") as HTMLInputElement;
    fireEvent.click(checkbox);

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(checkbox.checked).toBe(false);
    expect(screen.getByText("0/3")).toBeInTheDocument();
  });

  it("unchecking a previously-checked criterion sends checked: false", async () => {
    const partiallyCheckedExercise = { ...exercise, checked_criteria: { "0:0": true } };
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ checked_criteria: {} }),
    });

    render(<ExerciseProject exercise={partiallyCheckedExercise} />);
    fireEvent.click(screen.getByLabelText("Write down what the flag wraps"));

    await waitFor(() => expect(screen.getByText("0/3")).toBeInTheDocument());
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/project-progress"),
      expect.objectContaining({
        body: JSON.stringify({ checkpoint_index: 0, criterion_index: 0, checked: false }),
      }),
    );
  });
});

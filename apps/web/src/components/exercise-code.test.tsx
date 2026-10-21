import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ExerciseCode } from "./exercise-code";

vi.mock("@monaco-editor/react", () => ({
  default: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <textarea
      data-testid="monaco-stub"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

const runTestCases = vi.fn();
vi.mock("@/lib/code-runner", () => ({
  runTestCases: (...args: unknown[]) => runTestCases(...args),
  caseResultToSubmittedOutput: (result: { ok: boolean; value?: unknown; error?: string }) =>
    result.ok ? result.value : { __error__: result.error },
}));

const exercise = {
  id: 42,
  type: "code" as const,
  prompt: "Reverse the array.",
  language: "javascript",
  function_name: "reverseInPlace",
  starter_code: "function reverseInPlace(nums) {}",
  timeout_ms: 2000,
  visible_test_cases: [{ input: [[1, 2, 3]], expected_output: [3, 2, 1] }],
  hidden_test_cases: [{ input: [[4, 5]] }],
};

describe("ExerciseCode", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    runTestCases.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("Run executes only visible cases and makes no network call", async () => {
    runTestCases.mockResolvedValue([{ ok: true, value: [3, 2, 1] }]);

    render(<ExerciseCode exercise={exercise} />);
    fireEvent.click(screen.getByText("Run"));

    await waitFor(() => expect(screen.getByText(/1\/1 passing/)).toBeInTheDocument());

    expect(runTestCases).toHaveBeenCalledWith(
      exercise.starter_code,
      "reverseInPlace",
      exercise.visible_test_cases,
      2000,
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("Run shows a failing visible case distinctly, without crashing", async () => {
    runTestCases.mockResolvedValue([{ ok: true, value: [1, 2, 3] }]);

    render(<ExerciseCode exercise={exercise} />);
    fireEvent.click(screen.getByText("Run"));

    await waitFor(() => expect(screen.getByText(/0\/1 passing/)).toBeInTheDocument());
    expect(screen.getByText(/expected \[3,2,1\]/)).toBeInTheDocument();
  });

  it("Run surfaces a timeout as a distinct result, not a crash", async () => {
    runTestCases.mockResolvedValue([{ ok: false, error: "timeout" }]);

    render(<ExerciseCode exercise={exercise} />);
    fireEvent.click(screen.getByText("Run"));

    await waitFor(() => expect(screen.getByText("Timed out")).toBeInTheDocument());
  });

  it("Submit runs visible+hidden cases and posts outputs to the server", async () => {
    runTestCases.mockResolvedValue([
      { ok: true, value: [3, 2, 1] },
      { ok: true, value: [5, 4] },
    ]);
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        exercise_id: 42,
        is_correct: true,
        score: 1.0,
        cases: [
          {
            hidden: false,
            input: [[1, 2, 3]],
            expected_output: [3, 2, 1],
            actual_output: [3, 2, 1],
            passed: true,
          },
          {
            hidden: true,
            input: [[4, 5]],
            expected_output: [5, 4],
            actual_output: [5, 4],
            passed: true,
          },
        ],
      }),
    });

    render(<ExerciseCode exercise={exercise} />);
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => expect(screen.getByText("All test cases passed!")).toBeInTheDocument());

    expect(runTestCases).toHaveBeenCalledWith(
      exercise.starter_code,
      "reverseInPlace",
      [...exercise.visible_test_cases, ...exercise.hidden_test_cases],
      2000,
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/exercises/42/submissions"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          outputs: [
            [3, 2, 1],
            [5, 4],
          ],
        }),
      }),
    );
    // Hidden case is revealed post-grading.
    expect(screen.getByText("hidden")).toBeInTheDocument();
  });

  it("Submit shows a distinct error state when the request fails", async () => {
    runTestCases.mockResolvedValue([
      { ok: true, value: [3, 2, 1] },
      { ok: true, value: [5, 4] },
    ]);
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false, status: 500 });

    render(<ExerciseCode exercise={exercise} />);
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
  });

  it("moves focus to the results region after Run completes", async () => {
    runTestCases.mockResolvedValue([{ ok: true, value: [3, 2, 1] }]);

    render(<ExerciseCode exercise={exercise} />);
    fireEvent.click(screen.getByText("Run"));

    await waitFor(() => expect(screen.getByRole("status")).toHaveFocus());
  });
});

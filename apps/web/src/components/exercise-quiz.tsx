"use client";

import { useState } from "react";

import { API_BASE_URL } from "@/lib/config";
import type { ExerciseQuizData } from "@/lib/exercise-types";

type SubmissionResult = {
  exercise_id: number;
  is_correct: boolean;
  score: number;
  correct_index: number;
  explanation: string;
};

type State =
  | { phase: "answering"; selectedIndex: number | null }
  | { phase: "submitting" }
  | { phase: "error"; message: string }
  | { phase: "result"; result: SubmissionResult };

/** Fisher-Yates shuffle of [0, 1, ..., count-1]. */
function shuffledIndices(count: number): number[] {
  const indices = Array.from({ length: count }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

export function ExerciseQuiz({ exercise }: { exercise: ExerciseQuizData }) {
  const [state, setState] = useState<State>({ phase: "answering", selectedIndex: null });
  // Display order is randomized per mount (not tied to the correct
  // answer's original position in definition_json) so the correct
  // option doesn't cluster at a predictable letter across questions.
  // Selection/submission still use the ORIGINAL index throughout —
  // this is purely a display-order shuffle, the backend is unaware of it.
  const [displayOrder] = useState(() => shuffledIndices(exercise.options.length));

  async function submit() {
    if (state.phase !== "answering" || state.selectedIndex === null) return;
    const selectedIndex = state.selectedIndex;
    setState({ phase: "submitting" });

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/exercises/${exercise.id}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selected_index: selectedIndex }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const result = (await response.json()) as SubmissionResult;
      setState({ phase: "result", result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setState({ phase: "error", message });
    }
  }

  return (
    <div className="rounded-lg border border-zinc-300 px-4 py-3 dark:border-zinc-700">
      <p className="font-medium text-black dark:text-zinc-50">{exercise.prompt}</p>

      <fieldset className="mt-3 flex flex-col gap-2" disabled={state.phase !== "answering"}>
        <legend className="sr-only">Answer options</legend>
        {displayOrder.map((index, position) => {
          const option = exercise.options[index];
          const letter = String.fromCharCode(65 + position); // A, B, C, D...
          const isSelected = state.phase === "answering" && state.selectedIndex === index;
          const isCorrectAnswer = state.phase === "result" && state.result.correct_index === index;

          return (
            <label
              key={index}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                state.phase === "answering"
                  ? "cursor-pointer border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                  : isCorrectAnswer
                    ? "border-green-400 bg-green-50 dark:border-green-700 dark:bg-green-950"
                    : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <input
                type="radio"
                name={`exercise-${exercise.id}`}
                checked={isSelected}
                onChange={() => setState({ phase: "answering", selectedIndex: index })}
              />
              <span className="font-medium text-zinc-500 dark:text-zinc-400">{letter}.</span>
              {option}
            </label>
          );
        })}
      </fieldset>

      {state.phase === "answering" && (
        <button
          type="button"
          onClick={submit}
          disabled={state.selectedIndex === null}
          className="mt-3 rounded-lg bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-40 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          Submit answer
        </button>
      )}

      {state.phase === "error" && (
        <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-400">
          {state.message}
        </p>
      )}

      {state.phase === "result" && (
        <div
          role="status"
          className={`mt-3 rounded-lg px-3 py-2 text-sm ${
            state.result.is_correct
              ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200"
              : "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
          }`}
        >
          <p className="font-medium">{state.result.is_correct ? "Correct!" : "Not quite."}</p>
          <p className="mt-1">{state.result.explanation}</p>
        </div>
      )}
    </div>
  );
}

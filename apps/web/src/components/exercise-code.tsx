"use client";

import Editor from "@monaco-editor/react";
import { useRef, useState } from "react";

import { API_BASE_URL } from "@/lib/config";
import { caseResultToSubmittedOutput, runTestCases, type CaseRunResult } from "@/lib/code-runner";
import type { ExerciseCodeData } from "@/lib/exercise-types";

type VisibleCaseDisplay = {
  input: unknown[];
  expectedOutput: unknown;
  outcome: CaseRunResult;
  passed: boolean;
};

type ServerCaseResult = {
  hidden: boolean;
  input: unknown[];
  expected_output: unknown;
  actual_output: unknown;
  passed: boolean;
};

type SubmissionResult = {
  exercise_id: number;
  is_correct: boolean;
  score: number;
  cases: ServerCaseResult[];
};

type State =
  | { phase: "editing" }
  | { phase: "running" }
  | { phase: "ran"; results: VisibleCaseDisplay[] }
  | { phase: "submitting" }
  | { phase: "submit-error"; message: string }
  | { phase: "submitted"; result: SubmissionResult };

function outcomeLabel(outcome: CaseRunResult): string {
  if (outcome.ok) return JSON.stringify(outcome.value);
  return outcome.error === "timeout" ? "Timed out" : `Error: ${outcome.error}`;
}

export function ExerciseCode({ exercise }: { exercise: ExerciseCodeData }) {
  const [code, setCode] = useState(exercise.starter_code);
  const [state, setState] = useState<State>({ phase: "editing" });
  const resultsRef = useRef<HTMLDivElement>(null);

  function focusResultsSoon() {
    // Results render on the next tick (state update), so defer the
    // focus move -- without this the element doesn't exist yet.
    requestAnimationFrame(() => resultsRef.current?.focus());
  }

  async function run() {
    setState({ phase: "running" });
    const outcomes = await runTestCases(
      code,
      exercise.function_name,
      exercise.visible_test_cases,
      exercise.timeout_ms,
    );
    const results: VisibleCaseDisplay[] = exercise.visible_test_cases.map((testCase, index) => {
      const outcome = outcomes[index];
      const passed = outcome.ok && jsonEquals(outcome.value, testCase.expected_output);
      return { input: testCase.input, expectedOutput: testCase.expected_output, outcome, passed };
    });
    setState({ phase: "ran", results });
    focusResultsSoon();
  }

  async function submit() {
    setState({ phase: "submitting" });
    try {
      const allCases = [...exercise.visible_test_cases, ...exercise.hidden_test_cases];
      const outcomes = await runTestCases(
        code,
        exercise.function_name,
        allCases,
        exercise.timeout_ms,
      );
      const outputs = outcomes.map(caseResultToSubmittedOutput);

      const response = await fetch(`${API_BASE_URL}/api/v1/exercises/${exercise.id}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outputs }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const result = (await response.json()) as SubmissionResult;
      setState({ phase: "submitted", result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setState({ phase: "submit-error", message });
    }
    focusResultsSoon();
  }

  const isBusy = state.phase === "running" || state.phase === "submitting";

  return (
    <div className="rounded-lg border border-zinc-300 px-4 py-3 dark:border-zinc-700">
      <p className="font-medium text-black dark:text-zinc-50">{exercise.prompt}</p>

      <div className="mt-3 overflow-hidden rounded-lg border border-zinc-300 dark:border-zinc-700">
        <Editor
          height="240px"
          language={exercise.language}
          value={code}
          onChange={(value) => setCode(value ?? "")}
          theme="vs-dark"
          options={{ minimap: { enabled: false }, fontSize: 13 }}
        />
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={run}
          disabled={isBusy}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          {state.phase === "running" ? "Running…" : "Run"}
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={isBusy}
          className="rounded-lg bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-40 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          {state.phase === "submitting" ? "Submitting…" : "Submit"}
        </button>
      </div>

      {state.phase === "ran" && (
        <div
          ref={resultsRef}
          role="status"
          tabIndex={-1}
          className="mt-3 flex flex-col gap-1.5 rounded-lg border border-zinc-200 p-2 text-sm dark:border-zinc-800"
        >
          <p className="font-medium text-zinc-600 dark:text-zinc-400">
            Visible test cases ({state.results.filter((r) => r.passed).length}/
            {state.results.length} passing)
          </p>
          {state.results.map((result, index) => (
            <div
              key={index}
              className={`rounded px-2 py-1 ${
                result.passed
                  ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200"
                  : "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
              }`}
            >
              <span className="font-mono text-xs">{JSON.stringify(result.input)}</span>
              {" → "}
              <span className="font-mono text-xs">{outcomeLabel(result.outcome)}</span>
              {!result.passed && (
                <span className="font-mono text-xs">
                  {" "}
                  (expected {JSON.stringify(result.expectedOutput)})
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {state.phase === "submit-error" && (
        <p
          ref={resultsRef as React.RefObject<HTMLParagraphElement>}
          role="alert"
          tabIndex={-1}
          className="mt-3 text-sm text-red-700 dark:text-red-400"
        >
          {state.message}
        </p>
      )}

      {state.phase === "submitted" && (
        <div
          ref={resultsRef}
          role="status"
          tabIndex={-1}
          className={`mt-3 flex flex-col gap-1.5 rounded-lg p-2 text-sm ${
            state.result.is_correct
              ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200"
              : "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
          }`}
        >
          <p className="font-medium">
            {state.result.is_correct
              ? "All test cases passed!"
              : `${state.result.cases.filter((c) => c.passed).length}/${state.result.cases.length} test cases passed.`}
          </p>
          {state.result.cases.map((caseResult, index) => (
            <div key={index} className="rounded bg-white/50 px-2 py-1 dark:bg-black/20">
              <span className="font-mono text-xs">{JSON.stringify(caseResult.input)}</span>
              {" → "}
              <span className="font-mono text-xs">{JSON.stringify(caseResult.actual_output)}</span>
              {!caseResult.passed && (
                <span className="font-mono text-xs">
                  {" "}
                  (expected {JSON.stringify(caseResult.expected_output)})
                </span>
              )}
              {caseResult.hidden && (
                <span className="ml-1 rounded bg-zinc-200 px-1 text-[10px] uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  hidden
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function jsonEquals(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

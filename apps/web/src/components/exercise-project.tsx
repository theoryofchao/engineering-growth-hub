"use client";

import { useState } from "react";

import { API_BASE_URL } from "@/lib/config";
import type { ExerciseProjectData } from "@/lib/exercise-types";

function criterionKey(checkpointIndex: number, criterionIndex: number): string {
  return `${checkpointIndex}:${criterionIndex}`;
}

/**
 * A self-attested, multi-checkpoint project exercise (PRODUCT.md: "short
 * multi-session project... divided into Pomodoro-sized checkpoints with
 * acceptance criteria"). There's no grading/submission here -- the
 * learner just checks off criteria as they complete them, in their own
 * time across however many Pomodoro sessions it takes.
 */
export function ExerciseProject({ exercise }: { exercise: ExerciseProjectData }) {
  const [checkedCriteria, setCheckedCriteria] = useState(exercise.checked_criteria);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function toggleCriterion(checkpointIndex: number, criterionIndex: number) {
    const key = criterionKey(checkpointIndex, criterionIndex);
    const nextChecked = !checkedCriteria[key];

    setErrorMessage(null);
    setCheckedCriteria((current) => ({ ...current, [key]: nextChecked }));

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/exercises/${exercise.id}/project-progress`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            checkpoint_index: checkpointIndex,
            criterion_index: criterionIndex,
            checked: nextChecked,
          }),
        },
      );
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      const body = (await response.json()) as { checked_criteria: Record<string, boolean> };
      setCheckedCriteria(body.checked_criteria);
    } catch (error) {
      setCheckedCriteria((current) => ({ ...current, [key]: !nextChecked })); // roll back
      setErrorMessage(error instanceof Error ? error.message : "Unknown error");
    }
  }

  const totalCriteria = exercise.checkpoints.reduce(
    (sum, checkpoint) => sum + checkpoint.acceptance_criteria.length,
    0,
  );
  const doneCount = Object.values(checkedCriteria).filter(Boolean).length;

  return (
    <div className="rounded-lg border border-zinc-300 px-4 py-3 dark:border-zinc-700">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium text-black dark:text-zinc-50">{exercise.prompt}</p>
        <span className="shrink-0 rounded bg-zinc-200 px-2 py-0.5 text-xs font-medium tabular-nums text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          {doneCount}/{totalCriteria}
        </span>
      </div>

      <div className="mt-3 flex flex-col gap-3">
        {exercise.checkpoints.map((checkpoint, checkpointIndex) => {
          const checkpointDone = checkpoint.acceptance_criteria.every(
            (_, criterionIndex) => checkedCriteria[criterionKey(checkpointIndex, criterionIndex)],
          );

          return (
            <div
              key={checkpointIndex}
              className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-black dark:text-zinc-50">
                  {checkpoint.title}
                </h4>
                {checkpointDone && (
                  <span className="shrink-0 text-xs font-medium text-green-700 dark:text-green-400">
                    Complete
                  </span>
                )}
              </div>
              <ul className="mt-2 flex flex-col gap-1.5">
                {checkpoint.acceptance_criteria.map((criterion, criterionIndex) => {
                  const key = criterionKey(checkpointIndex, criterionIndex);
                  const checked = checkedCriteria[key] ?? false;
                  return (
                    <li key={key}>
                      <label className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                        <input
                          type="checkbox"
                          className="mt-0.5"
                          checked={checked}
                          onChange={() => toggleCriterion(checkpointIndex, criterionIndex)}
                        />
                        <span
                          className={checked ? "text-zinc-400 line-through dark:text-zinc-500" : ""}
                        >
                          {criterion}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {errorMessage && (
        <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-400">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

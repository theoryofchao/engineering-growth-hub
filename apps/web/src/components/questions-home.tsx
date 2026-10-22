"use client";

import Link from "next/link";
import { useState } from "react";

import { useFetch } from "@/hooks/use-fetch";
import { API_BASE_URL } from "@/lib/config";

type Competency = { id: number; title: string; slug: string; description: string | null };

type QuestionSummary = {
  id: number;
  prompt: string;
  source: "seed" | "custom";
  competency: Competency;
  created_at: string;
};

type SubmitState =
  { phase: "idle" } | { phase: "submitting" } | { phase: "error"; message: string };

const fieldClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

export function QuestionsHome() {
  const competenciesState = useFetch<Competency[]>("/api/v1/leadership/competencies");
  const questionsState = useFetch<QuestionSummary[]>("/api/v1/leadership/questions");

  // Synced from the fetch once, then mutated locally on add/delete rather
  // than refetched -- useFetch has no refetch escape hatch, and this
  // mirrors the same "adjust during render, once" prefill pattern
  // story-form.tsx already uses for an async value arriving after mount.
  const [questions, setQuestions] = useState<QuestionSummary[]>([]);
  const [syncedFromFetch, setSyncedFromFetch] = useState(false);
  if (questionsState.phase === "success" && !syncedFromFetch) {
    setSyncedFromFetch(true);
    setQuestions(questionsState.data);
  }

  const [newCompetencyId, setNewCompetencyId] = useState<number | "">("");
  const [newPrompt, setNewPrompt] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>({ phase: "idle" });

  async function handleAddQuestion(event: React.FormEvent) {
    event.preventDefault();
    if (newCompetencyId === "") return;

    setSubmitState({ phase: "submitting" });
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/leadership/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section_id: newCompetencyId, prompt: newPrompt }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? `API responded with status ${response.status}`);
      }

      const created = (await response.json()) as QuestionSummary;
      setQuestions((current) => [...current, created]);
      setNewPrompt("");
      setNewCompetencyId("");
      setSubmitState({ phase: "idle" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setSubmitState({ phase: "error", message });
    }
  }

  async function handleDeleteQuestion(questionId: number) {
    if (!window.confirm("Delete this question? This can't be undone.")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/leadership/questions/${questionId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      setQuestions((current) => current.filter((q) => q.id !== questionId));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setSubmitState({ phase: "error", message });
    }
  }

  if (competenciesState.phase === "loading" || questionsState.phase === "loading") {
    return (
      <p role="status" aria-live="polite" className="text-zinc-600 dark:text-zinc-400">
        Loading behavioral questions…
      </p>
    );
  }

  if (competenciesState.phase !== "success") {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
      >
        <p className="font-medium">Could not load competencies.</p>
      </div>
    );
  }

  if (questionsState.phase === "error") {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
      >
        <p className="font-medium">Could not load questions.</p>
        <p className="text-sm">{questionsState.message}</p>
      </div>
    );
  }

  const competencies = competenciesState.data;

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Common behavioral-interview questions, tagged to a competency. Pick one to see which of your
        stories answers it.
      </p>

      <form
        onSubmit={handleAddQuestion}
        className="flex flex-col gap-2 rounded-lg border border-zinc-300 p-4 dark:border-zinc-700"
      >
        <h2 className="text-sm font-semibold text-black dark:text-zinc-50">
          Add your own question
        </h2>
        <select
          required
          value={newCompetencyId}
          onChange={(event) => setNewCompetencyId(Number(event.target.value))}
          className={fieldClass}
        >
          <option value="" disabled>
            Select a competency
          </option>
          {competencies.map((competency) => (
            <option key={competency.id} value={competency.id}>
              {competency.title}
            </option>
          ))}
        </select>
        <textarea
          required
          rows={2}
          value={newPrompt}
          onChange={(event) => setNewPrompt(event.target.value)}
          className={fieldClass}
          placeholder="e.g. a question an interviewer actually asked you"
        />
        {submitState.phase === "error" && (
          <p className="text-sm text-red-700 dark:text-red-300">{submitState.message}</p>
        )}
        <button
          type="submit"
          disabled={submitState.phase === "submitting"}
          className="self-start rounded-lg bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-40 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          Add question
        </button>
      </form>

      <div className="flex flex-col gap-4">
        {competencies.map((competency) => {
          const competencyQuestions = questions.filter((q) => q.competency.id === competency.id);

          return (
            <div
              key={competency.id}
              className="rounded-lg border border-zinc-300 p-4 dark:border-zinc-700"
            >
              <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
                {competency.title}
              </h3>
              {competencyQuestions.length === 0 ? (
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">No questions yet.</p>
              ) : (
                <ul className="mt-2 flex flex-col gap-1">
                  {competencyQuestions.map((question) => (
                    <li key={question.id} className="flex items-center justify-between gap-2">
                      <Link
                        href={`/leadership/questions/${question.id}`}
                        className="flex-1 rounded px-2 py-1 text-sm text-zinc-700 hover:bg-zinc-100 hover:underline dark:text-zinc-300 dark:hover:bg-zinc-900"
                      >
                        {question.prompt}
                      </Link>
                      {question.source === "custom" && (
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="shrink-0 text-xs text-red-600 hover:underline dark:text-red-400"
                        >
                          Delete
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useFetch } from "@/hooks/use-fetch";
import { API_BASE_URL } from "@/lib/config";

type Competency = { id: number; title: string; slug: string; description: string | null };

type RubricDimension = { key: string; label: string; description: string };

type StoryDetail = {
  id: number;
  title: string;
  competency: Competency;
  situation: string;
  task: string;
  action: string;
  result: string;
  reflection: string | null;
  quantified_outcome: string | null;
  rubric_scores: Record<string, number>;
  overall_score: number | null;
};

type FormFields = {
  sectionId: number | null;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  reflection: string;
  quantifiedOutcome: string;
  rubricScores: Record<string, number>;
};

const EMPTY_FIELDS: FormFields = {
  sectionId: null,
  title: "",
  situation: "",
  task: "",
  action: "",
  result: "",
  reflection: "",
  quantifiedOutcome: "",
  rubricScores: {},
};

type SubmitState =
  { phase: "idle" } | { phase: "submitting" } | { phase: "error"; message: string };

export function StoryForm({ mode, storyId }: { mode: "create" | "edit"; storyId?: number }) {
  const router = useRouter();
  const competenciesState = useFetch<Competency[]>("/api/v1/leadership/competencies");
  const storyState = useFetch<StoryDetail>(
    mode === "edit" && storyId ? `/api/v1/leadership/stories/${storyId}` : null,
  );
  // Only needed to render the rubric section, which only exists in edit
  // mode -- a story can't be self-assessed before it's been written.
  const rubricDimensionsState = useFetch<RubricDimension[]>(
    mode === "edit" ? "/api/v1/leadership/rubric-dimensions" : null,
  );

  const [fields, setFields] = useState<FormFields>(EMPTY_FIELDS);
  const [submitState, setSubmitState] = useState<SubmitState>({ phase: "idle" });

  // Prefill the editable fields once the existing story loads. Adjusted
  // during render (bailing out and re-rendering immediately), not in an
  // effect -- this is React's documented pattern for syncing local state
  // from an async value the moment it arrives, without an extra commit.
  const [prefilledStoryId, setPrefilledStoryId] = useState<number | null>(null);
  if (storyState.phase === "success" && prefilledStoryId !== storyState.data.id) {
    const story = storyState.data;
    setPrefilledStoryId(story.id);
    setFields({
      sectionId: story.competency.id,
      title: story.title,
      situation: story.situation,
      task: story.task,
      action: story.action,
      result: story.result,
      reflection: story.reflection ?? "",
      quantifiedOutcome: story.quantified_outcome ?? "",
      rubricScores: story.rubric_scores,
    });
  }

  function updateField<K extends keyof FormFields>(key: K, value: FormFields[K]) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  function updateRubricScore(dimensionKey: string, value: number | null) {
    setFields((current) => {
      const rubricScores = { ...current.rubricScores };
      if (value === null) {
        delete rubricScores[dimensionKey];
      } else {
        rubricScores[dimensionKey] = value;
      }
      return { ...current, rubricScores };
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitState({ phase: "submitting" });

    const payload = {
      section_id: fields.sectionId,
      title: fields.title,
      situation: fields.situation,
      task: fields.task,
      action: fields.action,
      result: fields.result,
      reflection: fields.reflection || null,
      quantified_outcome: fields.quantifiedOutcome || null,
      ...(mode === "edit" ? { rubric_scores: fields.rubricScores } : {}),
    };

    try {
      const response = await fetch(
        mode === "create"
          ? `${API_BASE_URL}/api/v1/leadership/stories`
          : `${API_BASE_URL}/api/v1/leadership/stories/${storyId}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? `API responded with status ${response.status}`);
      }

      router.push("/leadership");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setSubmitState({ phase: "error", message });
    }
  }

  async function handleDelete() {
    if (!storyId) return;
    if (!window.confirm("Delete this story? This can't be undone.")) return;

    setSubmitState({ phase: "submitting" });
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/leadership/stories/${storyId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      router.push("/leadership");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setSubmitState({ phase: "error", message });
    }
  }

  // storyState's path is `null` in create mode, which means it never
  // leaves "loading" (useFetch's documented way to skip fetching) -- so
  // every storyState check below is deliberately guarded by `mode === "edit"`.
  if (
    competenciesState.phase === "loading" ||
    (mode === "edit" && storyState.phase === "loading")
  ) {
    return (
      <p role="status" aria-live="polite" className="text-zinc-600 dark:text-zinc-400">
        Loading…
      </p>
    );
  }

  if (mode === "edit" && storyState.phase === "not-found") {
    return (
      <div
        role="alert"
        className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
      >
        <p className="font-medium">Story not found.</p>
      </div>
    );
  }

  const storyLoadErrorMessage =
    mode === "edit" && storyState.phase === "error" ? storyState.message : null;

  if (competenciesState.phase === "error" || storyLoadErrorMessage) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
      >
        <p className="font-medium">Could not load the form.</p>
        <p className="text-sm">
          {competenciesState.phase === "error" ? competenciesState.message : storyLoadErrorMessage}
        </p>
      </div>
    );
  }

  if (competenciesState.phase !== "success") {
    // The competencies endpoint has no 404 case in practice, but this
    // keeps the type narrowing (and the UI) honest if it ever did.
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
      >
        <p className="font-medium">Could not load competencies.</p>
      </div>
    );
  }

  const competencies = competenciesState.data;

  const fieldClass =
    "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";
  const labelClass = "text-sm font-medium text-zinc-700 dark:text-zinc-300";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className={labelClass}>Competency</span>
        <select
          required
          value={fields.sectionId ?? ""}
          onChange={(event) => updateField("sectionId", Number(event.target.value))}
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
      </label>

      <label className="flex flex-col gap-1">
        <span className={labelClass}>Title</span>
        <input
          required
          type="text"
          value={fields.title}
          onChange={(event) => updateField("title", event.target.value)}
          className={fieldClass}
          placeholder="A short, memorable name for this story"
        />
      </label>

      {(
        [
          ["situation", "Situation", "What was the context?"],
          ["task", "Task", "What were you responsible for?"],
          ["action", "Action", "What did you specifically do?"],
          ["result", "Result", "What happened?"],
        ] as const
      ).map(([key, label, placeholder]) => (
        <label key={key} className="flex flex-col gap-1">
          <span className={labelClass}>{label}</span>
          <textarea
            required
            rows={3}
            value={fields[key]}
            onChange={(event) => updateField(key, event.target.value)}
            className={fieldClass}
            placeholder={placeholder}
          />
        </label>
      ))}

      <label className="flex flex-col gap-1">
        <span className={labelClass}>Reflection (optional)</span>
        <textarea
          rows={2}
          value={fields.reflection}
          onChange={(event) => updateField("reflection", event.target.value)}
          className={fieldClass}
          placeholder="What would you do differently, or what did you learn?"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className={labelClass}>Quantified outcome (optional)</span>
        <input
          type="text"
          value={fields.quantifiedOutcome}
          onChange={(event) => updateField("quantifiedOutcome", event.target.value)}
          className={fieldClass}
          placeholder="e.g. -30% latency, $2M saved, 4 engineers onboarded"
        />
      </label>

      {mode === "edit" && rubricDimensionsState.phase === "success" && (
        <div className="flex flex-col gap-3 rounded-lg border border-zinc-300 p-4 dark:border-zinc-700">
          <div className="flex items-center justify-between">
            <h2 className={labelClass}>Self-assessment rubric</h2>
            {storyState.phase === "success" &&
              typeof storyState.data.overall_score === "number" && (
                <span className="rounded bg-zinc-200 px-2 py-0.5 text-xs font-medium tabular-nums text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {storyState.data.overall_score.toFixed(1)} / 5 overall
                </span>
              )}
          </div>
          {rubricDimensionsState.data.map((dimension) => (
            <label key={dimension.key} className="flex flex-col gap-1">
              <span className="text-sm text-zinc-700 dark:text-zinc-300">{dimension.label}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {dimension.description}
              </span>
              <select
                value={fields.rubricScores[dimension.key] ?? ""}
                onChange={(event) => {
                  const raw = event.target.value;
                  updateRubricScore(dimension.key, raw === "" ? null : Number(raw));
                }}
                className={fieldClass}
              >
                <option value="">Not yet scored</option>
                {[1, 2, 3, 4, 5].map((score) => (
                  <option key={score} value={score}>
                    {score}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      )}

      {submitState.phase === "error" && (
        <div
          role="alert"
          className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
        >
          <p className="text-sm">{submitState.message}</p>
        </div>
      )}

      <div className="flex justify-between gap-2">
        {mode === "edit" ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={submitState.phase === "submitting"}
            className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-40 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
          >
            Delete
          </button>
        ) : (
          <span />
        )}
        <button
          type="submit"
          disabled={submitState.phase === "submitting"}
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-40 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          {mode === "create" ? "Create story" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

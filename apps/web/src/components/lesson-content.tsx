"use client";

import { useEffect, useState } from "react";

import { API_BASE_URL } from "@/lib/config";
import { PomodoroTimer } from "@/components/pomodoro-timer";
import { ExerciseQuiz } from "@/components/exercise-quiz";
import { ContentBlocks } from "@/components/content-blocks";
import type { Note } from "@/components/notes-drawer";

type LearningSession = {
  id: number;
  title: string;
  duration_minutes: number;
  objective: string;
  content_blocks: { id: number; sequence: number; heading: string; body: string; note: Note | null }[];
  access_tier: string;
  topic: { id: number; title: string; slug: string };
  exercises: { id: number; type: string; prompt: string; options: string[] }[];
};

type State =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "not-found" }
  | { phase: "success"; data: LearningSession };

export function LessonContent({ sessionId }: { sessionId: number }) {
  const [state, setState] = useState<State>({ phase: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/learning-sessions/${sessionId}`,
          { signal: controller.signal, cache: "no-store" },
        );

        if (response.status === 404) {
          setState({ phase: "not-found" });
          return;
        }

        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }

        const data = (await response.json()) as LearningSession;
        setState({ phase: "success", data });
      } catch (error) {
        if (controller.signal.aborted) return;
        const message =
          error instanceof Error ? error.message : "Unknown error";
        setState({ phase: "error", message });
      }
    }

    load();
    return () => controller.abort();
  }, [sessionId]);

  if (state.phase === "loading") {
    return (
      <p role="status" aria-live="polite" className="text-zinc-600 dark:text-zinc-400">
        Loading lesson…
      </p>
    );
  }

  if (state.phase === "not-found") {
    return (
      <div
        role="alert"
        className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
      >
        <p className="font-medium">Lesson not found.</p>
      </div>
    );
  }

  if (state.phase === "error") {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
      >
        <p className="font-medium">Could not load the lesson.</p>
        <p className="text-sm">{state.message}</p>
      </div>
    );
  }

  const { data } = state;

  return (
    <article className="flex flex-col gap-6">
      <header>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {data.topic.title}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          {data.title}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {data.duration_minutes} minutes
        </p>
      </header>

      <PomodoroTimer learningSessionId={data.id} modeMinutes={data.duration_minutes} />

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Objective
        </h2>
        <p className="mt-1 text-zinc-800 dark:text-zinc-200">{data.objective}</p>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Lesson
        </h2>
        <div className="mt-2">
          <ContentBlocks initialBlocks={data.content_blocks} />
        </div>
      </section>

      {data.exercises.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Check your understanding
          </h2>
          <div className="mt-1 flex flex-col gap-3">
            {data.exercises.map((exercise) => (
              <ExerciseQuiz key={exercise.id} exercise={exercise} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

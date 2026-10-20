"use client";

import Link from "next/link";

import { ContentBlocks } from "@/components/content-blocks";
import { ExerciseQuiz } from "@/components/exercise-quiz";
import type { Note } from "@/components/notes-panel";
import { PomodoroTimer } from "@/components/pomodoro-timer";
import { useFetch } from "@/hooks/use-fetch";

type ExerciseSummary = { id: number; type: string; prompt: string; options: string[] };

type SectionSessionSummary = {
  id: number;
  title: string;
  sequence: number;
  duration_minutes: number;
};

type LearningSession = {
  id: number;
  title: string;
  duration_minutes: number;
  objective: string;
  content_blocks: {
    id: number;
    sequence: number;
    heading: string;
    body: string;
    note: Note | null;
    exercises: ExerciseSummary[];
    examples?: { label: string; content: string }[];
  }[];
  access_tier: string;
  section: { id: number; title: string; slug: string };
  section_sessions: SectionSessionSummary[];
  exercises: ExerciseSummary[];
};

function SectionLessonNav({
  topicSlug,
  sectionSlug,
  currentId,
  sessions,
}: {
  topicSlug: string;
  sectionSlug: string;
  currentId: number;
  sessions: SectionSessionSummary[];
}) {
  if (sessions.length <= 1) return null;

  const currentIndex = sessions.findIndex((s) => s.id === currentId);
  const prev = currentIndex > 0 ? sessions[currentIndex - 1] : null;
  const next = currentIndex < sessions.length - 1 ? sessions[currentIndex + 1] : null;
  const hrefFor = (sessionId: number) => `/learn/${topicSlug}/${sectionSlug}/${sessionId}`;

  return (
    <nav
      aria-label="Lessons in this section"
      className="rounded-lg border border-zinc-300 p-3 dark:border-zinc-700"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Lessons in this section
      </p>
      <ol className="mt-2 flex flex-col gap-0.5">
        {sessions.map((s) =>
          s.id === currentId ? (
            <li
              key={s.id}
              className="rounded px-2 py-1 text-sm font-medium text-black dark:text-zinc-50"
            >
              {s.sequence}. {s.title}
            </li>
          ) : (
            <li key={s.id}>
              <Link
                href={hrefFor(s.id)}
                className="block rounded px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-black dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
              >
                {s.sequence}. {s.title}
              </Link>
            </li>
          ),
        )}
      </ol>
      {(prev || next) && (
        <div className="mt-3 flex justify-between gap-2 border-t border-zinc-200 pt-3 text-sm dark:border-zinc-800">
          {prev ? (
            <Link
              href={hrefFor(prev.id)}
              className="text-zinc-600 hover:underline dark:text-zinc-400"
            >
              ← {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={hrefFor(next.id)}
              className="text-right text-zinc-600 hover:underline dark:text-zinc-400"
            >
              {next.title} →
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </nav>
  );
}

export function LessonContent({
  topicSlug,
  sectionSlug,
  sessionId,
}: {
  topicSlug: string;
  sectionSlug: string;
  sessionId: number;
}) {
  const state = useFetch<LearningSession>(`/api/v1/learning-sessions/${sessionId}`);

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
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{data.section.title}</p>
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          {data.title}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {data.duration_minutes} minutes
        </p>
      </header>

      <SectionLessonNav
        topicSlug={topicSlug}
        sectionSlug={sectionSlug}
        currentId={data.id}
        sessions={data.section_sessions}
      />

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

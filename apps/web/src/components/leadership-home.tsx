"use client";

import Link from "next/link";

import { useFetch } from "@/hooks/use-fetch";

type Competency = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
};

type StorySummary = {
  id: number;
  title: string;
  competency: Competency;
  result: string;
  created_at: string;
  updated_at: string;
};

export function LeadershipHome() {
  const competenciesState = useFetch<Competency[]>("/api/v1/leadership/competencies");
  const storiesState = useFetch<StorySummary[]>("/api/v1/leadership/stories");

  if (competenciesState.phase === "loading" || storiesState.phase === "loading") {
    return (
      <p role="status" aria-live="polite" className="text-zinc-600 dark:text-zinc-400">
        Loading leadership competencies…
      </p>
    );
  }

  if (competenciesState.phase !== "success" || storiesState.phase !== "success") {
    const message =
      competenciesState.phase === "error"
        ? competenciesState.message
        : storiesState.phase === "error"
          ? storiesState.message
          : "Not found";
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
      >
        <p className="font-medium">Could not load leadership data.</p>
        <p className="text-sm">{message}</p>
      </div>
    );
  }

  const competencies = competenciesState.data;
  const stories = storiesState.data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          STAR-method stories, tagged to a leadership competency.
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/leadership/questions"
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Practice questions
          </Link>
          <Link
            href="/leadership/stories/new"
            className="rounded-lg bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
          >
            + New story
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {competencies.map((competency) => {
          const competencyStories = stories.filter((s) => s.competency.id === competency.id);

          return (
            <div
              key={competency.id}
              className="rounded-lg border border-zinc-300 p-4 dark:border-zinc-700"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
                  {competency.title}
                </h2>
                <span className="shrink-0 rounded bg-zinc-200 px-2 py-0.5 text-xs font-medium tabular-nums text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {competencyStories.length} {competencyStories.length === 1 ? "story" : "stories"}
                </span>
              </div>
              {competency.description && (
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {competency.description}
                </p>
              )}

              {competencyStories.length > 0 && (
                <ul className="mt-3 flex flex-col gap-1">
                  {competencyStories.map((story) => (
                    <li key={story.id}>
                      <Link
                        href={`/leadership/stories/${story.id}`}
                        className="block rounded px-2 py-1 text-sm text-zinc-700 hover:bg-zinc-100 hover:underline dark:text-zinc-300 dark:hover:bg-zinc-900"
                      >
                        {story.title}
                      </Link>
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

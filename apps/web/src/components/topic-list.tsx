"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { API_BASE_URL } from "@/lib/config";

type TopicListItem = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  proficiency_tier: string;
  has_content: boolean;
  first_learning_session_id: number | null;
};

type DomainWithTopics = {
  id: number;
  name: string;
  description: string | null;
  topics: TopicListItem[];
};

type State =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "success"; domains: DomainWithTopics[] };

const TIER_LABELS: Record<string, string> = {
  D: "Deep mastery",
  W: "Working proficiency",
  L: "Architectural literacy",
  G: "Leadership",
};

export function TopicList() {
  const [state, setState] = useState<State>({ phase: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/topics`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }

        const domains = (await response.json()) as DomainWithTopics[];
        setState({ phase: "success", domains });
      } catch (error) {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : "Unknown error";
        setState({ phase: "error", message });
      }
    }

    load();
    return () => controller.abort();
  }, []);

  if (state.phase === "loading") {
    return (
      <p role="status" aria-live="polite" className="text-zinc-600 dark:text-zinc-400">
        Loading curriculum…
      </p>
    );
  }

  if (state.phase === "error") {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
      >
        <p className="font-medium">Could not load the curriculum.</p>
        <p className="text-sm">{state.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {state.domains.map((domain) => {
        const completed = domain.topics.filter((topic) => topic.has_content).length;
        const total = domain.topics.length;

        return (
          <details key={domain.id} open={completed > 0} className="group">
            <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4 rounded-lg py-1 marker:content-none">
              <span className="flex items-baseline gap-2">
                <span
                  aria-hidden="true"
                  className="inline-block text-zinc-400 transition-transform group-open:rotate-90 dark:text-zinc-500"
                >
                  ▶
                </span>
                <span className="text-lg font-semibold text-black dark:text-zinc-50">
                  {domain.name}
                </span>
              </span>
              <span className="shrink-0 rounded bg-zinc-200 px-2 py-0.5 text-xs font-medium tabular-nums text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {completed}/{total} available
              </span>
            </summary>

            {domain.description && (
              <p className="ml-6 text-sm text-zinc-500 dark:text-zinc-400">
                {domain.description}
              </p>
            )}
            <ul className="mt-3 ml-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {domain.topics.map((topic) => (
                <li key={topic.id}>
                  {topic.has_content && topic.first_learning_session_id ? (
                    <Link
                      href={`/learning/${topic.first_learning_session_id}`}
                      className="flex h-full flex-col rounded-lg border border-zinc-300 px-4 py-3 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                    >
                      <span className="font-medium text-black dark:text-zinc-50">
                        {topic.title}
                      </span>
                      <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {TIER_LABELS[topic.proficiency_tier] ?? topic.proficiency_tier}
                      </span>
                    </Link>
                  ) : (
                    <div
                      aria-disabled="true"
                      className="flex h-full flex-col rounded-lg border border-dashed border-zinc-300 px-4 py-3 opacity-60 dark:border-zinc-700"
                    >
                      <span className="flex items-center justify-between font-medium text-zinc-600 dark:text-zinc-400">
                        {topic.title}
                        <span className="ml-2 rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                          WIP
                        </span>
                      </span>
                      <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                        {TIER_LABELS[topic.proficiency_tier] ?? topic.proficiency_tier}
                      </span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </details>
        );
      })}
    </div>
  );
}

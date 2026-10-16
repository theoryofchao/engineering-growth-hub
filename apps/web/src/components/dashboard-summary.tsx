"use client";

import { useEffect, useState } from "react";

import { API_BASE_URL } from "@/lib/config";

type TopicProgress = {
  topic_id: number;
  title: string;
  slug: string;
  status: string;
  exercises_attempted: number;
  exercises_correct: number;
};

type Dashboard = {
  total_study_seconds: number;
  topics: TopicProgress[];
};

type State =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "success"; data: Dashboard };

const STATUS_LABELS: Record<string, string> = {
  not_started: "Not started",
  learning: "Learning",
  practiced: "Practiced",
  mastered: "Mastered",
};

function formatHoursMinutes(totalSeconds: number): string {
  const minutes = Math.round(totalSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes}m`;
  return `${hours}h ${remainingMinutes}m`;
}

export function DashboardSummary() {
  const [state, setState] = useState<State>({ phase: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/dashboard/summary`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }

        const data = (await response.json()) as Dashboard;
        setState({ phase: "success", data });
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
        Loading dashboard…
      </p>
    );
  }

  if (state.phase === "error") {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
      >
        <p className="font-medium">Could not load the dashboard.</p>
        <p className="text-sm">{state.message}</p>
      </div>
    );
  }

  const { data } = state;

  if (data.topics.length === 0) {
    return (
      <p className="text-zinc-600 dark:text-zinc-400">
        No lessons started yet. Pick a topic from the homepage to begin.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-zinc-300 px-4 py-3 dark:border-zinc-700">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Total time studied</p>
        <p className="text-2xl font-semibold text-black dark:text-zinc-50">
          {formatHoursMinutes(data.total_study_seconds)}
        </p>
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-300 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            <th className="py-2 font-medium">Topic</th>
            <th className="py-2 font-medium">Status</th>
            <th className="py-2 font-medium">Exercises</th>
          </tr>
        </thead>
        <tbody>
          {data.topics.map((topic) => (
            <tr key={topic.topic_id} className="border-b border-zinc-200 dark:border-zinc-800">
              <td className="py-2 text-black dark:text-zinc-50">{topic.title}</td>
              <td className="py-2 text-zinc-600 dark:text-zinc-400">
                {STATUS_LABELS[topic.status] ?? topic.status}
              </td>
              <td className="py-2 text-zinc-600 dark:text-zinc-400">
                {topic.exercises_correct} / {topic.exercises_attempted} correct
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

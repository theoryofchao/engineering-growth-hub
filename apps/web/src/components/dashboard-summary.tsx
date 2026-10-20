"use client";

import { useFetch } from "@/hooks/use-fetch";

type SectionProgress = {
  section_id: number;
  title: string;
  slug: string;
  status: string;
  exercises_attempted: number;
  exercises_correct: number;
};

type Dashboard = {
  total_study_seconds: number;
  sections: SectionProgress[];
};

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
  const state = useFetch<Dashboard>("/api/v1/dashboard/summary");

  if (state.phase === "loading") {
    return (
      <p role="status" aria-live="polite" className="text-zinc-600 dark:text-zinc-400">
        Loading dashboard…
      </p>
    );
  }

  if (state.phase === "error" || state.phase === "not-found") {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
      >
        <p className="font-medium">Could not load the dashboard.</p>
        <p className="text-sm">
          {state.phase === "error" ? state.message : "Dashboard endpoint not found"}
        </p>
      </div>
    );
  }

  const { data } = state;

  if (data.sections.length === 0) {
    return (
      <p className="text-zinc-600 dark:text-zinc-400">
        No lessons started yet. Pick a section from the homepage to begin.
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
            <th className="py-2 font-medium">Section</th>
            <th className="py-2 font-medium">Status</th>
            <th className="py-2 font-medium">Exercises</th>
          </tr>
        </thead>
        <tbody>
          {data.sections.map((section) => (
            <tr key={section.section_id} className="border-b border-zinc-200 dark:border-zinc-800">
              <td className="py-2 text-black dark:text-zinc-50">{section.title}</td>
              <td className="py-2 text-zinc-600 dark:text-zinc-400">
                {STATUS_LABELS[section.status] ?? section.status}
              </td>
              <td className="py-2 text-zinc-600 dark:text-zinc-400">
                {section.exercises_correct} / {section.exercises_attempted} correct
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

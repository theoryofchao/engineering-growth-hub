"use client";

import { API_BASE_URL } from "@/lib/config";
import { useFetch } from "@/hooks/use-fetch";

type HealthResponse = {
  status: string;
  service: string;
  database: string;
};

export function HealthStatus() {
  const state = useFetch<HealthResponse>("/api/v1/health");

  if (state.phase === "loading") {
    return (
      <p role="status" aria-live="polite" className="text-zinc-600 dark:text-zinc-400">
        Checking API connectivity…
      </p>
    );
  }

  if (state.phase === "error" || state.phase === "not-found") {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
      >
        <p className="font-medium">Could not reach the API.</p>
        <p className="text-sm">
          {state.phase === "error" ? state.message : "Health endpoint not found"}
        </p>
        <p className="mt-2 text-sm">
          Expected it at <code className="font-mono">{API_BASE_URL}</code>. Is the Flask API
          running?
        </p>
      </div>
    );
  }

  const isHealthy = state.data.status === "ok" && state.data.database === "ok";

  return (
    <div
      role="status"
      className={`rounded-lg border px-4 py-3 ${
        isHealthy
          ? "border-green-300 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
          : "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
      }`}
    >
      <p className="font-medium">API reachable: {state.data.service}</p>
      <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-2 text-sm">
        <dt className="text-zinc-500 dark:text-zinc-400">status</dt>
        <dd>{state.data.status}</dd>
        <dt className="text-zinc-500 dark:text-zinc-400">database</dt>
        <dd>{state.data.database}</dd>
      </dl>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

import { API_BASE_URL } from "@/lib/config";

export type FetchState<T> =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "not-found" }
  | { phase: "success"; data: T };

/**
 * Fetches `${API_BASE_URL}${path}` on mount and whenever `path` changes,
 * aborting the previous request on cleanup. Pass `null` to skip fetching
 * (e.g. while a dependency the path is built from isn't ready yet).
 *
 * This is the fetch+AbortController+loading/error/success lifecycle that
 * was independently duplicated across health-status.tsx,
 * dashboard-summary.tsx, curriculum-tree.tsx, section-overview.tsx, and
 * lesson-content.tsx -- see docs/decisions/0022-frontend-fetch-hook-and-component-splits.md.
 */
export function useFetch<T>(path: string | null): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({ phase: "loading" });

  useEffect(() => {
    if (path === null) return;

    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(`${API_BASE_URL}${path}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (response.status === 404) {
          setState({ phase: "not-found" });
          return;
        }

        if (!response.ok) {
          throw new Error(`API responded with status ${response.status}`);
        }

        const data = (await response.json()) as T;
        setState({ phase: "success", data });
      } catch (error) {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : "Unknown error";
        setState({ phase: "error", message });
      }
    }

    load();
    return () => controller.abort();
  }, [path]);

  return state;
}

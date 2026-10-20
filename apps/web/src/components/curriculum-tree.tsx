"use client";

import Link from "next/link";
import { useState } from "react";

import { DevBypassBanner } from "@/components/dev-bypass-banner";
import { useFetch } from "@/hooks/use-fetch";

type TopicRef = {
  name: string;
  slug: string;
};

type PrerequisiteSummary = {
  id: number;
  title: string;
  slug: string;
  topic: TopicRef;
  status: string;
};

type SectionListItem = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  proficiency_tier: string;
  has_content: boolean;
  first_learning_session_id: number | null;
  status: string;
  is_locked: boolean;
  unmet_prerequisites: PrerequisiteSummary[];
  dev_prerequisites_bypassed: boolean;
};

type TopicWithSections = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sections: SectionListItem[];
};

const TIER_LABELS: Record<string, string> = {
  D: "Deep mastery",
  W: "Working proficiency",
  L: "Architectural literacy",
  G: "Leadership",
};

const STATUS_LABELS: Record<string, string> = {
  not_started: "Not started",
  learning: "Learning",
  practiced: "Practiced",
  mastered: "Mastered",
};

const STATUS_FILTER_OPTIONS = ["all", "not_started", "learning", "practiced", "mastered"] as const;
type StatusFilter = (typeof STATUS_FILTER_OPTIONS)[number];

type LockFilter = "all" | "locked" | "unlocked";

export function CurriculumTree() {
  const state = useFetch<TopicWithSections[]>("/api/v1/topics");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [lockFilter, setLockFilter] = useState<LockFilter>("all");

  if (state.phase === "loading") {
    return (
      <p role="status" aria-live="polite" className="text-zinc-600 dark:text-zinc-400">
        Loading curriculum…
      </p>
    );
  }

  if (state.phase === "error" || state.phase === "not-found") {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
      >
        <p className="font-medium">Could not load the curriculum.</p>
        <p className="text-sm">
          {state.phase === "error" ? state.message : "Curriculum endpoint not found"}
        </p>
      </div>
    );
  }

  const topics = state.data;

  const matchesFilters = (section: SectionListItem) =>
    (statusFilter === "all" || section.status === statusFilter) &&
    (lockFilter === "all" || (lockFilter === "locked" ? section.is_locked : !section.is_locked));

  const devBypassActive = topics.some((topic) =>
    topic.sections.some((section) => section.dev_prerequisites_bypassed),
  );

  return (
    <div className="flex flex-col gap-4">
      {devBypassActive && <DevBypassBanner />}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-zinc-500 dark:text-zinc-400">Progress</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            className="rounded border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="all">All</option>
            {STATUS_FILTER_OPTIONS.filter((option) => option !== "all").map((option) => (
              <option key={option} value={option}>
                {STATUS_LABELS[option]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-zinc-500 dark:text-zinc-400">Lock status</span>
          <select
            value={lockFilter}
            onChange={(event) => setLockFilter(event.target.value as LockFilter)}
            className="rounded border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="all">All</option>
            <option value="unlocked">Unlocked</option>
            <option value="locked">Locked</option>
          </select>
        </label>
      </div>

      {topics.map((topic) => {
        const visibleSections = topic.sections.filter(matchesFilters);
        if (visibleSections.length === 0) return null;

        const completed = topic.sections.filter((section) => section.has_content).length;
        const total = topic.sections.length;

        return (
          <details key={topic.id} open={completed > 0} className="group">
            <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4 rounded-lg py-1 marker:content-none">
              <span className="flex items-baseline gap-2">
                <span
                  aria-hidden="true"
                  className="inline-block text-zinc-400 transition-transform group-open:rotate-90 dark:text-zinc-500"
                >
                  ▶
                </span>
                <span className="text-lg font-semibold text-black dark:text-zinc-50">
                  {topic.name}
                </span>
              </span>
              <span className="shrink-0 rounded bg-zinc-200 px-2 py-0.5 text-xs font-medium tabular-nums text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {completed}/{total} available
              </span>
            </summary>

            {topic.description && (
              <p className="ml-6 text-sm text-zinc-500 dark:text-zinc-400">{topic.description}</p>
            )}
            <ul className="mt-3 ml-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {visibleSections.map((section) => (
                <li key={section.id}>
                  {section.has_content ? (
                    <Link
                      href={`/learn/${topic.slug}/${section.slug}`}
                      className="flex h-full flex-col rounded-lg border border-zinc-300 px-4 py-3 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                    >
                      <span className="flex items-center justify-between font-medium text-black dark:text-zinc-50">
                        {section.title}
                        {section.is_locked && (
                          <span className="ml-2 rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                            Locked
                          </span>
                        )}
                      </span>
                      <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {TIER_LABELS[section.proficiency_tier] ?? section.proficiency_tier}
                      </span>
                    </Link>
                  ) : (
                    <div
                      aria-disabled="true"
                      className="flex h-full flex-col rounded-lg border border-dashed border-zinc-300 px-4 py-3 opacity-60 dark:border-zinc-700"
                    >
                      <span className="flex items-center justify-between font-medium text-zinc-600 dark:text-zinc-400">
                        {section.title}
                        <span className="ml-2 rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                          WIP
                        </span>
                      </span>
                      <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                        {TIER_LABELS[section.proficiency_tier] ?? section.proficiency_tier}
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

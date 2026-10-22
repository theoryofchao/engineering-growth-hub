"use client";

import Link from "next/link";

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

type LearningSessionSummary = {
  id: number;
  title: string;
  sequence: number;
  duration_minutes: number;
  is_complete: boolean;
};

type SectionDetail = {
  id: number;
  title: string;
  slug: string;
  topic: TopicRef;
  description: string | null;
  proficiency_tier: string;
  status: string;
  is_locked: boolean;
  learning_sessions: LearningSessionSummary[];
  is_fully_complete: boolean;
  prerequisites: PrerequisiteSummary[];
  unmet_prerequisites: PrerequisiteSummary[];
  dev_prerequisites_bypassed: boolean;
};

function CompleteCheck({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      className={`h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-500 ${className}`}
    >
      <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z" />
    </svg>
  );
}

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

export function SectionOverview({
  topicSlug,
  sectionSlug,
}: {
  topicSlug: string;
  sectionSlug: string;
}) {
  const state = useFetch<SectionDetail>(`/api/v1/sections/${sectionSlug}`);

  if (state.phase === "loading") {
    return (
      <p role="status" aria-live="polite" className="text-zinc-600 dark:text-zinc-400">
        Loading section…
      </p>
    );
  }

  if (state.phase === "not-found") {
    return (
      <div
        role="alert"
        className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
      >
        <p className="font-medium">Section not found.</p>
      </div>
    );
  }

  if (state.phase === "error") {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
      >
        <p className="font-medium">Could not load the section.</p>
        <p className="text-sm">{state.message}</p>
      </div>
    );
  }

  const { data } = state;

  return (
    <article className="flex flex-col gap-6">
      <header>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {data.topic.name} · {TIER_LABELS[data.proficiency_tier] ?? data.proficiency_tier}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          {data.title}
        </h1>
        {data.description && (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{data.description}</p>
        )}
        <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          Status: {STATUS_LABELS[data.status] ?? data.status}
          {data.is_fully_complete && (
            <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-500">
              <CompleteCheck /> Section complete
            </span>
          )}
        </p>
      </header>

      {data.dev_prerequisites_bypassed && <DevBypassBanner />}

      {data.is_locked && (
        <div
          role="alert"
          className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
        >
          <p className="font-medium">Locked</p>
          <p className="mt-1 text-sm">Complete these sections first:</p>
          <ul className="mt-2 flex flex-col gap-1">
            {data.unmet_prerequisites.map((prereq) => (
              <li key={prereq.id}>
                <Link
                  href={`/learn/${prereq.topic.slug}/${prereq.slug}`}
                  className="text-sm underline"
                >
                  {prereq.title}
                </Link>
                <span className="ml-2 text-xs opacity-75">
                  ({STATUS_LABELS[prereq.status] ?? prereq.status})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Lessons
        </h2>

        {data.learning_sessions.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            No lessons authored yet for this section.
          </p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {data.learning_sessions.map((session) => (
              <li key={session.id}>
                {data.is_locked ? (
                  <div
                    aria-disabled="true"
                    className="flex items-center justify-between rounded-lg border border-dashed border-zinc-300 px-4 py-3 opacity-60 dark:border-zinc-700"
                  >
                    <span className="font-medium text-zinc-600 dark:text-zinc-400">
                      {session.sequence}. {session.title}
                    </span>
                    <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      Locked
                    </span>
                  </div>
                ) : (
                  <Link
                    href={`/learn/${topicSlug}/${sectionSlug}/${session.id}`}
                    className="flex items-center justify-between rounded-lg border border-zinc-300 px-4 py-3 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                  >
                    <span className="flex items-center gap-1.5 font-medium text-black dark:text-zinc-50">
                      {session.sequence}. {session.title}
                      {session.is_complete && <CompleteCheck />}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {session.duration_minutes} min
                    </span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";

import { ExerciseSwitch } from "@/components/exercise-switch";
import { useFetch } from "@/hooks/use-fetch";
import type { Exercise } from "@/lib/exercise-types";

type ReviewQueueItem = {
  exercise: Exercise;
  box: number;
  due_at: string;
  topic: { name: string; slug: string };
  section_title: string;
  section_slug: string;
  learning_session_id: number;
  learning_session_title: string;
};

/** Spaced-repetition review queue: exercises already attempted, resurfaced
 * on a Leitner-box schedule (see app/services/exercises_service.py).
 * Reuses ExerciseSwitch so answering a review looks exactly like
 * answering the exercise the first time, including inline feedback.
 */
export function ReviewQueue() {
  const fetchState = useFetch<ReviewQueueItem[]>("/api/v1/reviews/due");

  // useFetch has no refetch escape hatch, so the fetched list is synced
  // into local state once (the same bail-out-and-rerender pattern as
  // questions-home.tsx) and then only mutated locally from here on --
  // answering an item here shouldn't make it vanish mid-reveal, it
  // should just render its own result like the quiz/code pages do.
  const [items, setItems] = useState<ReviewQueueItem[]>([]);
  const [syncedFromFetch, setSyncedFromFetch] = useState(false);
  if (fetchState.phase === "success" && !syncedFromFetch) {
    setItems(fetchState.data);
    setSyncedFromFetch(true);
  }

  const [answeredIds, setAnsweredIds] = useState<Set<number>>(new Set());

  if (fetchState.phase === "loading") {
    return (
      <p role="status" aria-live="polite" className="text-zinc-600 dark:text-zinc-400">
        Loading your review queue…
      </p>
    );
  }

  if (fetchState.phase === "error") {
    return (
      <p role="alert" className="text-sm text-red-700 dark:text-red-400">
        Could not load your review queue: {fetchState.message}
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-zinc-600 dark:text-zinc-400">
        Nothing due for review right now. Come back after you&apos;ve answered a few exercises --
        they&apos;ll resurface here once their schedule comes due.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {items.map((item) => (
        <div key={item.exercise.id} className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <Link
              href={`/learn/${item.topic.slug}/${item.section_slug}/${item.learning_session_id}`}
              className="hover:underline"
            >
              {item.section_title} → {item.learning_session_title}
            </Link>
            <span className="shrink-0">
              Box {item.box}
              {answeredIds.has(item.exercise.id) && (
                <span className="ml-2 text-green-700 dark:text-green-400">Reviewed</span>
              )}
            </span>
          </div>
          <ExerciseSwitch
            exercise={item.exercise}
            onSubmitted={() => setAnsweredIds((current) => new Set(current).add(item.exercise.id))}
          />
        </div>
      ))}
    </div>
  );
}

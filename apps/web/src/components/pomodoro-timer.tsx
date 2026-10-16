"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { API_BASE_URL } from "@/lib/config";

type StudySessionStatus = "active" | "paused" | "completed";

type StudySession = {
  id: number;
  learning_session_id: number;
  mode_minutes: number;
  break_minutes: number;
  status: StudySessionStatus;
  elapsed_seconds: number;
  completed_at: string | null;
};

type State =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "idle" }
  | { phase: "running"; session: StudySession; displaySeconds: number }
  | { phase: "completed"; session: StudySession };

function storageKey(learningSessionId: number): string {
  return `egh:study-session:${learningSessionId}`;
}

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function PomodoroTimer({
  learningSessionId,
  modeMinutes,
}: {
  learningSessionId: number;
  modeMinutes: number;
}) {
  const [state, setState] = useState<State>({ phase: "loading" });
  const fetchedAtRef = useRef<number>(0);

  const applySession = useCallback((session: StudySession) => {
    if (session.status === "completed") {
      try {
        localStorage.removeItem(storageKey(session.learning_session_id));
      } catch {
        // ignore storage access errors (private mode, etc.)
      }
      setState({ phase: "completed", session });
      return;
    }

    fetchedAtRef.current = Date.now();
    setState({ phase: "running", session, displaySeconds: session.elapsed_seconds });
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function restore() {
      let storedId: string | null = null;
      try {
        storedId = localStorage.getItem(storageKey(learningSessionId));
      } catch {
        storedId = null;
      }

      if (!storedId) {
        setState({ phase: "idle" });
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/study-sessions/${storedId}`,
          { signal: controller.signal, cache: "no-store" },
        );

        if (!response.ok) {
          try {
            localStorage.removeItem(storageKey(learningSessionId));
          } catch {
            // ignore
          }
          setState({ phase: "idle" });
          return;
        }

        const session = (await response.json()) as StudySession;
        applySession(session);
      } catch (error) {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : "Unknown error";
        setState({ phase: "error", message });
      }
    }

    restore();
    return () => controller.abort();
  }, [learningSessionId, applySession]);

  const isActivelyRunning = state.phase === "running" && state.session.status === "active";

  useEffect(() => {
    if (!isActivelyRunning) return;

    const interval = setInterval(() => {
      setState((current) => {
        if (current.phase !== "running") return current;
        const elapsedSinceFetch = (Date.now() - fetchedAtRef.current) / 1000;
        return {
          ...current,
          displaySeconds: current.session.elapsed_seconds + elapsedSinceFetch,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActivelyRunning]);

  async function start() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/study-sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learning_session_id: learningSessionId,
          mode_minutes: modeMinutes,
        }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const session = (await response.json()) as StudySession;
      try {
        localStorage.setItem(storageKey(learningSessionId), String(session.id));
      } catch {
        // ignore storage access errors
      }
      applySession(session);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setState({ phase: "error", message });
    }
  }

  async function sendAction(sessionId: number, action: "pause" | "resume" | "complete") {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/study-sessions/${sessionId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        },
      );

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const session = (await response.json()) as StudySession;
      applySession(session);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setState({ phase: "error", message });
    }
  }

  if (state.phase === "loading") {
    return (
      <p role="status" aria-live="polite" className="text-sm text-zinc-500 dark:text-zinc-400">
        Loading timer…
      </p>
    );
  }

  if (state.phase === "error") {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
      >
        <p className="font-medium">Timer error.</p>
        <p className="text-sm">{state.message}</p>
      </div>
    );
  }

  if (state.phase === "idle") {
    return (
      <div className="rounded-lg border border-zinc-300 px-4 py-3 dark:border-zinc-700">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Start a {modeMinutes}-minute focus session for this lesson.
        </p>
        <button
          type="button"
          onClick={start}
          className="mt-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          Start {modeMinutes}-min session
        </button>
      </div>
    );
  }

  if (state.phase === "completed") {
    return (
      <div
        role="status"
        className="rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
      >
        <p className="font-medium">
          Session complete — {formatClock(state.session.elapsed_seconds)} studied.
        </p>
        <button
          type="button"
          onClick={() => setState({ phase: "idle" })}
          className="mt-2 rounded-lg border border-green-400 px-3 py-1.5 text-sm font-medium hover:bg-green-100 dark:border-green-700 dark:hover:bg-green-900"
        >
          Start another session
        </button>
      </div>
    );
  }

  const { session, displaySeconds } = state;
  const targetSeconds = modeMinutes * 60;
  const timeIsUp = displaySeconds >= targetSeconds;

  return (
    <div
      role="status"
      className="rounded-lg border border-zinc-300 px-4 py-3 dark:border-zinc-700"
    >
      <p className="text-3xl font-semibold tabular-nums text-black dark:text-zinc-50">
        {formatClock(displaySeconds)}
        <span className="ml-2 text-sm font-normal text-zinc-500 dark:text-zinc-400">
          / {modeMinutes}:00
        </span>
      </p>

      {timeIsUp && (
        <p className="mt-1 text-sm font-medium text-amber-700 dark:text-amber-400">
          Time&apos;s up! Take a {session.break_minutes}-minute break, or keep going.
        </p>
      )}

      <div className="mt-3 flex gap-2">
        {session.status === "active" ? (
          <button
            type="button"
            onClick={() => sendAction(session.id, "pause")}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Pause
          </button>
        ) : (
          <button
            type="button"
            onClick={() => sendAction(session.id, "resume")}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Resume
          </button>
        )}
        <button
          type="button"
          onClick={() => sendAction(session.id, "complete")}
          className="rounded-lg bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          Finish session
        </button>
      </div>
    </div>
  );
}

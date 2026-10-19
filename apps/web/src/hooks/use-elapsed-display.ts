"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Pure "ticking clock" display math, extracted out of pomodoro-timer.tsx
 * (which also owns session-lifecycle fetch calls and rendering -- see
 * docs/decisions/0022-frontend-fetch-hook-and-component-splits.md).
 *
 * The caller reports a fresh baseline via `setBaseline(elapsedSeconds)`
 * every time a new StudySession snapshot arrives from the server (on
 * restore/start/pause/resume/complete); this hook then recomputes
 * `baseline + time since that snapshot` once a second while `isRunning`
 * is true, so the displayed time keeps advancing between server round
 * trips without drifting (recomputed fresh from the anchor each tick,
 * not incremented by 1 each time).
 */
export function useElapsedDisplay(isRunning: boolean) {
  const [displaySeconds, setDisplaySeconds] = useState(0);
  // fetchedAt starts at 0, not Date.now() -- reading the clock during
  // render is impure. It's always overwritten by setBaseline before any
  // tick can read it, since ticking only starts once isRunning is true,
  // which only happens after a session (and thus a baseline) exists.
  const baselineRef = useRef({ seconds: 0, fetchedAt: 0 });

  const setBaseline = useCallback((elapsedSeconds: number) => {
    baselineRef.current = { seconds: elapsedSeconds, fetchedAt: Date.now() };
    setDisplaySeconds(elapsedSeconds);
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const elapsedSinceFetch = (Date.now() - baselineRef.current.fetchedAt) / 1000;
      setDisplaySeconds(baselineRef.current.seconds + elapsedSinceFetch);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  return { displaySeconds, setBaseline };
}

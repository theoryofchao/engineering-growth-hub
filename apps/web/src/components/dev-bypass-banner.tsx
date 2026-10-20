"use client";

/**
 * Loud, hard-to-miss warning shown whenever the API reports that
 * DEV_UNLOCK_ALL_SECTIONS is active (apps/api/app/config.py) -- rendered
 * only from real API data, never guessed client-side, so it can't show
 * up unless the backend itself is actually bypassing prerequisite locks.
 */
export function DevBypassBanner() {
  return (
    <div
      role="alert"
      className="rounded-lg border-2 border-dashed border-red-500 bg-red-100 px-4 py-2 text-sm font-semibold text-red-900 dark:bg-red-950 dark:text-red-200"
    >
      ⚠ DEV MODE — prerequisite locks are bypassed (DEV_UNLOCK_ALL_SECTIONS). Never ship this on.
    </div>
  );
}

"use client";

import { useEffect } from "react";

import { flush, flushViaBeacon, startPeriodicFlush } from "@/lib/completion-sync";

/**
 * Mount once (not per-component) to run the periodic safety-net flush
 * and the best-effort flush on tab-hide/unload. Debounced flushes don't
 * need this running -- use-block-completions.ts schedules those directly
 * from each toggle.
 */
export function useCompletionSync(): void {
  useEffect(() => {
    const stopPeriodic = startPeriodicFlush();

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") flushViaBeacon();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", flushViaBeacon);

    void flush(); // catch up on anything left dirty from a previous session

    return () => {
      stopPeriodic();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", flushViaBeacon);
    };
  }, []);
}

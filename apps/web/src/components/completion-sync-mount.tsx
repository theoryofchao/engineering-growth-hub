"use client";

import { useCompletionSync } from "@/hooks/use-completion-sync";

/**
 * Renders nothing -- mounted once in RootLayout purely to run the
 * app-wide periodic and tab-hide/unload completion-sync triggers (see
 * use-completion-sync.ts, ADR 0030). The debounced flush doesn't need
 * this; it's scheduled directly from each toggle instead.
 */
export function CompletionSyncMount() {
  useCompletionSync();
  return null;
}

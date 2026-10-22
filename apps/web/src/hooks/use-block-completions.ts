"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  CHANGE_EVENT,
  type CompletionMap,
  readAll,
  toggleCompletion,
} from "@/lib/completion-store";
import { scheduleDebouncedFlush } from "@/lib/completion-sync";

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(CHANGE_EVENT, onStoreChange);
}

const EMPTY_MAP: CompletionMap = {};

function getServerSnapshot(): CompletionMap {
  return EMPTY_MAP;
}

/**
 * Reactive view of the locally-known completion state for every block
 * that's been touched this session or hydrated from the server (see
 * completion-store.ts). `useSyncExternalStore`-backed, same convention as
 * use-default-view-mode.ts etc., since multiple components (a slide's
 * checkmark, a lesson-wide progress count) read this at once.
 */
export function useBlockCompletions(): {
  completions: CompletionMap;
  toggle: (blockId: number) => void;
} {
  const completions = useSyncExternalStore(subscribe, readAll, getServerSnapshot);

  const toggle = useCallback((blockId: number) => {
    toggleCompletion(blockId);
    scheduleDebouncedFlush();
  }, []);

  return { completions, toggle };
}

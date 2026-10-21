"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "egh:default-view-mode";
const CHANGE_EVENT = "egh:default-view-mode-changed";

export type ViewMode = "page" | "slide";

function isViewMode(value: string): value is ViewMode {
  return value === "page" || value === "slide";
}

function readStored(): ViewMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored !== null && isViewMode(stored) ? stored : "page";
  } catch {
    return "page"; // ignore storage access errors (private mode, etc.)
  }
}

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(CHANGE_EVENT, onStoreChange);
}

function getServerSnapshot(): ViewMode {
  return "page";
}

/**
 * The view mode (page vs. slide) a lesson should open in by default,
 * persisted in localStorage. Only a starting point for a fresh lesson
 * load -- a lesson's own in-session toggle (ContentBlocks) is free to
 * diverge from this afterward without the default forcing itself back.
 *
 * `useSyncExternalStore`-backed (see use-content-width.ts's docstring
 * for why): both the settings panel and a lesson page's ContentBlocks
 * read this simultaneously, and a plain `useState` per component
 * wouldn't notice a change made through the other one.
 */
export function useDefaultViewMode(): [ViewMode, (value: ViewMode) => void] {
  const viewMode = useSyncExternalStore(subscribe, readStored, getServerSnapshot);

  function update(value: ViewMode) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // ignore storage access errors
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  return [viewMode, update];
}

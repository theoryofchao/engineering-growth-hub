"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "egh:show-section-boundaries-default";
const CHANGE_EVENT = "egh:show-section-boundaries-default-changed";

function readStored(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false; // ignore storage access errors (private mode, etc.)
  }
}

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(CHANGE_EVENT, onStoreChange);
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Whether a lesson's page view should show section boundaries by
 * default, persisted in localStorage. See use-content-width.ts's
 * docstring for why this is `useSyncExternalStore`-backed rather than
 * a plain `useState` restored from an effect -- the settings panel and
 * a lesson page's ContentBlocks both read this at once.
 */
export function useShowSectionBoundariesDefault(): [boolean, (value: boolean) => void] {
  const showByDefault = useSyncExternalStore(subscribe, readStored, getServerSnapshot);

  function update(value: boolean) {
    try {
      localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
      // ignore storage access errors
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  return [showByDefault, update];
}

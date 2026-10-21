"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "egh:content-width-vw";
const CHANGE_EVENT = "egh:content-width-vw-changed";
const MIN_VW = 40;
const MAX_VW = 100;

function clamp(value: number): number {
  return Math.min(MAX_VW, Math.max(MIN_VW, value));
}

function readStored(): number | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) return null;
    const parsed = Number(stored);
    return Number.isNaN(parsed) ? null : clamp(parsed);
  } catch {
    return null; // ignore storage access errors (private mode, etc.)
  }
}

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(CHANGE_EVENT, onStoreChange);
}

function getServerSnapshot(): number | null {
  return null; // matches the page's default Tailwind max-width pre-hydration
}

/**
 * A user-tunable content width, as a percentage of the viewport (not a
 * fixed pixel cap) so it actually scales with the viewport instead of
 * just being "a bigger fixed number". `null` means "use the page's
 * default Tailwind max-width" -- set only once the user touches the
 * slider, persisted in localStorage so an experiment survives a reload.
 *
 * Backed by `useSyncExternalStore` (not a local `useState` restored
 * from an effect) because this hook now has more than one simultaneous
 * consumer -- the site-wide settings panel's slider and every page's
 * `ContentWidthContainer` -- and plain `useState` instances don't talk
 * to each other: moving the slider would silently do nothing to the
 * page's actual width without this. The `CHANGE_EVENT` is dispatched by
 * `update` below so every mounted instance re-reads storage immediately,
 * not just the one that made the change.
 */
export function useContentWidth(): [number | null, (value: number | null) => void] {
  const widthVw = useSyncExternalStore(subscribe, readStored, getServerSnapshot);

  function update(value: number | null) {
    const next = value === null ? null : clamp(value);
    try {
      if (next === null) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, String(next));
      }
    } catch {
      // ignore storage access errors
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  return [widthVw, update];
}

export { MIN_VW, MAX_VW };

"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "egh:content-width-vw";
const MIN_VW = 40;
const MAX_VW = 100;

function clamp(value: number): number {
  return Math.min(MAX_VW, Math.max(MIN_VW, value));
}

/**
 * A user-tunable content width, as a percentage of the viewport (not a
 * fixed pixel cap) so it actually scales with the viewport instead of
 * just being "a bigger fixed number". `null` means "use the page's
 * default Tailwind max-width" -- set only once the user touches the
 * slider, persisted in localStorage so an experiment survives a reload.
 */
export function useContentWidth(): [number | null, (value: number | null) => void] {
  const [widthVw, setWidthVw] = useState<number | null>(null);

  useEffect(() => {
    function restore() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
          const parsed = Number(stored);
          if (!Number.isNaN(parsed)) setWidthVw(clamp(parsed));
        }
      } catch {
        // ignore storage access errors (private mode, etc.)
      }
    }

    restore();
  }, []);

  function update(value: number | null) {
    const next = value === null ? null : clamp(value);
    setWidthVw(next);
    try {
      if (next === null) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, String(next));
      }
    } catch {
      // ignore storage access errors
    }
  }

  return [widthVw, update];
}

export { MIN_VW, MAX_VW };

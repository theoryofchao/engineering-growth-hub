"use client";

import { MAX_VW, MIN_VW, useContentWidth } from "@/hooks/use-content-width";

const DEFAULT_SLIDER_VW = 55;

/**
 * Wraps a page's main content area with a user-tunable max-width, as a
 * percentage of the viewport, so the content actually scales with the
 * viewport instead of being capped at a fixed pixel width regardless of
 * screen size. Experimental: the slider exists so the ideal value can
 * be found by testing, not because a specific value is known to be
 * right yet.
 */
export function ContentWidthContainer({ children }: { children: React.ReactNode }) {
  const [widthVw, setWidthVw] = useContentWidth();

  return (
    <main
      className="flex w-full max-w-2xl flex-col gap-6 px-6 py-16"
      style={widthVw !== null ? { maxWidth: `${widthVw}vw` } : undefined}
    >
      <details className="rounded-lg border border-dashed border-zinc-300 p-3 text-sm dark:border-zinc-700">
        <summary className="cursor-pointer font-medium text-zinc-600 dark:text-zinc-400">
          Content width {widthVw !== null ? `(${widthVw}vw)` : "(default)"}
        </summary>
        <div className="mt-2 flex items-center gap-3">
          <input
            type="range"
            min={MIN_VW}
            max={MAX_VW}
            step={1}
            value={widthVw ?? DEFAULT_SLIDER_VW}
            onChange={(event) => setWidthVw(Number(event.target.value))}
            className="flex-1"
            aria-label="Content width as a percentage of the viewport"
          />
          <span className="w-10 text-right text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
            {widthVw ?? DEFAULT_SLIDER_VW}%
          </span>
          <button
            type="button"
            onClick={() => setWidthVw(null)}
            className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Reset
          </button>
        </div>
      </details>

      {children}
    </main>
  );
}

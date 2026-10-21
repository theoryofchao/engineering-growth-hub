"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

import { MAX_VW, MIN_VW, useContentWidth } from "@/hooks/use-content-width";
import { useDefaultViewMode } from "@/hooks/use-default-view-mode";
import { useShowSectionBoundariesDefault } from "@/hooks/use-show-section-boundaries-default";

const DEFAULT_SLIDER_VW = 55;

function segmentButtonClass(active: boolean): string {
  return `rounded-md px-3 py-1 text-sm font-medium transition-colors ${
    active
      ? "bg-black text-white dark:bg-zinc-50 dark:text-black"
      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
  }`;
}

/**
 * Site-wide settings, reachable from every page via a fixed gear
 * button (mounted once in the root layout). Holds appearance (theme),
 * reading width (the control formerly inline on the lesson page, see
 * docs/decisions/0025-...md), and lesson display defaults -- every
 * setting here is just a thin UI over its own small localStorage-backed
 * hook, so this component owns no persistence logic itself.
 */
export function SiteSettings() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [widthVw, setWidthVw] = useContentWidth();
  const [defaultViewMode, setDefaultViewMode] = useDefaultViewMode();
  const [showBoundariesDefault, setShowBoundariesDefault] = useShowSectionBoundariesDefault();
  const gearButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Theme is undefined until next-themes reads localStorage on mount --
  // avoids a server/client mismatch on which option shows as selected.
  useEffect(() => {
    function markMounted() {
      setMounted(true);
    }
    markMounted();
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  function close() {
    setOpen(false);
    gearButtonRef.current?.focus();
  }

  return (
    <>
      <button
        ref={gearButtonRef}
        type="button"
        aria-label="Site settings"
        aria-expanded={open}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        className="fixed right-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-600 shadow-sm hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        <GearIcon />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close settings"
            onClick={close}
            className="fixed inset-0 z-40"
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Site settings"
            tabIndex={-1}
            className="fixed right-4 top-16 z-50 flex w-72 flex-col gap-4 rounded-lg border border-zinc-300 bg-white p-4 text-sm shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
          >
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Appearance
              </h2>
              <div
                role="group"
                aria-label="Theme"
                className="mt-2 inline-flex rounded-lg border border-zinc-300 p-0.5 dark:border-zinc-700"
              >
                {(["light", "dark", "system"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setTheme(option)}
                    aria-pressed={mounted && theme === option}
                    className={segmentButtonClass(mounted && theme === option)}
                  >
                    {option[0].toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Reading width
              </h2>
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
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span>{widthVw !== null ? `${widthVw}vw` : "Default"}</span>
                <button
                  type="button"
                  onClick={() => setWidthVw(null)}
                  className="rounded border border-zinc-300 px-2 py-0.5 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                >
                  Reset
                </button>
              </div>
            </section>

            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Lesson display defaults
              </h2>
              <div
                role="group"
                aria-label="Default view"
                className="mt-2 inline-flex rounded-lg border border-zinc-300 p-0.5 dark:border-zinc-700"
              >
                {(["page", "slide"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setDefaultViewMode(option)}
                    aria-pressed={defaultViewMode === option}
                    className={segmentButtonClass(defaultViewMode === option)}
                  >
                    {option === "page" ? "Page" : "Slides"}
                  </button>
                ))}
              </div>
              <label className="mt-3 flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <input
                  type="checkbox"
                  checked={showBoundariesDefault}
                  onChange={(event) => setShowBoundariesDefault(event.target.checked)}
                />
                Show section boundaries by default
              </label>
            </section>
          </div>
        </>
      )}
    </>
  );
}

function GearIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
      />
    </svg>
  );
}

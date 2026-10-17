"use client";

import { useEffect } from "react";

export type Note = { body: string; updated_at: string };

type Block = { id: number; heading: string; note: Note | null };

/**
 * Side modal for a section's notes. Has its own Previous/Next so you can
 * move through a lesson's sections without closing the panel — the
 * parent (ContentBlocks) drives what "next" means (advance the open
 * block in page view, or advance the slide itself in slide view, with
 * matching auto-scroll/slide-change) since that requires knowing about
 * navigation, which this component deliberately doesn't.
 */
export function NotesPanel({
  block,
  draft,
  onDraftChange,
  onSave,
  onDelete,
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  positionLabel,
  saving,
  error,
}: {
  block: Block;
  draft: string;
  onDraftChange: (value: string) => void;
  onSave: () => void;
  onDelete: () => void;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  positionLabel: string;
  saving: boolean;
  error: string | null;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close notes"
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Notes for ${block.heading}`}
        className="relative flex h-full w-full max-w-md flex-col gap-3 bg-white p-6 shadow-xl dark:bg-zinc-900"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Notes · {positionLabel}
            </h2>
            <p className="font-medium text-black dark:text-zinc-50">{block.heading}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded px-2 py-1 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            ✕
          </button>
        </div>

        <div className="flex justify-between gap-2">
          <button
            type="button"
            onClick={onPrevious}
            disabled={!hasPrevious}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            ‹ Previous section
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!hasNext}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Next section ›
          </button>
        </div>

        <textarea
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          placeholder="Add your notes for this section…"
          rows={10}
          className="flex-1 resize-none rounded-lg border border-zinc-300 p-3 text-sm text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />

        {error && (
          <p role="alert" className="text-sm text-red-700 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="flex justify-between gap-2">
          {block.note && (
            <button
              type="button"
              onClick={onDelete}
              disabled={saving}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-40 dark:text-red-400 dark:hover:bg-red-950"
            >
              Delete note
            </button>
          )}
          <button
            type="button"
            onClick={onSave}
            disabled={saving || draft.trim() === ""}
            className="ml-auto rounded-lg bg-black px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-40 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";

export type Note = { body: string; updated_at: string };

type Block = { id: number; heading: string; note: Note | null };

/**
 * Inline, non-blocking notes panel — not a modal. The rest of the page
 * (including slide Prev/Next) stays fully interactive while this is
 * open; the parent (ContentBlocks) is responsible for following slide
 * navigation and prompting to save before switching away from unsaved
 * edits, since that requires knowing about navigation, which this
 * component deliberately doesn't.
 */
export function NotesPanel({
  block,
  draft,
  onDraftChange,
  onSave,
  onDelete,
  onClose,
  saving,
  error,
}: {
  block: Block;
  draft: string;
  onDraftChange: (value: string) => void;
  onSave: () => void;
  onDelete: () => void;
  onClose: () => void;
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
    <div
      role="region"
      aria-label={`Notes for ${block.heading}`}
      className="flex flex-col gap-3 rounded-lg border border-amber-300 bg-amber-50/60 p-4 dark:border-amber-800 dark:bg-amber-950/20"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Notes
          </h3>
          <p className="font-medium text-black dark:text-zinc-50">{block.heading}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close notes"
          className="rounded px-2 py-1 text-zinc-500 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          ✕
        </button>
      </div>

      <textarea
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
        placeholder="Add your notes for this section…"
        rows={6}
        className="resize-none rounded-lg border border-zinc-300 bg-white p-3 text-sm text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
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
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-40 dark:text-red-400 dark:hover:bg-red-950"
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
  );
}

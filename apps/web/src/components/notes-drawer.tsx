"use client";

import { useEffect, useState } from "react";

import { API_BASE_URL } from "@/lib/config";

export type Note = { body: string; updated_at: string };

type Block = { id: number; heading: string; note: Note | null };

type SaveState = { phase: "idle" } | { phase: "saving" } | { phase: "error"; message: string };

export function NotesDrawer({
  block,
  onClose,
  onSaved,
}: {
  block: Block;
  onClose: () => void;
  onSaved: (blockId: number, note: Note | null) => void;
}) {
  const [draft, setDraft] = useState(block.note?.body ?? "");
  const [saveState, setSaveState] = useState<SaveState>({ phase: "idle" });

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function save() {
    if (draft.trim() === "") return;
    setSaveState({ phase: "saving" });

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/content-blocks/${block.id}/note`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: draft }),
        },
      );

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const note = (await response.json()) as Note;
      onSaved(block.id, note);
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setSaveState({ phase: "error", message });
    }
  }

  async function deleteNote() {
    setSaveState({ phase: "saving" });

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/content-blocks/${block.id}/note`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      onSaved(block.id, null);
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setSaveState({ phase: "error", message });
    }
  }

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
              Notes
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

        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Add your notes for this section…"
          rows={10}
          className="flex-1 resize-none rounded-lg border border-zinc-300 p-3 text-sm text-black outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />

        {saveState.phase === "error" && (
          <p role="alert" className="text-sm text-red-700 dark:text-red-400">
            {saveState.message}
          </p>
        )}

        <div className="flex justify-between gap-2">
          {block.note && (
            <button
              type="button"
              onClick={deleteNote}
              disabled={saveState.phase === "saving"}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-40 dark:text-red-400 dark:hover:bg-red-950"
            >
              Delete note
            </button>
          )}
          <button
            type="button"
            onClick={save}
            disabled={saveState.phase === "saving" || draft.trim() === ""}
            className="ml-auto rounded-lg bg-black px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-40 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

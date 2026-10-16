"use client";

import { useState } from "react";

import { API_BASE_URL } from "@/lib/config";
import { Note, NotesPanel } from "@/components/notes-panel";

type Block = {
  id: number;
  sequence: number;
  heading: string;
  body: string;
  note: Note | null;
};

type ViewMode = "page" | "slide";
type SaveState = { phase: "idle" } | { phase: "saving" } | { phase: "error"; message: string };

function toggleButtonClass(active: boolean): string {
  return `rounded-md px-3 py-1 text-sm font-medium transition-colors ${
    active
      ? "bg-black text-white dark:bg-zinc-50 dark:text-black"
      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
  }`;
}

export function ContentBlocks({ initialBlocks }: { initialBlocks: Block[] }) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [viewMode, setViewMode] = useState<ViewMode>("page");
  const [showBoundaries, setShowBoundaries] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [activeNoteBlockId, setActiveNoteBlockId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [saveState, setSaveState] = useState<SaveState>({ phase: "idle" });

  const activeBlock = blocks.find((b) => b.id === activeNoteBlockId) ?? null;
  const isDirty = activeBlock !== null && draft.trim() !== (activeBlock.note?.body ?? "").trim();

  async function persistNote(blockId: number, body: string): Promise<Note> {
    const response = await fetch(`${API_BASE_URL}/api/v1/content-blocks/${blockId}/note`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    if (!response.ok) throw new Error(`API responded with status ${response.status}`);
    return (await response.json()) as Note;
  }

  // Not modal, and navigation (slide Next/Prev, clicking a different
  // section) must keep working while this is open — so switching which
  // block's notes are shown goes through here rather than blocking the
  // rest of the UI. If there are unsaved edits, ask once, then proceed
  // either way: the user chose to move on, not to get stuck.
  async function switchActiveBlock(newBlockId: number | null) {
    if (activeBlock !== null && isDirty) {
      const shouldSave = window.confirm(
        "You have unsaved notes for this section. Save them before continuing?",
      );
      if (shouldSave) {
        try {
          const note = await persistNote(activeBlock.id, draft);
          setBlocks((current) =>
            current.map((b) => (b.id === activeBlock.id ? { ...b, note } : b)),
          );
        } catch {
          window.alert("Could not save your note. Your changes will be discarded.");
        }
      }
    }

    setActiveNoteBlockId(newBlockId);
    setSaveState({ phase: "idle" });
    const newBlock = newBlockId === null ? null : blocks.find((b) => b.id === newBlockId);
    setDraft(newBlock?.note?.body ?? "");
  }

  async function goToSlide(newIndex: number) {
    if (activeNoteBlockId !== null) {
      await switchActiveBlock(blocks[newIndex].id);
    }
    setSlideIndex(newIndex);
  }

  async function handleSave() {
    if (activeBlock === null || draft.trim() === "") return;
    setSaveState({ phase: "saving" });
    try {
      const note = await persistNote(activeBlock.id, draft);
      setBlocks((current) => current.map((b) => (b.id === activeBlock.id ? { ...b, note } : b)));
      setSaveState({ phase: "idle" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setSaveState({ phase: "error", message });
    }
  }

  async function handleDelete() {
    if (activeBlock === null) return;
    setSaveState({ phase: "saving" });
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/content-blocks/${activeBlock.id}/note`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error(`API responded with status ${response.status}`);
      setBlocks((current) =>
        current.map((b) => (b.id === activeBlock.id ? { ...b, note: null } : b)),
      );
      setDraft("");
      setSaveState({ phase: "idle" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setSaveState({ phase: "error", message });
    }
  }

  if (blocks.length === 0) {
    return <p className="text-zinc-600 dark:text-zinc-400">No content for this lesson yet.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          role="group"
          aria-label="View mode"
          className="inline-flex rounded-lg border border-zinc-300 p-0.5 dark:border-zinc-700"
        >
          <button
            type="button"
            onClick={() => setViewMode("page")}
            aria-pressed={viewMode === "page"}
            className={toggleButtonClass(viewMode === "page")}
          >
            Page
          </button>
          <button
            type="button"
            onClick={() => setViewMode("slide")}
            aria-pressed={viewMode === "slide"}
            className={toggleButtonClass(viewMode === "slide")}
          >
            Slides
          </button>
        </div>

        {viewMode === "page" && (
          <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <input
              type="checkbox"
              checked={showBoundaries}
              onChange={(event) => setShowBoundaries(event.target.checked)}
            />
            Show section boundaries
          </label>
        )}
      </div>

      {viewMode === "page" ? (
        <div className="flex flex-col gap-4">
          {blocks.map((block) => (
            <button
              key={block.id}
              type="button"
              onClick={() => switchActiveBlock(block.id)}
              className={`group rounded-lg border-2 p-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 ${
                showBoundaries
                  ? "border-dashed border-zinc-400 dark:border-zinc-600"
                  : "border-transparent"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
                  {block.heading}
                </h3>
                <span className="flex shrink-0 items-center gap-2">
                  {block.note && (
                    <span className="rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                      Note
                    </span>
                  )}
                  <span className="text-xs font-medium text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 dark:text-zinc-500">
                    {block.note ? "View/edit notes" : "Add notes"}
                  </span>
                </span>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
                {block.body}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4 rounded-lg border border-zinc-300 p-6 dark:border-zinc-700">
          <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
            <span>
              Slide {slideIndex + 1} / {blocks.length}
            </span>
            <button
              type="button"
              onClick={() => switchActiveBlock(blocks[slideIndex].id)}
              className="rounded-lg border border-zinc-300 px-2 py-1 font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              {blocks[slideIndex].note ? "View/edit notes" : "Add notes"}
            </button>
          </div>

          <div className="min-h-48">
            <h3 className="text-xl font-semibold text-black dark:text-zinc-50">
              {blocks[slideIndex].heading}
            </h3>
            <p className="mt-2 whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
              {blocks[slideIndex].body}
            </p>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              disabled={slideIndex === 0}
              onClick={() => goToSlide(slideIndex - 1)}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              ← Previous
            </button>
            <button
              type="button"
              disabled={slideIndex === blocks.length - 1}
              onClick={() => goToSlide(slideIndex + 1)}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {activeBlock && (
        <NotesPanel
          block={activeBlock}
          draft={draft}
          onDraftChange={setDraft}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => switchActiveBlock(null)}
          saving={saveState.phase === "saving"}
          error={saveState.phase === "error" ? saveState.message : null}
        />
      )}
    </div>
  );
}

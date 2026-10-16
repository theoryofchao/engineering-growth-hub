"use client";

import { useState } from "react";

import { Note, NotesDrawer } from "@/components/notes-drawer";

type Block = {
  id: number;
  sequence: number;
  heading: string;
  body: string;
  note: Note | null;
};

type ViewMode = "page" | "slide";

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
  const [openBlockId, setOpenBlockId] = useState<number | null>(null);

  function handleNoteSaved(blockId: number, note: Note | null) {
    setBlocks((current) => current.map((b) => (b.id === blockId ? { ...b, note } : b)));
  }

  if (blocks.length === 0) {
    return <p className="text-zinc-600 dark:text-zinc-400">No content for this lesson yet.</p>;
  }

  const openBlock = blocks.find((b) => b.id === openBlockId) ?? null;

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
          {blocks.map((block) =>
            showBoundaries ? (
              <button
                key={block.id}
                type="button"
                onClick={() => setOpenBlockId(block.id)}
                className="rounded-lg border-2 border-dashed border-zinc-400 p-4 text-left hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-900"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
                    {block.heading}
                  </h3>
                  {block.note && (
                    <span className="shrink-0 rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                      Note
                    </span>
                  )}
                </div>
                <p className="mt-1 whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
                  {block.body}
                </p>
              </button>
            ) : (
              <section key={block.id}>
                <h3 className="text-lg font-semibold text-black dark:text-zinc-50">
                  {block.heading}
                </h3>
                <p className="mt-1 whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
                  {block.body}
                </p>
              </section>
            ),
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4 rounded-lg border border-zinc-300 p-6 dark:border-zinc-700">
          <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
            <span>
              Slide {slideIndex + 1} / {blocks.length}
            </span>
            <button
              type="button"
              onClick={() => setOpenBlockId(blocks[slideIndex].id)}
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
              onClick={() => setSlideIndex((i) => i - 1)}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              ← Previous
            </button>
            <button
              type="button"
              disabled={slideIndex === blocks.length - 1}
              onClick={() => setSlideIndex((i) => i + 1)}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {openBlock && (
        <NotesDrawer
          block={openBlock}
          onClose={() => setOpenBlockId(null)}
          onSaved={handleNoteSaved}
        />
      )}
    </div>
  );
}

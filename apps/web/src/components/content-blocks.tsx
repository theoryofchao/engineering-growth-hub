"use client";

import { useRef, useState } from "react";

import { ContentExample, ExampleAccordion } from "@/components/example-accordion";
import { ExerciseQuiz } from "@/components/exercise-quiz";
import { Note, NotesPanel } from "@/components/notes-panel";
import { useNoteDraft } from "@/hooks/use-note-draft";

type ExerciseSummary = { id: number; type: string; prompt: string; options: string[] };

type Block = {
  id: number;
  sequence: number;
  heading: string;
  body: string;
  note: Note | null;
  exercises: ExerciseSummary[];
  examples?: ContentExample[];
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
  const blockRefs = useRef(new Map<number, HTMLDivElement>());

  const {
    activeBlock,
    activeBlockIndex,
    draft,
    setDraft,
    saveState,
    switchTo: switchActiveBlock,
    save: handleSave,
    remove: handleDelete,
  } = useNoteDraft(blocks, setBlocks);

  function scrollToBlock(blockId: number) {
    blockRefs.current.get(blockId)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function goToSlide(newIndex: number) {
    if (activeBlock !== null) {
      await switchActiveBlock(blocks[newIndex].id);
    }
    setSlideIndex(newIndex);
  }

  // Previous/Next inside the notes panel: in slide view this moves the
  // actual slide (so the panel always reflects what's on screen); in
  // page view there's no single "current" position outside the panel,
  // so this scrolls the newly-active section into view instead.
  async function goToAdjacentBlock(direction: 1 | -1) {
    if (activeBlockIndex === -1) return;
    const newIndex = activeBlockIndex + direction;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    if (viewMode === "slide") {
      await goToSlide(newIndex);
    } else {
      const newBlockId = blocks[newIndex].id;
      await switchActiveBlock(newBlockId);
      scrollToBlock(newBlockId);
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
            <div
              key={block.id}
              ref={(el) => {
                if (el) blockRefs.current.set(block.id, el);
                else blockRefs.current.delete(block.id);
              }}
              className={`rounded-lg border-2 p-4 transition-colors ${
                showBoundaries
                  ? "border-dashed border-zinc-400 dark:border-zinc-600"
                  : "border-transparent"
              }`}
            >
              <button
                type="button"
                onClick={() => switchActiveBlock(block.id)}
                className="group flex w-full items-center justify-between gap-2 text-left"
              >
                <h3 className="text-lg font-semibold text-black group-hover:underline dark:text-zinc-50">
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
              </button>
              <p className="mt-1 whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
                {block.body}
              </p>
              <ExampleAccordion examples={block.examples ?? []} />
              {block.exercises.length > 0 && (
                <div className="mt-3 flex flex-col gap-3">
                  {block.exercises.map((exercise) => (
                    <ExerciseQuiz key={exercise.id} exercise={exercise} />
                  ))}
                </div>
              )}
            </div>
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
            <ExampleAccordion examples={blocks[slideIndex].examples ?? []} />
            {blocks[slideIndex].exercises.length > 0 && (
              <div className="mt-3 flex flex-col gap-3">
                {blocks[slideIndex].exercises.map((exercise) => (
                  <ExerciseQuiz key={exercise.id} exercise={exercise} />
                ))}
              </div>
            )}
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
          onPrevious={() => goToAdjacentBlock(-1)}
          onNext={() => goToAdjacentBlock(1)}
          hasPrevious={activeBlockIndex > 0}
          hasNext={activeBlockIndex !== -1 && activeBlockIndex < blocks.length - 1}
          positionLabel={`${activeBlockIndex + 1} of ${blocks.length}`}
          saving={saveState.phase === "saving"}
          error={saveState.phase === "error" ? saveState.message : null}
        />
      )}
    </div>
  );
}

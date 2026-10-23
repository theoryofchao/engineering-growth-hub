"use client";

import { useEffect, useRef, useState } from "react";

import { ContentExample, ExampleAccordion } from "@/components/example-accordion";
import { ExerciseSwitch } from "@/components/exercise-switch";
import { InlineMarkdown } from "@/components/inline-markdown";
import { Note, NotesPanel } from "@/components/notes-panel";
import { ReferenceLink, ReferenceLinks } from "@/components/reference-links";
import { useBlockCompletions } from "@/hooks/use-block-completions";
import { useDefaultViewMode } from "@/hooks/use-default-view-mode";
import { useNoteDraft } from "@/hooks/use-note-draft";
import { useShowSectionBoundariesDefault } from "@/hooks/use-show-section-boundaries-default";
import { hydrateFromServer } from "@/lib/completion-store";
import { API_BASE_URL } from "@/lib/config";
import type { Exercise as ExerciseSummary } from "@/lib/exercise-types";

type Block = {
  id: number;
  sequence: number;
  heading: string;
  body: string;
  note: Note | null;
  exercises: ExerciseSummary[];
  examples?: ContentExample[];
  reference_links?: ReferenceLink[];
};

type ViewMode = "page" | "slide";

function toggleButtonClass(active: boolean): string {
  return `rounded-md px-3 py-1 text-sm font-medium transition-colors ${
    active
      ? "bg-black text-white dark:bg-zinc-50 dark:text-black"
      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
  }`;
}

function CompletionToggle({
  completed,
  onToggle,
  className = "",
}: {
  completed: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={completed}
      aria-label={completed ? "Mark as not done" : "Mark as done"}
      title={completed ? "Mark as not done" : "Mark as done"}
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
        completed
          ? "border-emerald-600 bg-emerald-600 text-white"
          : "border-zinc-300 text-transparent hover:border-zinc-400 dark:border-zinc-600 dark:hover:border-zinc-500"
      } ${className}`}
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
        <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z" />
      </svg>
    </button>
  );
}

export function ContentBlocks({
  initialBlocks,
  learningSessionId,
}: {
  initialBlocks: Block[];
  learningSessionId: number;
}) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [viewMode, setViewModeState] = useState<ViewMode>("page");
  const [showBoundaries, setShowBoundariesState] = useState(false);
  const [showOnlyIncomplete, setShowOnlyIncomplete] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const blockRefs = useRef(new Map<number, HTMLDivElement>());

  const { completions, toggle: toggleCompletion } = useBlockCompletions();

  // One-time baseline load per lesson: the local store (completion-store.ts)
  // already holds anything unsynced from an earlier visit, and hydrateFromServer
  // never overwrites a dirty (unsynced) entry, so this can't clobber a pending toggle.
  useEffect(() => {
    let cancelled = false;

    async function loadCompletions() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/learning-sessions/${learningSessionId}/completions`,
        );
        if (!response.ok || cancelled) return;

        const data = (await response.json()) as Array<{
          content_block_id: number;
          completed: boolean;
          updated_at: string | null;
        }>;
        hydrateFromServer(
          data.map((item) => ({
            contentBlockId: item.content_block_id,
            completed: item.completed,
            updatedAt: item.updated_at,
          })),
        );
      } catch {
        // Best effort -- falls back to whatever's already in the local
        // store (or "not completed") until this succeeds on a later mount.
      }
    }

    void loadCompletions();
    return () => {
      cancelled = true;
    };
  }, [learningSessionId]);

  const completedCount = blocks.filter((block) => completions[block.id]?.completed).length;
  const allBlocksComplete = blocks.length > 0 && completedCount === blocks.length;

  // The two site-wide defaults restore from localStorage asynchronously
  // (after mount), so they can't just seed useState's initial value --
  // that's captured once, before the restore happens. Instead, apply
  // them via this effect, but only until the learner actually touches
  // either control themselves; after that, their in-session choice
  // wins and the default stops overriding it (same "sets a default,
  // doesn't retroactively override" behavior as useContentWidth).
  const [defaultViewMode] = useDefaultViewMode();
  const [showBoundariesDefault] = useShowSectionBoundariesDefault();
  const userChangedViewMode = useRef(false);
  const userChangedShowBoundaries = useRef(false);

  useEffect(() => {
    if (!userChangedViewMode.current) setViewModeState(defaultViewMode);
  }, [defaultViewMode]);

  useEffect(() => {
    if (!userChangedShowBoundaries.current) setShowBoundariesState(showBoundariesDefault);
  }, [showBoundariesDefault]);

  function setViewMode(mode: ViewMode) {
    userChangedViewMode.current = true;
    setViewModeState(mode);
  }

  function setShowBoundaries(value: boolean) {
    userChangedShowBoundaries.current = true;
    setShowBoundariesState(value);
  }

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

  // Searches forward from the current slide, wrapping around, so it finds
  // the next incomplete slide regardless of whether it's ahead or behind.
  function findNextIncompleteIndex(): number | null {
    for (let offset = 1; offset <= blocks.length; offset++) {
      const index = (slideIndex + offset) % blocks.length;
      if (!completions[blocks[index].id]?.completed) return index;
    }
    return null;
  }

  async function jumpToNextIncomplete() {
    const nextIndex = findNextIncompleteIndex();
    if (nextIndex !== null) await goToSlide(nextIndex);
  }

  // Arrow-key slide navigation, mirroring the Prev/Next buttons' bounds
  // checks. Ignored while typing in a text field (e.g. the notes draft)
  // so arrow keys there move the cursor instead of the slide.
  useEffect(() => {
    if (viewMode !== "slide") return;

    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;

      if (event.key === "ArrowLeft" && slideIndex > 0) {
        goToSlide(slideIndex - 1);
      } else if (event.key === "ArrowRight" && slideIndex < blocks.length - 1) {
        goToSlide(slideIndex + 1);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [viewMode, slideIndex, blocks.length]);

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

        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {completedCount}/{blocks.length} complete
          </span>
          {viewMode === "page" && (
            <>
              <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <input
                  type="checkbox"
                  checked={showOnlyIncomplete}
                  onChange={(event) => setShowOnlyIncomplete(event.target.checked)}
                />
                Show only incomplete
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <input
                  type="checkbox"
                  checked={showBoundaries}
                  onChange={(event) => setShowBoundaries(event.target.checked)}
                />
                Show section boundaries
              </label>
            </>
          )}
        </div>
      </div>

      {allBlocksComplete && (
        <div className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          Lesson complete ✓
        </div>
      )}

      {viewMode === "page" ? (
        <div className="flex flex-col gap-4">
          {blocks
            .filter((block) => !showOnlyIncomplete || !completions[block.id]?.completed)
            .map((block) => (
              <div
                key={block.id}
                ref={(el) => {
                  if (el) blockRefs.current.set(block.id, el);
                  else blockRefs.current.delete(block.id);
                }}
                className={`flex gap-3 rounded-lg border-2 p-4 transition-colors ${
                  showBoundaries
                    ? "border-dashed border-zinc-400 dark:border-zinc-600"
                    : "border-transparent"
                }`}
              >
                <CompletionToggle
                  completed={completions[block.id]?.completed ?? false}
                  onToggle={() => toggleCompletion(block.id)}
                  className="mt-1"
                />
                <div className="min-w-0 flex-1">
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
                    <InlineMarkdown text={block.body} />
                  </p>
                  <ExampleAccordion examples={block.examples ?? []} />
                  <ReferenceLinks links={block.reference_links ?? []} />
                  {block.exercises.length > 0 && (
                    <div className="mt-3 flex flex-col gap-3">
                      {block.exercises.map((exercise) => (
                        <ExerciseSwitch key={exercise.id} exercise={exercise} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4 rounded-lg border border-zinc-300 p-6 dark:border-zinc-700">
          <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-2">
              <CompletionToggle
                completed={completions[blocks[slideIndex].id]?.completed ?? false}
                onToggle={() => toggleCompletion(blocks[slideIndex].id)}
              />
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
              <InlineMarkdown text={blocks[slideIndex].body} />
            </p>
            <ExampleAccordion examples={blocks[slideIndex].examples ?? []} />
            <ReferenceLinks links={blocks[slideIndex].reference_links ?? []} />
            {blocks[slideIndex].exercises.length > 0 && (
              <div className="mt-3 flex flex-col gap-3">
                {blocks[slideIndex].exercises.map((exercise) => (
                  <ExerciseSwitch key={exercise.id} exercise={exercise} />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              disabled={slideIndex === 0}
              onClick={() => goToSlide(slideIndex - 1)}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              ← Previous
            </button>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">Use ← → to navigate</span>
            <button
              type="button"
              disabled={slideIndex === blocks.length - 1}
              onClick={() => goToSlide(slideIndex + 1)}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              Next →
            </button>
          </div>

          {!allBlocksComplete && (
            <button
              type="button"
              onClick={jumpToNextIncomplete}
              className="self-center text-xs font-medium text-zinc-500 hover:underline dark:text-zinc-400"
            >
              Jump to next incomplete slide
            </button>
          )}
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

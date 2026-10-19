"use client";

import { useState } from "react";

import type { Note } from "@/components/notes-panel";
import { API_BASE_URL } from "@/lib/config";

type SaveState = { phase: "idle" } | { phase: "saving" } | { phase: "error"; message: string };

type Notable = { id: number; note: Note | null };

async function persistNote(blockId: number, body: string): Promise<Note> {
  const response = await fetch(`${API_BASE_URL}/api/v1/content-blocks/${blockId}/note`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });
  if (!response.ok) throw new Error(`API responded with status ${response.status}`);
  return (await response.json()) as Note;
}

/**
 * Owns "which block's notes are open, with what unsaved draft" state
 * and its PUT/DELETE persistence, parameterized over whatever
 * block-shaped array the caller renders. Extracted out of
 * content-blocks.tsx, which also owns page/slide navigation -- a
 * separate concern (docs/decisions/0022-frontend-fetch-hook-and-component-splits.md).
 */
export function useNoteDraft<B extends Notable>(
  blocks: B[],
  setBlocks: (updater: (current: B[]) => B[]) => void,
) {
  const [activeBlockId, setActiveBlockId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [saveState, setSaveState] = useState<SaveState>({ phase: "idle" });

  const activeBlock = blocks.find((b) => b.id === activeBlockId) ?? null;
  const activeBlockIndex = activeBlock ? blocks.findIndex((b) => b.id === activeBlock.id) : -1;
  const isDirty = activeBlock !== null && draft.trim() !== (activeBlock.note?.body ?? "").trim();

  // The notes panel has its own Previous/Next, so switching which block
  // is "active" happens often while it's open -- including from inside
  // the panel itself, not just by closing and reopening it. If there
  // are unsaved edits, ask once, then proceed either way: the point is
  // to let the reader keep moving, not to trap them on one section.
  async function switchTo(newBlockId: number | null) {
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

    setActiveBlockId(newBlockId);
    setSaveState({ phase: "idle" });
    const newBlock = newBlockId === null ? null : blocks.find((b) => b.id === newBlockId);
    setDraft(newBlock?.note?.body ?? "");
  }

  async function save() {
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

  async function remove() {
    if (activeBlock === null) return;
    setSaveState({ phase: "saving" });
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/content-blocks/${activeBlock.id}/note`, {
        method: "DELETE",
      });
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

  return { activeBlock, activeBlockIndex, draft, setDraft, saveState, switchTo, save, remove };
}

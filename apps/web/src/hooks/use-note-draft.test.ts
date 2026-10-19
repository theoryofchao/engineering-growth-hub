import { act, renderHook } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useNoteDraft } from "./use-note-draft";

type Block = { id: number; note: { body: string; updated_at: string } | null };

function setup(initialBlocks: Block[]) {
  return renderHook(() => {
    const [blocks, setBlocks] = useState(initialBlocks);
    const draftApi = useNoteDraft(blocks, setBlocks);
    return { blocks, ...draftApi };
  });
}

describe("useNoteDraft", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.stubGlobal("confirm", vi.fn());
    vi.stubGlobal("alert", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const blocksFixture: Block[] = [
    { id: 1, note: null },
    { id: 2, note: { body: "existing note", updated_at: "2026-01-01T00:00:00Z" } },
  ];

  it("has no active block initially", () => {
    const { result } = setup(blocksFixture);

    expect(result.current.activeBlock).toBeNull();
    expect(result.current.activeBlockIndex).toBe(-1);
  });

  it("switching to a block loads its existing note into the draft", async () => {
    const { result } = setup(blocksFixture);

    await act(async () => {
      await result.current.switchTo(2);
    });

    expect(result.current.activeBlock?.id).toBe(2);
    expect(result.current.activeBlockIndex).toBe(1);
    expect(result.current.draft).toBe("existing note");
  });

  it("switching to a block with no note starts with an empty draft", async () => {
    const { result } = setup(blocksFixture);

    await act(async () => {
      await result.current.switchTo(1);
    });

    expect(result.current.draft).toBe("");
  });

  it("asks to save unsaved edits before switching away, and discards on decline", async () => {
    (confirm as ReturnType<typeof vi.fn>).mockReturnValue(false);
    const { result } = setup(blocksFixture);

    await act(async () => {
      await result.current.switchTo(1);
    });
    act(() => result.current.setDraft("unsaved draft"));

    await act(async () => {
      await result.current.switchTo(2);
    });

    expect(confirm).toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expect(result.current.activeBlock?.id).toBe(2);
  });

  it("saves via PUT and updates the block in place", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ body: "new note", updated_at: "2026-01-02T00:00:00Z" }),
    });
    const { result } = setup(blocksFixture);

    await act(async () => {
      await result.current.switchTo(1);
    });
    act(() => result.current.setDraft("new note"));
    await act(async () => {
      await result.current.save();
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/content-blocks/1/note"),
      expect.objectContaining({ method: "PUT" }),
    );
    expect(result.current.saveState).toEqual({ phase: "idle" });
    expect(result.current.blocks.find((b: Block) => b.id === 1)?.note?.body).toBe("new note");
  });

  it("deletes via DELETE and clears the block's note", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });
    const { result } = setup(blocksFixture);

    await act(async () => {
      await result.current.switchTo(2);
    });
    await act(async () => {
      await result.current.remove();
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/content-blocks/2/note"),
      expect.objectContaining({ method: "DELETE" }),
    );
    expect(result.current.blocks.find((b: Block) => b.id === 2)?.note).toBeNull();
    expect(result.current.draft).toBe("");
  });
});

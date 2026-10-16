import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NotesDrawer } from "./notes-drawer";

describe("NotesDrawer", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("pre-fills the textarea with the existing note and has no delete button when empty", () => {
    const block = { id: 1, heading: "Overview", note: null };
    render(<NotesDrawer block={block} onClose={vi.fn()} onSaved={vi.fn()} />);

    expect(screen.getByPlaceholderText(/Add your notes/)).toHaveValue("");
    expect(screen.queryByText("Delete note")).not.toBeInTheDocument();
    expect(screen.getByText("Save")).toBeDisabled();
  });

  it("saves a new note and calls onSaved + onClose", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ body: "My note", updated_at: "2026-10-15T00:00:00Z" }),
    });
    const onSaved = vi.fn();
    const onClose = vi.fn();
    const block = { id: 1, heading: "Overview", note: null };

    render(<NotesDrawer block={block} onClose={onClose} onSaved={onSaved} />);

    fireEvent.change(screen.getByPlaceholderText(/Add your notes/), {
      target: { value: "My note" },
    });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(1, { body: "My note", updated_at: "2026-10-15T00:00:00Z" }));
    expect(onClose).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/content-blocks/1/note"),
      expect.objectContaining({ method: "PUT" }),
    );
  });

  it("deletes an existing note and calls onSaved with null", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });
    const onSaved = vi.fn();
    const block = { id: 1, heading: "Overview", note: { body: "Old note", updated_at: "x" } };

    render(<NotesDrawer block={block} onClose={vi.fn()} onSaved={onSaved} />);

    fireEvent.click(screen.getByText("Delete note"));

    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(1, null));
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/content-blocks/1/note"),
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("closes when Escape is pressed", () => {
    const onClose = vi.fn();
    const block = { id: 1, heading: "Overview", note: null };

    render(<NotesDrawer block={block} onClose={onClose} onSaved={vi.fn()} />);
    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalled();
  });

  it("shows an error state when saving fails", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false, status: 500 });
    const block = { id: 1, heading: "Overview", note: null };

    render(<NotesDrawer block={block} onClose={vi.fn()} onSaved={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText(/Add your notes/), {
      target: { value: "My note" },
    });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
  });
});

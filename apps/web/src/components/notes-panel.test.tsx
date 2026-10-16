import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NotesPanel } from "./notes-panel";

const block = { id: 1, heading: "Overview", note: null };

describe("NotesPanel", () => {
  it("renders as a non-modal region, not a dialog", () => {
    render(
      <NotesPanel
        block={block}
        draft=""
        onDraftChange={vi.fn()}
        onSave={vi.fn()}
        onDelete={vi.fn()}
        onClose={vi.fn()}
        saving={false}
        error={null}
      />,
    );

    expect(screen.getByRole("region")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("has no delete button when there's no existing note, and disables save when empty", () => {
    render(
      <NotesPanel
        block={block}
        draft=""
        onDraftChange={vi.fn()}
        onSave={vi.fn()}
        onDelete={vi.fn()}
        onClose={vi.fn()}
        saving={false}
        error={null}
      />,
    );

    expect(screen.queryByText("Delete note")).not.toBeInTheDocument();
    expect(screen.getByText("Save")).toBeDisabled();
  });

  it("calls onDraftChange as the user types", () => {
    const onDraftChange = vi.fn();
    render(
      <NotesPanel
        block={block}
        draft=""
        onDraftChange={onDraftChange}
        onSave={vi.fn()}
        onDelete={vi.fn()}
        onClose={vi.fn()}
        saving={false}
        error={null}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText(/Add your notes/), {
      target: { value: "hi" },
    });
    expect(onDraftChange).toHaveBeenCalledWith("hi");
  });

  it("shows the delete button and calls onDelete when there's an existing note", () => {
    const onDelete = vi.fn();
    const noted = { id: 1, heading: "Overview", note: { body: "x", updated_at: "x" } };
    render(
      <NotesPanel
        block={noted}
        draft="x"
        onDraftChange={vi.fn()}
        onSave={vi.fn()}
        onDelete={onDelete}
        onClose={vi.fn()}
        saving={false}
        error={null}
      />,
    );

    fireEvent.click(screen.getByText("Delete note"));
    expect(onDelete).toHaveBeenCalled();
  });

  it("calls onClose when Escape is pressed", () => {
    const onClose = vi.fn();
    render(
      <NotesPanel
        block={block}
        draft=""
        onDraftChange={vi.fn()}
        onSave={vi.fn()}
        onDelete={vi.fn()}
        onClose={onClose}
        saving={false}
        error={null}
      />,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("shows an error message when given one", () => {
    render(
      <NotesPanel
        block={block}
        draft="x"
        onDraftChange={vi.fn()}
        onSave={vi.fn()}
        onDelete={vi.fn()}
        onClose={vi.fn()}
        saving={false}
        error="Something went wrong"
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong");
  });
});

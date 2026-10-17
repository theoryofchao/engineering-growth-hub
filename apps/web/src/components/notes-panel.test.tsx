import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NotesPanel } from "./notes-panel";

const block = { id: 1, heading: "Overview", note: null };

function renderPanel(overrides: Partial<Parameters<typeof NotesPanel>[0]> = {}) {
  return render(
    <NotesPanel
      block={block}
      draft=""
      onDraftChange={vi.fn()}
      onSave={vi.fn()}
      onDelete={vi.fn()}
      onClose={vi.fn()}
      onPrevious={vi.fn()}
      onNext={vi.fn()}
      hasPrevious={false}
      hasNext={false}
      positionLabel="1 of 1"
      saving={false}
      error={null}
      {...overrides}
    />,
  );
}

describe("NotesPanel", () => {
  it("renders as a modal dialog", () => {
    renderPanel();

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("closes when the backdrop is clicked", () => {
    const onClose = vi.fn();
    renderPanel({ onClose });

    fireEvent.click(screen.getByLabelText("Close notes"));
    expect(onClose).toHaveBeenCalled();
  });

  it("shows the position label", () => {
    renderPanel({ positionLabel: "2 of 6" });

    expect(screen.getByText(/2 of 6/)).toBeInTheDocument();
  });

  it("disables Previous/Next at the boundaries and enables them otherwise", () => {
    const { rerender } = renderPanel({ hasPrevious: false, hasNext: true });

    expect(screen.getByText("‹ Previous section")).toBeDisabled();
    expect(screen.getByText("Next section ›")).toBeEnabled();

    rerender(
      <NotesPanel
        block={block}
        draft=""
        onDraftChange={vi.fn()}
        onSave={vi.fn()}
        onDelete={vi.fn()}
        onClose={vi.fn()}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        hasPrevious={true}
        hasNext={false}
        positionLabel="2 of 2"
        saving={false}
        error={null}
      />,
    );

    expect(screen.getByText("‹ Previous section")).toBeEnabled();
    expect(screen.getByText("Next section ›")).toBeDisabled();
  });

  it("calls onPrevious / onNext when their buttons are clicked", () => {
    const onPrevious = vi.fn();
    const onNext = vi.fn();
    renderPanel({ hasPrevious: true, hasNext: true, onPrevious, onNext });

    fireEvent.click(screen.getByText("‹ Previous section"));
    expect(onPrevious).toHaveBeenCalled();

    fireEvent.click(screen.getByText("Next section ›"));
    expect(onNext).toHaveBeenCalled();
  });

  it("has no delete button when there's no existing note, and disables save when empty", () => {
    renderPanel();

    expect(screen.queryByText("Delete note")).not.toBeInTheDocument();
    expect(screen.getByText("Save")).toBeDisabled();
  });

  it("calls onDraftChange as the user types", () => {
    const onDraftChange = vi.fn();
    renderPanel({ onDraftChange });

    fireEvent.change(screen.getByPlaceholderText(/Add your notes/), {
      target: { value: "hi" },
    });
    expect(onDraftChange).toHaveBeenCalledWith("hi");
  });

  it("shows the delete button and calls onDelete when there's an existing note", () => {
    const onDelete = vi.fn();
    const noted = { id: 1, heading: "Overview", note: { body: "x", updated_at: "x" } };
    renderPanel({ block: noted, draft: "x", onDelete });

    fireEvent.click(screen.getByText("Delete note"));
    expect(onDelete).toHaveBeenCalled();
  });

  it("calls onClose when Escape is pressed", () => {
    const onClose = vi.fn();
    renderPanel({ onClose });

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("shows an error message when given one", () => {
    renderPanel({ draft: "x", error: "Something went wrong" });

    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong");
  });
});

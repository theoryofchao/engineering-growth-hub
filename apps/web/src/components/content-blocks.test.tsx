import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ContentBlocks } from "./content-blocks";

const blocks = [
  { id: 1, sequence: 1, heading: "Overview", body: "Overview body.", note: null },
  {
    id: 2,
    sequence: 2,
    heading: "Details",
    body: "Details body.",
    note: { body: "Existing note", updated_at: "2026-10-15T00:00:00Z" },
  },
];

describe("ContentBlocks", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders all blocks in page view by default, without boundaries shown", () => {
    render(<ContentBlocks initialBlocks={blocks} />);

    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Details")).toBeInTheDocument();
  });

  it("opens notes on click even when 'Show section boundaries' is off (the default)", () => {
    // Regression test: sections must be clickable without first finding and
    // enabling the boundaries toggle — that was the reported bug.
    render(<ContentBlocks initialBlocks={blocks} />);

    fireEvent.click(screen.getByRole("button", { name: /Overview/ }));

    expect(screen.getByRole("region", { name: /Notes for Overview/ })).toBeInTheDocument();
  });

  it("shows a note badge regardless of the boundaries toggle", () => {
    render(<ContentBlocks initialBlocks={blocks} />);

    expect(screen.getByText("Note")).toBeInTheDocument(); // "Details" already has a note
  });

  it("the 'Show section boundaries' checkbox is off by default and can be toggled", () => {
    render(<ContentBlocks initialBlocks={blocks} />);

    const checkbox = screen.getByLabelText("Show section boundaries") as HTMLInputElement;
    expect(checkbox.checked).toBe(false);

    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  it("opens the notes panel inline (non-modal) when a block is clicked", () => {
    render(<ContentBlocks initialBlocks={blocks} />);

    fireEvent.click(screen.getByRole("button", { name: /Details/ }));

    expect(screen.getByRole("region", { name: /Notes for Details/ })).toBeInTheDocument();
    expect(screen.getByDisplayValue("Existing note")).toBeInTheDocument();
    // No modal backdrop: the view-mode toggle is still present and enabled.
    expect(screen.getByText("Slides")).toBeEnabled();
  });

  it("keeps the rest of the UI interactive while notes are open", () => {
    render(<ContentBlocks initialBlocks={blocks} />);

    fireEvent.click(screen.getByRole("button", { name: /Overview/ }));
    expect(screen.getByRole("region")).toBeInTheDocument();

    // Switching view mode while notes are open still works (nothing is disabled).
    fireEvent.click(screen.getByText("Slides"));
    expect(screen.getByText("Slide 1 / 2")).toBeInTheDocument();
  });

  it("auto-follows slide navigation when notes are open and there are no unsaved changes", async () => {
    render(<ContentBlocks initialBlocks={blocks} />);

    fireEvent.click(screen.getByText("Slides"));
    fireEvent.click(screen.getByText("Add notes")); // opens notes for slide 1 (no note)

    fireEvent.click(screen.getByText("Next →"));

    await waitFor(() => expect(screen.getByText("Slide 2 / 2")).toBeInTheDocument());
    // Panel followed to slide 2 and shows ITS existing note, not slide 1's empty draft.
    expect(screen.getByDisplayValue("Existing note")).toBeInTheDocument();
  });

  it("prompts before discarding unsaved notes when navigating away, and saves on confirm", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ body: "draft text", updated_at: "2026-10-15T02:00:00Z" }),
    });

    render(<ContentBlocks initialBlocks={blocks} />);
    fireEvent.click(screen.getByText("Slides"));
    fireEvent.click(screen.getByText("Add notes"));

    fireEvent.change(screen.getByPlaceholderText(/Add your notes/), {
      target: { value: "draft text" },
    });
    fireEvent.click(screen.getByText("Next →"));

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/content-blocks/1/note"),
        expect.objectContaining({ method: "PUT" }),
      ),
    );
    expect(screen.getByText("Slide 2 / 2")).toBeInTheDocument();
  });

  it("discards unsaved notes and still navigates when the user declines to save", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);

    render(<ContentBlocks initialBlocks={blocks} />);
    fireEvent.click(screen.getByText("Slides"));
    fireEvent.click(screen.getByText("Add notes"));

    fireEvent.change(screen.getByPlaceholderText(/Add your notes/), {
      target: { value: "draft text" },
    });
    fireEvent.click(screen.getByText("Next →"));

    expect(window.confirm).toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByText("Slide 2 / 2")).toBeInTheDocument());
  });

  it("does not prompt when closing without any unsaved changes", () => {
    vi.spyOn(window, "confirm");
    render(<ContentBlocks initialBlocks={blocks} />);

    fireEvent.click(screen.getByRole("button", { name: /Overview/ }));
    fireEvent.click(screen.getByLabelText("Close notes"));

    expect(window.confirm).not.toHaveBeenCalled();
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("updates the note badge after saving a note", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ body: "New note", updated_at: "2026-10-15T01:00:00Z" }),
    });

    render(<ContentBlocks initialBlocks={blocks} />);
    fireEvent.click(screen.getByRole("button", { name: /Overview/ }));

    fireEvent.change(screen.getByPlaceholderText(/Add your notes/), {
      target: { value: "New note" },
    });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => expect(screen.getAllByText("Note")).toHaveLength(2));
  });

  it("shows an empty state when there are no content blocks", () => {
    render(<ContentBlocks initialBlocks={[]} />);

    expect(screen.getByText("No content for this lesson yet.")).toBeInTheDocument();
  });
});

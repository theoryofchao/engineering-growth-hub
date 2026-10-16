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
  });

  it("renders all blocks in page view by default, without boundaries", () => {
    render(<ContentBlocks initialBlocks={blocks} />);

    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Details")).toBeInTheDocument();
    expect(screen.queryByText("Show section boundaries")).toBeInTheDocument();
    // Not clickable buttons when boundaries are off
    expect(screen.queryByRole("button", { name: /Overview/ })).not.toBeInTheDocument();
  });

  it("shows dotted boundaries and a note badge when the toggle is on", () => {
    render(<ContentBlocks initialBlocks={blocks} />);

    fireEvent.click(screen.getByLabelText("Show section boundaries"));

    expect(screen.getByRole("button", { name: /Details/ })).toBeInTheDocument();
    expect(screen.getByText("Note")).toBeInTheDocument(); // badge on the block with a note
  });

  it("opens the notes drawer when a bounded block is clicked", () => {
    render(<ContentBlocks initialBlocks={blocks} />);

    fireEvent.click(screen.getByLabelText("Show section boundaries"));
    fireEvent.click(screen.getByRole("button", { name: /Details/ }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Existing note")).toBeInTheDocument();
  });

  it("switches to slide view and navigates between slides", () => {
    render(<ContentBlocks initialBlocks={blocks} />);

    fireEvent.click(screen.getByText("Slides"));

    expect(screen.getByText("Slide 1 / 2")).toBeInTheDocument();
    expect(screen.getByText("Overview body.")).toBeInTheDocument();
    expect(screen.getByText("Add notes")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Next →"));

    expect(screen.getByText("Slide 2 / 2")).toBeInTheDocument();
    expect(screen.getByText("Details body.")).toBeInTheDocument();
    expect(screen.getByText("View/edit notes")).toBeInTheDocument();
  });

  it("updates the note badge after saving a note", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ body: "New note", updated_at: "2026-10-15T01:00:00Z" }),
    });

    render(<ContentBlocks initialBlocks={blocks} />);
    fireEvent.click(screen.getByLabelText("Show section boundaries"));
    fireEvent.click(screen.getByRole("button", { name: /Overview/ }));

    fireEvent.change(screen.getByPlaceholderText(/Add your notes/), {
      target: { value: "New note" },
    });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    const badges = screen.getAllByText("Note");
    expect(badges).toHaveLength(2); // now both blocks show the badge
  });

  it("shows an empty state when there are no content blocks", () => {
    render(<ContentBlocks initialBlocks={[]} />);

    expect(screen.getByText("No content for this lesson yet.")).toBeInTheDocument();
  });
});

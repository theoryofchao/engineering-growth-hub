import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ContentBlocks } from "./content-blocks";

const blocks = [
  { id: 1, sequence: 1, heading: "Overview", body: "Overview body.", note: null, exercises: [] },
  {
    id: 2,
    sequence: 2,
    heading: "Details",
    body: "Details body.",
    note: { body: "Existing note", updated_at: "2026-10-15T00:00:00Z" },
    exercises: [],
  },
];

describe("ContentBlocks", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    Element.prototype.scrollIntoView = vi.fn(); // not implemented in jsdom
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("renders all blocks in page view by default, without boundaries shown", () => {
    render(<ContentBlocks initialBlocks={blocks} learningSessionId={1} />);

    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Details")).toBeInTheDocument();
  });

  it("opens notes on click even when 'Show section boundaries' is off (the default)", () => {
    // Regression test: sections must be clickable without first finding and
    // enabling the boundaries toggle — that was the reported bug.
    render(<ContentBlocks initialBlocks={blocks} learningSessionId={1} />);

    fireEvent.click(screen.getByRole("button", { name: /Overview/ }));

    expect(screen.getByRole("dialog", { name: /Notes for Overview/ })).toBeInTheDocument();
  });

  it("shows a note badge regardless of the boundaries toggle", () => {
    render(<ContentBlocks initialBlocks={blocks} learningSessionId={1} />);

    expect(screen.getByText("Note")).toBeInTheDocument(); // "Details" already has a note
  });

  it("the 'Show section boundaries' checkbox is off by default and can be toggled", () => {
    render(<ContentBlocks initialBlocks={blocks} learningSessionId={1} />);

    const checkbox = screen.getByLabelText("Show section boundaries") as HTMLInputElement;
    expect(checkbox.checked).toBe(false);

    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  it("opens the notes panel as a modal when a block is clicked", () => {
    render(<ContentBlocks initialBlocks={blocks} learningSessionId={1} />);

    fireEvent.click(screen.getByRole("button", { name: /Details/ }));

    const dialog = screen.getByRole("dialog", { name: /Notes for Details/ });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByDisplayValue("Existing note")).toBeInTheDocument();
  });

  it("shows the position label and disables Previous on the first block", () => {
    render(<ContentBlocks initialBlocks={blocks} learningSessionId={1} />);

    fireEvent.click(screen.getByRole("button", { name: /Overview/ }));

    expect(screen.getByText(/1 of 2/)).toBeInTheDocument();
    expect(screen.getByText("‹ Previous section")).toBeDisabled();
    expect(screen.getByText("Next section ›")).toBeEnabled();
  });

  it("Next section in the panel moves to the next block in page view and scrolls it into view", async () => {
    render(<ContentBlocks initialBlocks={blocks} learningSessionId={1} />);

    fireEvent.click(screen.getByRole("button", { name: /Overview/ }));
    fireEvent.click(screen.getByText("Next section ›"));

    await waitFor(() =>
      expect(screen.getByRole("dialog", { name: /Notes for Details/ })).toBeInTheDocument(),
    );
    expect(screen.getByDisplayValue("Existing note")).toBeInTheDocument();
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    // Now on the last block, so Next is disabled and Previous is enabled.
    expect(screen.getByText("Next section ›")).toBeDisabled();
    expect(screen.getByText("‹ Previous section")).toBeEnabled();
  });

  it("Next section in the panel advances the actual slide when in slide view", async () => {
    render(<ContentBlocks initialBlocks={blocks} learningSessionId={1} />);

    fireEvent.click(screen.getByText("Slides"));
    fireEvent.click(screen.getByText("Add notes")); // opens notes for slide 1

    fireEvent.click(screen.getByText("Next section ›"));

    await waitFor(() => expect(screen.getByText("Slide 2 / 2")).toBeInTheDocument());
    // The panel followed the slide and shows slide 2's existing note.
    expect(screen.getByDisplayValue("Existing note")).toBeInTheDocument();
  });

  it("auto-follows slide navigation (main Next button) when notes are open and there are no unsaved changes", async () => {
    render(<ContentBlocks initialBlocks={blocks} learningSessionId={1} />);

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

    render(<ContentBlocks initialBlocks={blocks} learningSessionId={1} />);
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

    render(<ContentBlocks initialBlocks={blocks} learningSessionId={1} />);
    fireEvent.click(screen.getByText("Slides"));
    fireEvent.click(screen.getByText("Add notes"));

    fireEvent.change(screen.getByPlaceholderText(/Add your notes/), {
      target: { value: "draft text" },
    });
    fireEvent.click(screen.getByText("Next →"));

    expect(window.confirm).toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalledWith(
      expect.stringContaining("/note"),
      expect.objectContaining({ method: "PUT" }),
    );
    await waitFor(() => expect(screen.getByText("Slide 2 / 2")).toBeInTheDocument());
  });

  it("does not prompt when closing without any unsaved changes", () => {
    vi.spyOn(window, "confirm");
    render(<ContentBlocks initialBlocks={blocks} learningSessionId={1} />);

    fireEvent.click(screen.getByRole("button", { name: /Overview/ }));
    fireEvent.click(screen.getByLabelText("Close notes"));

    expect(window.confirm).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("updates the note badge after saving a note", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ body: "New note", updated_at: "2026-10-15T01:00:00Z" }),
    });

    render(<ContentBlocks initialBlocks={blocks} learningSessionId={1} />);
    fireEvent.click(screen.getByRole("button", { name: /Overview/ }));

    fireEvent.change(screen.getByPlaceholderText(/Add your notes/), {
      target: { value: "New note" },
    });
    fireEvent.click(screen.getByText("Save"));

    await waitFor(() => expect(screen.getAllByText("Note")).toHaveLength(2));
  });

  it("shows an empty state when there are no content blocks", () => {
    render(<ContentBlocks initialBlocks={[]} learningSessionId={1} />);

    expect(screen.getByText("No content for this lesson yet.")).toBeInTheDocument();
  });

  const blocksWithExercise = [
    {
      id: 1,
      sequence: 1,
      heading: "Overview",
      body: "Overview body.",
      note: null,
      exercises: [
        {
          id: 9,
          type: "multiple_choice" as const,
          prompt: "Pinned question?",
          options: ["Yes", "No"],
        },
      ],
    },
  ];

  it("renders a block-pinned exercise in page view, and it's not nested inside the notes button", () => {
    render(<ContentBlocks initialBlocks={blocksWithExercise} learningSessionId={1} />);

    expect(screen.getByText("Pinned question?")).toBeInTheDocument();
    const radio = screen.getByLabelText(/Yes/);
    // The exercise's interactive controls must not be inside the
    // heading's notes-toggle <button> — nesting interactive elements in
    // a <button> is invalid HTML and breaks click targeting.
    expect(radio.closest("button")).toBeNull();
  });

  it("clicking the exercise's own radio button does not open the notes panel", () => {
    render(<ContentBlocks initialBlocks={blocksWithExercise} learningSessionId={1} />);

    fireEvent.click(screen.getByLabelText(/Yes/));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders a block-pinned exercise in slide view too", () => {
    render(<ContentBlocks initialBlocks={blocksWithExercise} learningSessionId={1} />);

    fireEvent.click(screen.getByText("Slides"));

    expect(screen.getByText("Pinned question?")).toBeInTheDocument();
  });

  describe("completion tracking", () => {
    it("starts with nothing complete and updates the count on toggle", () => {
      render(<ContentBlocks initialBlocks={blocks} learningSessionId={1} />);

      expect(screen.getByText("0/2 complete")).toBeInTheDocument();

      fireEvent.click(screen.getAllByLabelText("Mark as done")[0]);

      expect(screen.getByText("1/2 complete")).toBeInTheDocument();
    });

    it("toggling again marks a block back as not done", () => {
      render(<ContentBlocks initialBlocks={blocks} learningSessionId={1} />);

      const toggle = screen.getAllByLabelText("Mark as done")[0];
      fireEvent.click(toggle);
      expect(screen.getByText("1/2 complete")).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText("Mark as not done"));
      expect(screen.getByText("0/2 complete")).toBeInTheDocument();
    });

    it("'Show only incomplete' hides a block once it's marked done", () => {
      render(<ContentBlocks initialBlocks={blocks} learningSessionId={1} />);

      fireEvent.click(screen.getAllByLabelText("Mark as done")[0]); // completes "Overview"
      fireEvent.click(screen.getByLabelText("Show only incomplete"));

      expect(screen.queryByText("Overview")).not.toBeInTheDocument();
      expect(screen.getByText("Details")).toBeInTheDocument();
    });

    it("shows the lesson-complete banner only once every block is done", () => {
      render(<ContentBlocks initialBlocks={blocks} learningSessionId={1} />);

      expect(screen.queryByText("Lesson complete ✓")).not.toBeInTheDocument();

      for (const toggle of screen.getAllByLabelText("Mark as done")) fireEvent.click(toggle);

      expect(screen.getByText("Lesson complete ✓")).toBeInTheDocument();
    });

    it("'Jump to next incomplete slide' moves to the next slide that isn't done yet", () => {
      render(<ContentBlocks initialBlocks={blocks} learningSessionId={1} />);
      fireEvent.click(screen.getByText("Slides", { exact: true }));

      // Slide 1 ("Overview") is current and incomplete; mark it done, then
      // jump should skip to slide 2 ("Details"), the only one left.
      fireEvent.click(screen.getByLabelText("Mark as done"));
      fireEvent.click(screen.getByText("Jump to next incomplete slide"));

      expect(screen.getByText("Slide 2 / 2")).toBeInTheDocument();
    });

    it("hides 'Jump to next incomplete slide' once the lesson is fully complete", () => {
      render(<ContentBlocks initialBlocks={blocks} learningSessionId={1} />);
      fireEvent.click(screen.getByText("Slides", { exact: true }));

      fireEvent.click(screen.getByLabelText("Mark as done")); // slide 1
      fireEvent.click(screen.getByText("Jump to next incomplete slide")); // -> slide 2
      fireEvent.click(screen.getByLabelText("Mark as done")); // slide 2

      expect(screen.queryByText("Jump to next incomplete slide")).not.toBeInTheDocument();
    });
  });
});

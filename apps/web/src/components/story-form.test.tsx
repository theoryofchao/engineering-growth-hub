import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { StoryForm } from "./story-form";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

const competenciesFixture = [
  { id: 76, title: "Technical Leadership", slug: "76-technical-leadership", description: "..." },
  { id: 77, title: "Mentorship & Team Development", slug: "77-mentorship", description: null },
];

const storyFixture = {
  id: 5,
  title: "Original title",
  competency: competenciesFixture[0],
  situation: "s",
  task: "t",
  action: "a",
  result: "r",
  reflection: null,
  quantified_outcome: null,
};

function mockFetchFor(competencies = competenciesFixture, story = storyFixture) {
  (fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
    if (url.includes("/competencies")) {
      return Promise.resolve({ ok: true, status: 200, json: async () => competencies });
    }
    if (url.includes("/stories/")) {
      return Promise.resolve({ ok: true, status: 200, json: async () => story });
    }
    return Promise.resolve({ ok: true, status: 201, json: async () => story });
  });
}

describe("StoryForm", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    push.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders an empty form in create mode", async () => {
    mockFetchFor();

    render(<StoryForm mode="create" />);

    await waitFor(() => expect(screen.getByText("Select a competency")).toBeInTheDocument());
    expect(screen.getByPlaceholderText("What was the context?")).toHaveValue("");
    expect(screen.getByText("Create story")).toBeInTheDocument();
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
  });

  it("prefills the form from the existing story in edit mode", async () => {
    mockFetchFor();

    render(<StoryForm mode="edit" storyId={5} />);

    await waitFor(() => expect(screen.getByDisplayValue("Original title")).toBeInTheDocument());
    expect(screen.getByDisplayValue("s")).toBeInTheDocument();
    expect(screen.getByText("Save changes")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("submits a new story and navigates to the leadership page", async () => {
    mockFetchFor();

    render(<StoryForm mode="create" />);
    await waitFor(() => expect(screen.getByText("Select a competency")).toBeInTheDocument());

    fireEvent.change(screen.getByText("Competency").closest("label")!.querySelector("select")!, {
      target: { value: "76" },
    });
    fireEvent.change(screen.getByPlaceholderText("A short, memorable name for this story"), {
      target: { value: "My story" },
    });
    fireEvent.change(screen.getByPlaceholderText("What was the context?"), {
      target: { value: "s" },
    });
    fireEvent.change(screen.getByPlaceholderText("What were you responsible for?"), {
      target: { value: "t" },
    });
    fireEvent.change(screen.getByPlaceholderText("What did you specifically do?"), {
      target: { value: "a" },
    });
    fireEvent.change(screen.getByPlaceholderText("What happened?"), {
      target: { value: "r" },
    });
    fireEvent.click(screen.getByText("Create story"));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/leadership"));
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/leadership/stories"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("shows an error message when submission fails", async () => {
    mockFetchFor();
    (fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string, init?: RequestInit) => {
      if (url.includes("/competencies")) {
        return Promise.resolve({ ok: true, status: 200, json: async () => competenciesFixture });
      }
      if (init?.method === "POST") {
        return Promise.resolve({
          ok: false,
          status: 400,
          json: async () => ({ error: "title is required" }),
        });
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => storyFixture });
    });

    render(<StoryForm mode="create" />);
    await waitFor(() => expect(screen.getByText("Select a competency")).toBeInTheDocument());

    fireEvent.change(screen.getByText("Competency").closest("label")!.querySelector("select")!, {
      target: { value: "76" },
    });
    fireEvent.change(screen.getByPlaceholderText("A short, memorable name for this story"), {
      target: { value: "My story" },
    });
    for (const placeholder of [
      "What was the context?",
      "What were you responsible for?",
      "What did you specifically do?",
      "What happened?",
    ]) {
      fireEvent.change(screen.getByPlaceholderText(placeholder), { target: { value: "x" } });
    }
    fireEvent.click(screen.getByText("Create story"));

    await waitFor(() => expect(screen.getByText("title is required")).toBeInTheDocument());
    expect(push).not.toHaveBeenCalled();
  });

  it("deletes the story after confirmation and navigates away", async () => {
    mockFetchFor();
    vi.stubGlobal("confirm", vi.fn().mockReturnValue(true));

    render(<StoryForm mode="edit" storyId={5} />);
    await waitFor(() => expect(screen.getByDisplayValue("Original title")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/leadership"));
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/leadership/stories/5"),
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("shows a not-found state for a missing story", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
      if (url.includes("/competencies")) {
        return Promise.resolve({ ok: true, status: 200, json: async () => competenciesFixture });
      }
      return Promise.resolve({ ok: false, status: 404, json: async () => ({}) });
    });

    render(<StoryForm mode="edit" storyId={999} />);

    await waitFor(() => expect(screen.getByText("Story not found.")).toBeInTheDocument());
  });
});

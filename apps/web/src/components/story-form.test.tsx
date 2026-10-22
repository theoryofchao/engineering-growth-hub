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
  rubric_scores: {},
  overall_score: null as number | null,
};

const rubricDimensionsFixture = [
  { key: "clarity", label: "Clarity", description: "Is it easy to follow?" },
  { key: "specificity", label: "Specificity of Action", description: "Concrete actions?" },
];

function mockFetchFor(competencies = competenciesFixture, story = storyFixture) {
  (fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
    if (url.includes("/competencies")) {
      return Promise.resolve({ ok: true, status: 200, json: async () => competencies });
    }
    if (url.includes("/rubric-dimensions")) {
      return Promise.resolve({ ok: true, status: 200, json: async () => rubricDimensionsFixture });
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

  it("does not show the rubric section in create mode", async () => {
    mockFetchFor();

    render(<StoryForm mode="create" />);

    await waitFor(() => expect(screen.getByText("Select a competency")).toBeInTheDocument());
    expect(screen.queryByText("Self-assessment rubric")).not.toBeInTheDocument();
  });

  it("shows the rubric section with fetched dimensions in edit mode", async () => {
    mockFetchFor();

    render(<StoryForm mode="edit" storyId={5} />);

    await waitFor(() => expect(screen.getByText("Self-assessment rubric")).toBeInTheDocument());
    expect(screen.getByText("Clarity")).toBeInTheDocument();
    expect(screen.getByText("Specificity of Action")).toBeInTheDocument();
  });

  it("shows the overall score once the story already has one", async () => {
    mockFetchFor(competenciesFixture, { ...storyFixture, overall_score: 3.4 });

    render(<StoryForm mode="edit" storyId={5} />);

    await waitFor(() => expect(screen.getByText("3.4 / 5 overall")).toBeInTheDocument());
  });

  it("includes rubric scores in the save payload", async () => {
    mockFetchFor();

    render(<StoryForm mode="edit" storyId={5} />);
    await waitFor(() => expect(screen.getByText("Clarity")).toBeInTheDocument());

    fireEvent.change(screen.getByText("Clarity").closest("label")!.querySelector("select")!, {
      target: { value: "4" },
    });
    fireEvent.click(screen.getByText("Save changes"));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/leadership"));
    const patchCall = (fetch as ReturnType<typeof vi.fn>).mock.calls.find(
      ([, init]) => init?.method === "PATCH",
    );
    const body = JSON.parse(patchCall![1].body);
    expect(body.rubric_scores).toEqual({ clarity: 4 });
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

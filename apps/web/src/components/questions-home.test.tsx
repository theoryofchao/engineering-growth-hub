import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { QuestionsHome } from "./questions-home";

const competenciesFixture = [
  { id: 76, title: "Technical Leadership", slug: "76-technical-leadership", description: "..." },
  { id: 77, title: "Mentorship & Team Development", slug: "77-mentorship", description: null },
];

const questionsFixture = [
  {
    id: 1,
    prompt: "Tell me about a tough technical call.",
    source: "seed" as const,
    competency: competenciesFixture[0],
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: 2,
    prompt: "A question I was actually asked once.",
    source: "custom" as const,
    competency: competenciesFixture[0],
    created_at: "2026-01-01T00:00:00Z",
  },
];

function mockFetchFor(questions = questionsFixture) {
  (fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
    if (url.includes("/competencies")) {
      return Promise.resolve({ ok: true, status: 200, json: async () => competenciesFixture });
    }
    return Promise.resolve({ ok: true, status: 200, json: async () => questions });
  });
}

describe("QuestionsHome", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.stubGlobal("confirm", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("groups questions under their competency", async () => {
    mockFetchFor();

    render(<QuestionsHome />);

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Technical Leadership" })).toBeInTheDocument(),
    );
    expect(screen.getByText("Tell me about a tough technical call.")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Mentorship & Team Development" }),
    ).toBeInTheDocument();
    expect(screen.getByText("No questions yet.")).toBeInTheDocument();
  });

  it("shows a Delete action only for custom questions, not seeded ones", async () => {
    mockFetchFor();

    render(<QuestionsHome />);

    await waitFor(() =>
      expect(screen.getByText("Tell me about a tough technical call.")).toBeInTheDocument(),
    );

    const seededItem = screen
      .getByText("Tell me about a tough technical call.")
      .closest("li") as HTMLElement;
    const customItem = screen
      .getByText("A question I was actually asked once.")
      .closest("li") as HTMLElement;

    expect(seededItem.querySelector("button")).toBeNull();
    expect(customItem.querySelector("button")).not.toBeNull();
  });

  it("adds a new custom question to the list on submit", async () => {
    mockFetchFor([]);
    render(<QuestionsHome />);

    await waitFor(() => expect(screen.getByText("Add your own question")).toBeInTheDocument());

    const created = {
      id: 3,
      prompt: "My new question",
      source: "custom" as const,
      competency: competenciesFixture[0],
      created_at: "2026-01-01T00:00:00Z",
    };
    (fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string, options?: RequestInit) => {
      if (options?.method === "POST") {
        return Promise.resolve({ ok: true, status: 201, json: async () => created });
      }
      if (url.includes("/competencies")) {
        return Promise.resolve({ ok: true, status: 200, json: async () => competenciesFixture });
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => [] });
    });

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "76" } });
    fireEvent.change(screen.getByPlaceholderText(/question an interviewer/), {
      target: { value: "My new question" },
    });
    fireEvent.click(screen.getByText("Add question"));

    await waitFor(() => expect(screen.getByText("My new question")).toBeInTheDocument());
  });

  it("deletes a custom question after confirmation", async () => {
    mockFetchFor();
    vi.mocked(confirm).mockReturnValue(true);
    render(<QuestionsHome />);

    await waitFor(() =>
      expect(screen.getByText("A question I was actually asked once.")).toBeInTheDocument(),
    );

    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true, status: 204 });
    const customItem = screen
      .getByText("A question I was actually asked once.")
      .closest("li") as HTMLElement;
    fireEvent.click(customItem.querySelector("button") as HTMLButtonElement);

    await waitFor(() =>
      expect(screen.queryByText("A question I was actually asked once.")).not.toBeInTheDocument(),
    );
  });

  it("shows an error state when a request fails", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Failed to fetch"));

    render(<QuestionsHome />);

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
  });
});

import { render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LeadershipHome } from "./leadership-home";

const competenciesFixture = [
  { id: 76, title: "Technical Leadership", slug: "76-technical-leadership", description: "..." },
  { id: 77, title: "Mentorship & Team Development", slug: "77-mentorship", description: null },
];

const storiesFixture = [
  {
    id: 1,
    title: "Led the incident response",
    competency: competenciesFixture[0],
    result: "Resolved in 20 minutes",
    overall_score: null as number | null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
];

describe("LeadershipHome", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("groups stories under their competency", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
      if (url.includes("/competencies")) {
        return Promise.resolve({ ok: true, status: 200, json: async () => competenciesFixture });
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => storiesFixture });
    });

    render(<LeadershipHome />);

    await waitFor(() => expect(screen.getByText("Technical Leadership")).toBeInTheDocument());
    const competencyCard = screen.getByText("Technical Leadership").closest("div")
      ?.parentElement as HTMLElement;
    expect(within(competencyCard).getByText("Led the incident response")).toBeInTheDocument();
    expect(screen.getByText("1 story")).toBeInTheDocument();
    expect(screen.getByText("0 stories")).toBeInTheDocument();
  });

  it("links to the practice-questions page", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
      if (url.includes("/competencies")) {
        return Promise.resolve({ ok: true, status: 200, json: async () => competenciesFixture });
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => [] });
    });

    render(<LeadershipHome />);

    await waitFor(() => expect(screen.getByText("Practice questions")).toBeInTheDocument());
    expect(screen.getByText("Practice questions").closest("a")).toHaveAttribute(
      "href",
      "/leadership/questions",
    );
  });

  it("links to the new-story page", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
      if (url.includes("/competencies")) {
        return Promise.resolve({ ok: true, status: 200, json: async () => competenciesFixture });
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => [] });
    });

    render(<LeadershipHome />);

    await waitFor(() => expect(screen.getByText("+ New story")).toBeInTheDocument());
    expect(screen.getByText("+ New story").closest("a")).toHaveAttribute(
      "href",
      "/leadership/stories/new",
    );
  });

  it("shows unscored stories under 'Needs work'", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
      if (url.includes("/competencies")) {
        return Promise.resolve({ ok: true, status: 200, json: async () => competenciesFixture });
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => storiesFixture });
    });

    render(<LeadershipHome />);

    await waitFor(() => expect(screen.getByText("Needs work")).toBeInTheDocument());
    expect(screen.getByText("Not yet scored:")).toBeInTheDocument();
  });

  it("shows low-scoring stories sorted ascending, above unscored ones", async () => {
    const mixedStories = [
      { ...storiesFixture[0], id: 1, title: "Unscored story", overall_score: null },
      { ...storiesFixture[0], id: 2, title: "Weak story", overall_score: 1.5 },
      { ...storiesFixture[0], id: 3, title: "Okay story", overall_score: 3.0 },
      { ...storiesFixture[0], id: 4, title: "Strong story", overall_score: 4.8 },
    ];
    (fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
      if (url.includes("/competencies")) {
        return Promise.resolve({ ok: true, status: 200, json: async () => competenciesFixture });
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => mixedStories });
    });

    render(<LeadershipHome />);

    await waitFor(() => expect(screen.getByText("Needs work")).toBeInTheDocument());
    const needsWork = screen.getByText("Needs work").closest("div") as HTMLElement;
    const titles = Array.from(needsWork.querySelectorAll("a")).map((a) => a.textContent);
    expect(titles[0]).toContain("Weak story");
    expect(titles[1]).toContain("Okay story");
    expect(titles[2]).toContain("Unscored story");
    expect(needsWork.textContent).not.toContain("Strong story");
  });

  it("shows no 'Needs work' section when every story scores at or above the threshold", async () => {
    const strongStories = [{ ...storiesFixture[0], overall_score: 4.5 }];
    (fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
      if (url.includes("/competencies")) {
        return Promise.resolve({ ok: true, status: 200, json: async () => competenciesFixture });
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => strongStories });
    });

    render(<LeadershipHome />);

    await waitFor(() => expect(screen.getByText("Led the incident response")).toBeInTheDocument());
    expect(screen.queryByText("Needs work")).not.toBeInTheDocument();
  });

  it("shows an error state when a request fails", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Failed to fetch"));

    render(<LeadershipHome />);

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
  });
});

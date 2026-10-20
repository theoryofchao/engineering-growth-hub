import { render, screen, waitFor } from "@testing-library/react";
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
    expect(screen.getByText("Led the incident response")).toBeInTheDocument();
    expect(screen.getByText("1 story")).toBeInTheDocument();
    expect(screen.getByText("0 stories")).toBeInTheDocument();
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

  it("shows an error state when a request fails", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Failed to fetch"));

    render(<LeadershipHome />);

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
  });
});

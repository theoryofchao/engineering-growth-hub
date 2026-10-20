import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DashboardSummary } from "./dashboard-summary";

describe("DashboardSummary", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows total time and per-section progress", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        total_study_seconds: 1500,
        sections: [
          {
            section_id: 1,
            title: "Browser Rendering",
            slug: "browser-rendering",
            status: "practiced",
            exercises_attempted: 1,
            exercises_correct: 1,
          },
        ],
      }),
    });

    render(<DashboardSummary />);

    await waitFor(() => expect(screen.getByText("25m")).toBeInTheDocument());
    expect(screen.getByText("Browser Rendering")).toBeInTheDocument();
    expect(screen.getByText("Practiced")).toBeInTheDocument();
    expect(screen.getByText("1 / 1 correct")).toBeInTheDocument();
  });

  it("shows an empty state with no sections started", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ total_study_seconds: 0, sections: [] }),
    });

    render(<DashboardSummary />);

    await waitFor(() => expect(screen.getByText(/No lessons started yet/)).toBeInTheDocument());
  });

  it("shows an error state when the request fails", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Failed to fetch"));

    render(<DashboardSummary />);

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
  });
});

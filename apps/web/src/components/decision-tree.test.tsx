import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DecisionTree } from "./decision-tree";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

// jsdom doesn't implement ResizeObserver, which @xyflow/react relies on
// to size its viewport -- a minimal no-op stub is enough for rendering.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const competency = {
  id: 76,
  title: "Technical Leadership",
  slug: "76-technical-leadership",
  description: "...",
};

const questionFixture = {
  id: 1,
  prompt: "Tell me about a tough technical call.",
  source: "seed" as const,
  competency,
  created_at: "2026-01-01T00:00:00Z",
};

const storiesFixture = [
  {
    id: 5,
    title: "Led the incident response",
    competency,
    result: "Resolved in 20 minutes",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
];

function mockFetchFor(stories: unknown = storiesFixture, question: unknown = questionFixture) {
  (fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
    if (url.includes("/questions/")) {
      return Promise.resolve({ ok: true, status: 200, json: async () => question });
    }
    return Promise.resolve({ ok: true, status: 200, json: async () => stories });
  });
}

describe("DecisionTree", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.stubGlobal("ResizeObserver", ResizeObserverStub);
    push.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the question, its competency, and its stories as nodes", async () => {
    mockFetchFor();

    render(<DecisionTree questionId={1} />);

    await waitFor(() =>
      expect(screen.getByText("Tell me about a tough technical call.")).toBeInTheDocument(),
    );
    expect(screen.getByText("Technical Leadership")).toBeInTheDocument();
    expect(screen.getByText("Led the incident response")).toBeInTheDocument();
  });

  it("shows a placeholder node when the competency has no stories yet", async () => {
    mockFetchFor([]);

    render(<DecisionTree questionId={1} />);

    await waitFor(() => expect(screen.getByText("No stories yet — add one")).toBeInTheDocument());
  });

  it("shows a not-found state for a missing question", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: "Behavioral question not found" }),
    });

    render(<DecisionTree questionId={999} />);

    await waitFor(() => expect(screen.getByText("Question not found.")).toBeInTheDocument());
  });
});

import { render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TopicOverview } from "./topic-overview";

const lockedTopicFixture = {
  id: 3,
  title: "System Design Methodology",
  slug: "33-system-design-methodology",
  description: "Lead a system design discussion from ambiguity to decision.",
  proficiency_tier: "D",
  status: "not_started",
  is_locked: true,
  learning_sessions: [{ id: 9, title: "Framing the Problem", sequence: 1, duration_minutes: 25 }],
  prerequisites: [
    { id: 1, title: "Data Structures", slug: "01-data-structures", status: "not_started" },
  ],
  unmet_prerequisites: [
    { id: 1, title: "Data Structures", slug: "01-data-structures", status: "not_started" },
  ],
  dev_prerequisites_bypassed: false,
};

const unlockedTopicFixture = {
  ...lockedTopicFixture,
  is_locked: false,
  unmet_prerequisites: [],
};

const devBypassedTopicFixture = {
  ...lockedTopicFixture,
  is_locked: false,
  dev_prerequisites_bypassed: true,
};

describe("TopicOverview", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows a lock banner with prerequisite links and disabled sessions when locked", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => lockedTopicFixture,
    });

    render(<TopicOverview topicId={3} />);

    await waitFor(() => expect(screen.getByText("System Design Methodology")).toBeInTheDocument());

    const banner = screen.getByRole("alert");
    const prereqLink = within(banner).getByText("Data Structures").closest("a");
    expect(prereqLink).toHaveAttribute("href", "/topics/1");

    const sessionEntry = screen.getByText(/Framing the Problem/).closest("div");
    expect(sessionEntry).toHaveAttribute("aria-disabled", "true");
    expect(screen.queryByText(/Framing the Problem/)?.closest("a")).toBeNull();
  });

  it("links to sessions when unlocked and shows no lock banner", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => unlockedTopicFixture,
    });

    render(<TopicOverview topicId={3} />);

    const sessionLink = await waitFor(() => screen.getByText(/Framing the Problem/).closest("a"));
    expect(sessionLink).toHaveAttribute("href", "/learning/9");
    expect(screen.queryByText("Locked")).not.toBeInTheDocument();
  });

  it("shows a loud dev-bypass banner and unlocked sessions when the bypass is active", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => devBypassedTopicFixture,
    });

    render(<TopicOverview topicId={3} />);

    await waitFor(() => expect(screen.getByText(/DEV MODE/)).toBeInTheDocument());
    const sessionLink = screen.getByText(/Framing the Problem/).closest("a");
    expect(sessionLink).toHaveAttribute("href", "/learning/9");
  });

  it("shows a not-found state for a missing topic", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    });

    render(<TopicOverview topicId={999} />);

    await waitFor(() => expect(screen.getByText("Topic not found.")).toBeInTheDocument());
  });

  it("shows an error state when the request fails", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Failed to fetch"));

    render(<TopicOverview topicId={3} />);

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
  });
});

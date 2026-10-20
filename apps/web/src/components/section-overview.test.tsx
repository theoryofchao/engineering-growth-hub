import { render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SectionOverview } from "./section-overview";

const topicRef = { name: "Software Architecture", slug: "software-architecture" };
const prereqTopicRef = {
  name: "Computer Science Foundations",
  slug: "computer-science-foundations",
};

const lockedSectionFixture = {
  id: 3,
  title: "System Design Methodology",
  slug: "33-system-design-methodology",
  topic: topicRef,
  description: "Lead a system design discussion from ambiguity to decision.",
  proficiency_tier: "D",
  status: "not_started",
  is_locked: true,
  learning_sessions: [{ id: 9, title: "Framing the Problem", sequence: 1, duration_minutes: 25 }],
  prerequisites: [
    {
      id: 1,
      title: "Data Structures",
      slug: "01-data-structures",
      topic: prereqTopicRef,
      status: "not_started",
    },
  ],
  unmet_prerequisites: [
    {
      id: 1,
      title: "Data Structures",
      slug: "01-data-structures",
      topic: prereqTopicRef,
      status: "not_started",
    },
  ],
  dev_prerequisites_bypassed: false,
};

const unlockedSectionFixture = {
  ...lockedSectionFixture,
  is_locked: false,
  unmet_prerequisites: [],
};

const devBypassedSectionFixture = {
  ...lockedSectionFixture,
  is_locked: false,
  dev_prerequisites_bypassed: true,
};

describe("SectionOverview", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows a lock banner with prerequisite links (across topics) and disabled sessions when locked", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => lockedSectionFixture,
    });

    render(
      <SectionOverview
        topicSlug="software-architecture"
        sectionSlug="33-system-design-methodology"
      />,
    );

    await waitFor(() => expect(screen.getByText("System Design Methodology")).toBeInTheDocument());

    const banner = screen.getByRole("alert");
    const prereqLink = within(banner).getByText("Data Structures").closest("a");
    expect(prereqLink).toHaveAttribute(
      "href",
      "/learn/computer-science-foundations/01-data-structures",
    );

    const sessionEntry = screen.getByText(/Framing the Problem/).closest("div");
    expect(sessionEntry).toHaveAttribute("aria-disabled", "true");
    expect(screen.queryByText(/Framing the Problem/)?.closest("a")).toBeNull();
  });

  it("links to sessions when unlocked and shows no lock banner", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => unlockedSectionFixture,
    });

    render(
      <SectionOverview
        topicSlug="software-architecture"
        sectionSlug="33-system-design-methodology"
      />,
    );

    const sessionLink = await waitFor(() => screen.getByText(/Framing the Problem/).closest("a"));
    expect(sessionLink).toHaveAttribute(
      "href",
      "/learn/software-architecture/33-system-design-methodology/9",
    );
    expect(screen.queryByText("Locked")).not.toBeInTheDocument();
  });

  it("shows a loud dev-bypass banner and unlocked sessions when the bypass is active", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => devBypassedSectionFixture,
    });

    render(
      <SectionOverview
        topicSlug="software-architecture"
        sectionSlug="33-system-design-methodology"
      />,
    );

    await waitFor(() => expect(screen.getByText(/DEV MODE/)).toBeInTheDocument());
    const sessionLink = screen.getByText(/Framing the Problem/).closest("a");
    expect(sessionLink).toHaveAttribute(
      "href",
      "/learn/software-architecture/33-system-design-methodology/9",
    );
  });

  it("shows a not-found state for a missing section", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    });

    render(<SectionOverview topicSlug="software-architecture" sectionSlug="not-a-real-section" />);

    await waitFor(() => expect(screen.getByText("Section not found.")).toBeInTheDocument());
  });

  it("shows an error state when the request fails", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Failed to fetch"));

    render(
      <SectionOverview
        topicSlug="software-architecture"
        sectionSlug="33-system-design-methodology"
      />,
    );

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
  });
});

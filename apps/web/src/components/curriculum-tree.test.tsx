import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CurriculumTree } from "./curriculum-tree";

const topicsFixture = [
  {
    id: 1,
    name: "Computer Science Foundations",
    slug: "computer-science-foundations",
    description: "Algorithms, memory, operating systems",
    sections: [
      {
        id: 1,
        title: "Data Structures",
        slug: "01-data-structures",
        description: "...",
        proficiency_tier: "D",
        has_content: false,
        first_learning_session_id: null,
        status: "not_started",
        is_locked: false,
        unmet_prerequisites: [],
        dev_prerequisites_bypassed: false,
      },
    ],
  },
  {
    id: 2,
    name: "Web & Frontend",
    slug: "web-frontend",
    description: "Browser, React",
    sections: [
      {
        id: 2,
        title: "Browser Rendering",
        slug: "browser-rendering",
        description: "...",
        proficiency_tier: "D",
        has_content: true,
        first_learning_session_id: 7,
        status: "mastered",
        is_locked: false,
        unmet_prerequisites: [],
        dev_prerequisites_bypassed: false,
      },
    ],
  },
  {
    id: 3,
    name: "Software Architecture",
    slug: "software-architecture",
    description: "System design",
    sections: [
      {
        id: 3,
        title: "System Design Methodology",
        slug: "33-system-design-methodology",
        description: "...",
        proficiency_tier: "D",
        has_content: true,
        first_learning_session_id: 9,
        status: "not_started",
        is_locked: true,
        unmet_prerequisites: [
          {
            id: 1,
            title: "Data Structures",
            slug: "01-data-structures",
            topic: { name: "Computer Science Foundations", slug: "computer-science-foundations" },
            status: "not_started",
          },
        ],
        dev_prerequisites_bypassed: false,
      },
    ],
  },
];

describe("CurriculumTree", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders topics with both WIP and available sections", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => topicsFixture,
    });

    render(<CurriculumTree />);

    await waitFor(() => expect(screen.getByText("Data Structures")).toBeInTheDocument());
    expect(screen.getByText("WIP")).toBeInTheDocument();

    const availableLink = screen.getByText("Browser Rendering").closest("a");
    expect(availableLink).toHaveAttribute("href", "/learn/web-frontend/browser-rendering");
  });

  it("links a locked section to its overview page and shows a Locked badge", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => topicsFixture,
    });

    render(<CurriculumTree />);

    const lockedLink = await waitFor(() =>
      screen.getByText("System Design Methodology").closest("a"),
    );
    expect(lockedLink).toHaveAttribute(
      "href",
      "/learn/software-architecture/33-system-design-methodology",
    );
    expect(within(lockedLink!).getByText("Locked")).toBeInTheDocument();
  });

  it("filters sections by progress status", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => topicsFixture,
    });

    render(<CurriculumTree />);
    await waitFor(() => expect(screen.getByText("Data Structures")).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText("Progress"), { target: { value: "mastered" } });

    expect(screen.getByText("Browser Rendering")).toBeInTheDocument();
    expect(screen.queryByText("Data Structures")).not.toBeInTheDocument();
    expect(screen.queryByText("System Design Methodology")).not.toBeInTheDocument();
  });

  it("filters sections by lock status", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => topicsFixture,
    });

    render(<CurriculumTree />);
    await waitFor(() => expect(screen.getByText("Data Structures")).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText("Lock status"), { target: { value: "locked" } });

    expect(screen.getByText("System Design Methodology")).toBeInTheDocument();
    expect(screen.queryByText("Browser Rendering")).not.toBeInTheDocument();
  });

  it("shows a completed-sections fraction per topic", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => topicsFixture,
    });

    render(<CurriculumTree />);

    const emptyTopicDetails = await waitFor(() =>
      screen.getByText("Computer Science Foundations").closest("details"),
    );
    const filledTopicDetails = screen.getByText("Web & Frontend").closest("details")!;

    expect(within(emptyTopicDetails!).getByText("0/1 available")).toBeInTheDocument();
    expect(within(filledTopicDetails).getByText("1/1 available")).toBeInTheDocument();
  });

  it("defaults topics with content open and empty topics collapsed", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => topicsFixture,
    });

    render(<CurriculumTree />);

    await waitFor(() => expect(screen.getByText("Data Structures")).toBeInTheDocument());

    const emptyTopicDetails = screen.getByText("Computer Science Foundations").closest("details");
    const filledTopicDetails = screen.getByText("Web & Frontend").closest("details");

    expect(emptyTopicDetails).not.toHaveAttribute("open");
    expect(filledTopicDetails).toHaveAttribute("open");
  });

  it("toggles a topic open when its header is clicked", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => topicsFixture,
    });

    render(<CurriculumTree />);

    await waitFor(() => expect(screen.getByText("Data Structures")).toBeInTheDocument());

    const summary = screen.getByText("Computer Science Foundations").closest("summary")!;
    const details = summary.closest("details");
    expect(details).not.toHaveAttribute("open");

    fireEvent.click(summary);
    expect(details).toHaveAttribute("open");
  });

  it("shows an error state when the request fails", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Failed to fetch"));

    render(<CurriculumTree />);

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
  });

  it("shows no dev-bypass banner when the flag is off", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => topicsFixture,
    });

    render(<CurriculumTree />);

    await waitFor(() => expect(screen.getByText("Data Structures")).toBeInTheDocument());
    expect(screen.queryByText(/DEV MODE/)).not.toBeInTheDocument();
  });

  it("shows a loud dev-bypass banner when the API reports it active", async () => {
    const bypassedFixture = topicsFixture.map((topic) => ({
      ...topic,
      sections: topic.sections.map((section) => ({
        ...section,
        dev_prerequisites_bypassed: true,
      })),
    }));
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => bypassedFixture,
    });

    render(<CurriculumTree />);

    await waitFor(() => expect(screen.getByText(/DEV MODE/)).toBeInTheDocument());
  });
});

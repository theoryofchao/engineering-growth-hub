import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TopicList } from "./topic-list";

const domainsFixture = [
  {
    id: 1,
    name: "Computer Science Foundations",
    description: "Algorithms, memory, operating systems",
    topics: [
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
    description: "Browser, React",
    topics: [
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
    description: "System design",
    topics: [
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
          { id: 1, title: "Data Structures", slug: "01-data-structures", status: "not_started" },
        ],
        dev_prerequisites_bypassed: false,
      },
    ],
  },
];

describe("TopicList", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders domains with both WIP and available topics", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => domainsFixture,
    });

    render(<TopicList />);

    await waitFor(() => expect(screen.getByText("Data Structures")).toBeInTheDocument());
    expect(screen.getByText("WIP")).toBeInTheDocument();

    const availableLink = screen.getByText("Browser Rendering").closest("a");
    expect(availableLink).toHaveAttribute("href", "/topics/2");
  });

  it("links a locked topic to its overview page and shows a Locked badge", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => domainsFixture,
    });

    render(<TopicList />);

    const lockedLink = await waitFor(() =>
      screen.getByText("System Design Methodology").closest("a"),
    );
    expect(lockedLink).toHaveAttribute("href", "/topics/3");
    expect(within(lockedLink!).getByText("Locked")).toBeInTheDocument();
  });

  it("filters topics by progress status", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => domainsFixture,
    });

    render(<TopicList />);
    await waitFor(() => expect(screen.getByText("Data Structures")).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText("Progress"), { target: { value: "mastered" } });

    expect(screen.getByText("Browser Rendering")).toBeInTheDocument();
    expect(screen.queryByText("Data Structures")).not.toBeInTheDocument();
    expect(screen.queryByText("System Design Methodology")).not.toBeInTheDocument();
  });

  it("filters topics by lock status", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => domainsFixture,
    });

    render(<TopicList />);
    await waitFor(() => expect(screen.getByText("Data Structures")).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText("Lock status"), { target: { value: "locked" } });

    expect(screen.getByText("System Design Methodology")).toBeInTheDocument();
    expect(screen.queryByText("Browser Rendering")).not.toBeInTheDocument();
  });

  it("shows a completed-topics fraction per domain", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => domainsFixture,
    });

    render(<TopicList />);

    const emptyDomainDetails = await waitFor(() =>
      screen.getByText("Computer Science Foundations").closest("details"),
    );
    const filledDomainDetails = screen.getByText("Web & Frontend").closest("details")!;

    expect(within(emptyDomainDetails!).getByText("0/1 available")).toBeInTheDocument();
    expect(within(filledDomainDetails).getByText("1/1 available")).toBeInTheDocument();
  });

  it("defaults sections with content open and empty sections collapsed", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => domainsFixture,
    });

    render(<TopicList />);

    await waitFor(() => expect(screen.getByText("Data Structures")).toBeInTheDocument());

    const emptyDomainDetails = screen.getByText("Computer Science Foundations").closest("details");
    const filledDomainDetails = screen.getByText("Web & Frontend").closest("details");

    expect(emptyDomainDetails).not.toHaveAttribute("open");
    expect(filledDomainDetails).toHaveAttribute("open");
  });

  it("toggles a section open when its header is clicked", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => domainsFixture,
    });

    render(<TopicList />);

    await waitFor(() => expect(screen.getByText("Data Structures")).toBeInTheDocument());

    const summary = screen.getByText("Computer Science Foundations").closest("summary")!;
    const details = summary.closest("details");
    expect(details).not.toHaveAttribute("open");

    fireEvent.click(summary);
    expect(details).toHaveAttribute("open");
  });

  it("shows an error state when the request fails", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Failed to fetch"));

    render(<TopicList />);

    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
  });

  it("shows no dev-bypass banner when the flag is off", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => domainsFixture,
    });

    render(<TopicList />);

    await waitFor(() => expect(screen.getByText("Data Structures")).toBeInTheDocument());
    expect(screen.queryByText(/DEV MODE/)).not.toBeInTheDocument();
  });

  it("shows a loud dev-bypass banner when the API reports it active", async () => {
    const bypassedFixture = domainsFixture.map((domain) => ({
      ...domain,
      topics: domain.topics.map((topic) => ({ ...topic, dev_prerequisites_bypassed: true })),
    }));
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => bypassedFixture,
    });

    render(<TopicList />);

    await waitFor(() => expect(screen.getByText(/DEV MODE/)).toBeInTheDocument());
  });
});

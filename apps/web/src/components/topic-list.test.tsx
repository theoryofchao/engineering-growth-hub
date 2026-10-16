import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
    expect(availableLink).toHaveAttribute("href", "/learning/7");
  });

  it("shows a completed-topics fraction per domain", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => domainsFixture,
    });

    render(<TopicList />);

    await waitFor(() => expect(screen.getByText("0/1 available")).toBeInTheDocument());
    expect(screen.getByText("1/1 available")).toBeInTheDocument();
  });

  it("defaults sections with content open and empty sections collapsed", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => domainsFixture,
    });

    render(<TopicList />);

    await waitFor(() => expect(screen.getByText("Data Structures")).toBeInTheDocument());

    const emptyDomainDetails = screen
      .getByText("Computer Science Foundations")
      .closest("details");
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
});

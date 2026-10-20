import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ExampleAccordion } from "./example-accordion";

describe("ExampleAccordion", () => {
  it("renders nothing when there are no examples", () => {
    const { container } = render(<ExampleAccordion examples={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders one collapsed <details> per example, labeled by its summary", () => {
    render(
      <ExampleAccordion
        examples={[
          { label: "Minimal CLAUDE.md", content: "## Commands\n- Tests: `make test`" },
          { label: "A fuller CLAUDE.md", content: "# CLAUDE.md\n\n## 1. Project Overview" },
        ]}
      />,
    );

    const minimal = screen.getByText("Minimal CLAUDE.md").closest("details");
    const fuller = screen.getByText("A fuller CLAUDE.md").closest("details");

    expect(minimal).not.toBeNull();
    expect(fuller).not.toBeNull();
    expect(minimal).not.toHaveAttribute("open");
    expect(screen.getByText(/- Tests: `make test`/)).toBeInTheDocument();
    expect(screen.getByText(/## 1. Project Overview/)).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ReferenceLinks } from "./reference-links";

describe("ReferenceLinks", () => {
  it("renders nothing when there are no links", () => {
    const { container } = render(<ReferenceLinks links={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders each link as an anchor opening in a new tab", () => {
    render(
      <ReferenceLinks
        links={[
          { label: "MDN: Critical rendering path", url: "https://example.com/mdn-crp" },
          { label: "web.dev: Render-blocking resources", url: "https://example.com/webdev-rb" },
        ]}
      />,
    );

    const first = screen.getByRole("link", { name: "MDN: Critical rendering path" });
    expect(first).toHaveAttribute("href", "https://example.com/mdn-crp");
    expect(first).toHaveAttribute("target", "_blank");
    expect(first).toHaveAttribute("rel", "noopener noreferrer");

    expect(
      screen.getByRole("link", { name: "web.dev: Render-blocking resources" }),
    ).toHaveAttribute("href", "https://example.com/webdev-rb");
  });
});

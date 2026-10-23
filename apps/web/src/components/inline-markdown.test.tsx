import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InlineMarkdown } from "./inline-markdown";

describe("InlineMarkdown", () => {
  it("renders plain text with no markers unchanged", () => {
    render(<InlineMarkdown text="Just a plain sentence." />);
    expect(screen.getByText("Just a plain sentence.")).toBeInTheDocument();
  });

  it("renders **bold** as a <strong> element, without the asterisks", () => {
    render(<InlineMarkdown text="This is **important** context." />);
    const strong = screen.getByText("important");
    expect(strong.tagName).toBe("STRONG");
    expect(screen.queryByText(/\*\*/)).not.toBeInTheDocument();
  });

  it("renders *italic* as an <em> element, without the asterisks", () => {
    render(<InlineMarkdown text="Note the *middle* of the array." />);
    const em = screen.getByText("middle");
    expect(em.tagName).toBe("EM");
    expect(screen.queryByText(/\*/)).not.toBeInTheDocument();
  });

  it("renders mixed bold and italic in the same string", () => {
    render(<InlineMarkdown text="A **bold** word and an *italic* word." />);
    expect(screen.getByText("bold").tagName).toBe("STRONG");
    expect(screen.getByText("italic").tagName).toBe("EM");
  });

  it("leaves an unpaired, stray asterisk as literal text", () => {
    render(<InlineMarkdown text="result = width * height" />);
    expect(screen.getByText("result = width * height")).toBeInTheDocument();
  });

  it("does not let a multiplication `*` inside a code span bleed into a later, real *italic* marker", () => {
    // Regression test: `base_address + i * element_size` contains a
    // literal multiplication `*` -- it must not be read as an opening
    // italic delimiter that then swallows everything up to the real
    // `*middle*` emphasis later in the same string.
    render(
      <InlineMarkdown text="Use `base_address + i * element_size` to find it. That's the *middle* case." />,
    );
    expect(
      screen.getByText("Use `base_address + i * element_size` to find it. That's the", {
        exact: false,
      }),
    ).toBeInTheDocument();
    const em = screen.getByText("middle");
    expect(em.tagName).toBe("EM");
  });
});

import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ContentWidthContainer } from "./content-width-container";

describe("ContentWidthContainer", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("renders children and defaults to no inline max-width override", async () => {
    render(
      <ContentWidthContainer>
        <p>lesson content</p>
      </ContentWidthContainer>,
    );

    expect(screen.getByText("lesson content")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("main").style.maxWidth).toBe(""));
  });

  it("applies a previously-chosen vw-based max-width on mount", async () => {
    localStorage.setItem("egh:content-width-vw", "80");

    render(
      <ContentWidthContainer>
        <p>lesson content</p>
      </ContentWidthContainer>,
    );

    await waitFor(() => expect(screen.getByRole("main").style.maxWidth).toBe("80vw"));
  });

  it("uses the default max-width class when no baseMaxWidthClassName is given", () => {
    render(
      <ContentWidthContainer>
        <p>lesson content</p>
      </ContentWidthContainer>,
    );

    expect(screen.getByRole("main").className).toContain("max-w-2xl");
  });

  it("applies a custom baseMaxWidthClassName and className", () => {
    render(
      <ContentWidthContainer baseMaxWidthClassName="max-w-4xl" className="flex-col gap-8">
        <p>lesson content</p>
      </ContentWidthContainer>,
    );

    const main = screen.getByRole("main");
    expect(main.className).toContain("max-w-4xl");
    expect(main.className).toContain("gap-8");
    expect(main.className).not.toContain("max-w-2xl");
  });
});

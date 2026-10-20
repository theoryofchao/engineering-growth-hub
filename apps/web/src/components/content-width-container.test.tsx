import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
    await waitFor(() => expect(screen.getByText("Content width (default)")).toBeInTheDocument());
    expect(screen.getByRole("main").style.maxWidth).toBe("");
  });

  it("applies a vw-based max-width once the slider is moved", async () => {
    render(
      <ContentWidthContainer>
        <p>lesson content</p>
      </ContentWidthContainer>,
    );
    await waitFor(() => expect(screen.getByText("Content width (default)")).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText("Content width as a percentage of the viewport"), {
      target: { value: "80" },
    });

    expect(screen.getByRole("main").style.maxWidth).toBe("80vw");
    expect(screen.getByText("Content width (80vw)")).toBeInTheDocument();
    expect(localStorage.getItem("egh:content-width-vw")).toBe("80");
  });

  it("resets back to the default width", async () => {
    render(
      <ContentWidthContainer>
        <p>lesson content</p>
      </ContentWidthContainer>,
    );
    await waitFor(() => expect(screen.getByText("Content width (default)")).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText("Content width as a percentage of the viewport"), {
      target: { value: "80" },
    });
    fireEvent.click(screen.getByText("Reset"));

    expect(screen.getByRole("main").style.maxWidth).toBe("");
    expect(screen.getByText("Content width (default)")).toBeInTheDocument();
    expect(localStorage.getItem("egh:content-width-vw")).toBeNull();
  });

  it("restores a previously chosen width on mount", async () => {
    localStorage.setItem("egh:content-width-vw", "65");

    render(
      <ContentWidthContainer>
        <p>lesson content</p>
      </ContentWidthContainer>,
    );

    await waitFor(() => expect(screen.getByRole("main").style.maxWidth).toBe("65vw"));
  });
});

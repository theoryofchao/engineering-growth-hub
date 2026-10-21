import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const setTheme = vi.fn();
let currentTheme = "system";

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: currentTheme, setTheme }),
}));

import { SiteSettings } from "./site-settings";

describe("SiteSettings", () => {
  beforeEach(() => {
    localStorage.clear();
    setTheme.mockClear();
    currentTheme = "system";
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("the panel is closed until the gear button is clicked", () => {
    render(<SiteSettings />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Site settings"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("choosing a theme calls setTheme", async () => {
    render(<SiteSettings />);
    fireEvent.click(screen.getByLabelText("Site settings"));

    fireEvent.click(screen.getByRole("button", { name: "Dark" }));

    await waitFor(() => expect(setTheme).toHaveBeenCalledWith("dark"));
  });

  it("moving the content-width slider persists it", () => {
    render(<SiteSettings />);
    fireEvent.click(screen.getByLabelText("Site settings"));

    fireEvent.change(screen.getByLabelText("Content width as a percentage of the viewport"), {
      target: { value: "80" },
    });

    expect(localStorage.getItem("egh:content-width-vw")).toBe("80");
  });

  it("choosing a default view mode persists it", () => {
    render(<SiteSettings />);
    fireEvent.click(screen.getByLabelText("Site settings"));

    fireEvent.click(screen.getByRole("button", { name: "Slides" }));

    expect(localStorage.getItem("egh:default-view-mode")).toBe("slide");
  });

  it("toggling 'show section boundaries by default' persists it", () => {
    render(<SiteSettings />);
    fireEvent.click(screen.getByLabelText("Site settings"));

    fireEvent.click(screen.getByLabelText("Show section boundaries by default"));

    expect(localStorage.getItem("egh:show-section-boundaries-default")).toBe("true");
  });

  it("closes on Escape and returns focus to the gear button", async () => {
    render(<SiteSettings />);
    const gearButton = screen.getByLabelText("Site settings");
    fireEvent.click(gearButton);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(gearButton).toHaveFocus();
  });

  it("closes on clicking outside the panel", () => {
    render(<SiteSettings />);
    fireEvent.click(screen.getByLabelText("Site settings"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Close settings"));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("moves focus into the panel when it opens", async () => {
    render(<SiteSettings />);
    fireEvent.click(screen.getByLabelText("Site settings"));

    await waitFor(() => expect(screen.getByRole("dialog")).toHaveFocus());
  });
});

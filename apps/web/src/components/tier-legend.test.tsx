import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TierLegend } from "./tier-legend";

describe("TierLegend", () => {
  it("is collapsed by default", () => {
    render(<TierLegend />);

    const details = screen
      .getByText("What do these proficiency levels mean, and which to prioritize?")
      .closest("details");
    expect(details).not.toHaveAttribute("open");
  });

  it("lists all four tiers with their meaning and evidence once opened", () => {
    render(<TierLegend />);

    const summary = screen.getByText(
      "What do these proficiency levels mean, and which to prioritize?",
    );
    fireEvent.click(summary);

    expect(screen.getByText("D — Deep mastery")).toBeInTheDocument();
    expect(screen.getByText("W — Working proficiency")).toBeInTheDocument();
    expect(screen.getByText("L — Architectural literacy")).toBeInTheDocument();
    expect(screen.getByText("G — Leadership development")).toBeInTheDocument();

    expect(
      screen.getByText(/Implement, diagnose, optimize, and defend it independently\./),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Deploy, integrate, operate, and diagnose a realistic system/),
    ).toBeInTheDocument();
  });

  it("explains the distinction from difficulty/seniority and gives a prioritization hint", () => {
    render(<TierLegend />);

    expect(screen.getByText(/not difficulty or/)).toBeInTheDocument();
    expect(screen.getByText(/get Deep mastery and Working proficiency topics solid first/)).toBeInTheDocument();
  });
});

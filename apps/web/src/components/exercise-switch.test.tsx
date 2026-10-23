import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ExerciseSwitch } from "./exercise-switch";

describe("ExerciseSwitch", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders a quiz for type multiple_choice", () => {
    render(
      <ExerciseSwitch
        exercise={{ id: 1, type: "multiple_choice", prompt: "Pick one", options: ["A", "B"] }}
      />,
    );
    expect(screen.getByText("Submit answer")).toBeInTheDocument();
  });

  it("renders a project checklist for type project", () => {
    render(
      <ExerciseSwitch
        exercise={{
          id: 2,
          type: "project",
          prompt: "Build something",
          checkpoints: [{ title: "Step 1", acceptance_criteria: ["Do the thing"] }],
          checked_criteria: {},
        }}
      />,
    );
    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(screen.getByText("Do the thing")).toBeInTheDocument();
  });
});

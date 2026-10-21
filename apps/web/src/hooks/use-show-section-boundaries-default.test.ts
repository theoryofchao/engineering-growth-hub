import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { useShowSectionBoundariesDefault } from "./use-show-section-boundaries-default";

const STORAGE_KEY = "egh:show-section-boundaries-default";

describe("useShowSectionBoundariesDefault", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("starts false when nothing is stored", async () => {
    const { result } = renderHook(() => useShowSectionBoundariesDefault());

    await waitFor(() => expect(result.current[0]).toBe(false));
  });

  it("restores a previously stored true value on mount", async () => {
    localStorage.setItem(STORAGE_KEY, "true");

    const { result } = renderHook(() => useShowSectionBoundariesDefault());

    await waitFor(() => expect(result.current[0]).toBe(true));
  });

  it("setting a value updates state and persists it", async () => {
    const { result } = renderHook(() => useShowSectionBoundariesDefault());
    await waitFor(() => expect(result.current[0]).toBe(false));

    act(() => result.current[1](true));

    expect(result.current[0]).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY)).toBe("true");
  });
});

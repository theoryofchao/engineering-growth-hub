import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { useDefaultViewMode } from "./use-default-view-mode";

const STORAGE_KEY = "egh:default-view-mode";

describe("useDefaultViewMode", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("starts as 'page' when nothing is stored", async () => {
    const { result } = renderHook(() => useDefaultViewMode());

    await waitFor(() => expect(result.current[0]).toBe("page"));
  });

  it("restores a previously stored value on mount", async () => {
    localStorage.setItem(STORAGE_KEY, "slide");

    const { result } = renderHook(() => useDefaultViewMode());

    await waitFor(() => expect(result.current[0]).toBe("slide"));
  });

  it("setting a value updates state and persists it", async () => {
    const { result } = renderHook(() => useDefaultViewMode());
    await waitFor(() => expect(result.current[0]).toBe("page"));

    act(() => result.current[1]("slide"));

    expect(result.current[0]).toBe("slide");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("slide");
  });

  it("ignores a corrupted stored value instead of crashing", async () => {
    localStorage.setItem(STORAGE_KEY, "not-a-real-mode");

    const { result } = renderHook(() => useDefaultViewMode());

    await waitFor(() => expect(result.current[0]).toBe("page"));
  });
});

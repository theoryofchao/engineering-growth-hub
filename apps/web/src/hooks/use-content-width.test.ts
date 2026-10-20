import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { useContentWidth } from "./use-content-width";

const STORAGE_KEY = "egh:content-width-vw";

describe("useContentWidth", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("starts null (default) when nothing is stored", async () => {
    const { result } = renderHook(() => useContentWidth());

    await waitFor(() => expect(result.current[0]).toBeNull());
  });

  it("restores a previously stored value on mount", async () => {
    localStorage.setItem(STORAGE_KEY, "70");

    const { result } = renderHook(() => useContentWidth());

    await waitFor(() => expect(result.current[0]).toBe(70));
  });

  it("setting a value updates state and persists it", async () => {
    const { result } = renderHook(() => useContentWidth());
    await waitFor(() => expect(result.current[0]).toBeNull());

    act(() => result.current[1](80));

    expect(result.current[0]).toBe(80);
    expect(localStorage.getItem(STORAGE_KEY)).toBe("80");
  });

  it("clamps out-of-range values to the valid 40-100 range", async () => {
    const { result } = renderHook(() => useContentWidth());
    await waitFor(() => expect(result.current[0]).toBeNull());

    act(() => result.current[1](500));
    expect(result.current[0]).toBe(100);

    act(() => result.current[1](-20));
    expect(result.current[0]).toBe(40);
  });

  it("setting null resets to default and clears storage", async () => {
    const { result } = renderHook(() => useContentWidth());
    act(() => result.current[1](80));
    expect(localStorage.getItem(STORAGE_KEY)).toBe("80");

    act(() => result.current[1](null));

    expect(result.current[0]).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("ignores a corrupted stored value instead of crashing", async () => {
    localStorage.setItem(STORAGE_KEY, "not-a-number");

    const { result } = renderHook(() => useContentWidth());

    await waitFor(() => expect(result.current[0]).toBeNull());
  });
});

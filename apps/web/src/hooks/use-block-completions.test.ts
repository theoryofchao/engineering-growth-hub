import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useBlockCompletions } from "./use-block-completions";

describe("useBlockCompletions", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it("starts with no known completions", () => {
    const { result } = renderHook(() => useBlockCompletions());

    expect(result.current.completions).toEqual({});
  });

  it("toggling a block updates the reactive map", () => {
    const { result } = renderHook(() => useBlockCompletions());

    act(() => result.current.toggle(1));

    expect(result.current.completions[1].completed).toBe(true);
  });

  it("a second mounted instance sees a toggle made through the first", () => {
    const first = renderHook(() => useBlockCompletions());
    const second = renderHook(() => useBlockCompletions());

    act(() => first.result.current.toggle(1));

    expect(second.result.current.completions[1].completed).toBe(true);
  });

  it("schedules a debounced flush after toggling", async () => {
    const { result } = renderHook(() => useBlockCompletions());
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));

    act(() => result.current.toggle(1));
    expect(fetch).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5_000);
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });
});

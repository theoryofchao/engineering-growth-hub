import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useElapsedDisplay } from "./use-elapsed-display";

describe("useElapsedDisplay", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts at 0 before any baseline is set", () => {
    const { result } = renderHook(() => useElapsedDisplay(false));

    expect(result.current.displaySeconds).toBe(0);
  });

  it("jumps to the new baseline immediately when set", () => {
    const { result } = renderHook(() => useElapsedDisplay(false));

    act(() => result.current.setBaseline(42));

    expect(result.current.displaySeconds).toBe(42);
  });

  it("ticks forward once a second while running", () => {
    const { result, rerender } = renderHook(({ isRunning }) => useElapsedDisplay(isRunning), {
      initialProps: { isRunning: false },
    });

    act(() => result.current.setBaseline(10));
    rerender({ isRunning: true });

    act(() => vi.advanceTimersByTime(3000));

    expect(result.current.displaySeconds).toBeGreaterThanOrEqual(12.9);
    expect(result.current.displaySeconds).toBeLessThanOrEqual(13.1);
  });

  it("does not tick while not running", () => {
    const { result } = renderHook(() => useElapsedDisplay(false));

    act(() => result.current.setBaseline(10));
    act(() => vi.advanceTimersByTime(5000));

    expect(result.current.displaySeconds).toBe(10);
  });

  it("resets the tick anchor when a fresh baseline is set mid-run", () => {
    const { result, rerender } = renderHook(({ isRunning }) => useElapsedDisplay(isRunning), {
      initialProps: { isRunning: true },
    });

    act(() => result.current.setBaseline(100));
    act(() => vi.advanceTimersByTime(2000));
    act(() => result.current.setBaseline(200));
    rerender({ isRunning: true });
    act(() => vi.advanceTimersByTime(1000));

    expect(result.current.displaySeconds).toBeGreaterThanOrEqual(200.9);
    expect(result.current.displaySeconds).toBeLessThan(203);
  });
});

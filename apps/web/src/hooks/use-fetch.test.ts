import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useFetch } from "./use-fetch";

describe("useFetch", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts in the loading phase", () => {
    (fetch as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useFetch("/api/v1/health"));

    expect(result.current).toEqual({ phase: "loading" });
  });

  it("resolves to success with the parsed JSON body", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ hello: "world" }),
    });

    const { result } = renderHook(() => useFetch<{ hello: string }>("/api/v1/health"));

    await waitFor(() => expect(result.current.phase).toBe("success"));
    expect(result.current).toEqual({ phase: "success", data: { hello: "world" } });
  });

  it("resolves to not-found on a 404 response", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useFetch("/api/v1/topics/999"));

    await waitFor(() => expect(result.current.phase).toBe("not-found"));
  });

  it("resolves to error on a non-ok, non-404 response", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false, status: 500 });

    const { result } = renderHook(() => useFetch("/api/v1/topics"));

    await waitFor(() => expect(result.current.phase).toBe("error"));
    expect(result.current).toMatchObject({ message: "API responded with status 500" });
  });

  it("resolves to error when fetch rejects", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Failed to fetch"));

    const { result } = renderHook(() => useFetch("/api/v1/topics"));

    await waitFor(() => expect(result.current.phase).toBe("error"));
    expect(result.current).toMatchObject({ message: "Failed to fetch" });
  });

  it("skips fetching entirely when path is null", () => {
    const { result } = renderHook(() => useFetch(null));

    expect(result.current).toEqual({ phase: "loading" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("re-fetches when the path changes", async () => {
    (fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ id: 1 }) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ id: 2 }) });

    const { result, rerender } = renderHook(({ path }) => useFetch<{ id: number }>(path), {
      initialProps: { path: "/api/v1/topics/1" },
    });

    await waitFor(() => expect(result.current).toEqual({ phase: "success", data: { id: 1 } }));

    rerender({ path: "/api/v1/topics/2" });

    await waitFor(() => expect(result.current).toEqual({ phase: "success", data: { id: 2 } }));
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});

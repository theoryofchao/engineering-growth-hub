import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getDirtyEntries, toggleCompletion } from "./completion-store";
import {
  DEBOUNCE_MS,
  PERIODIC_MS,
  flush,
  flushViaBeacon,
  scheduleDebouncedFlush,
  startPeriodicFlush,
} from "./completion-sync";

describe("completion-sync", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  describe("flush", () => {
    it("does nothing when there's nothing dirty", async () => {
      vi.stubGlobal("fetch", vi.fn());

      await flush();

      expect(fetch).not.toHaveBeenCalled();
    });

    it("posts dirty entries and clears dirty on success", async () => {
      const entry = toggleCompletion(1);
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => [{ content_block_id: 1, completed: true, updated_at: entry.updatedAt }],
        }),
      );

      await flush();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/content-blocks/completions/batch"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            completions: [
              { content_block_id: 1, completed: true, client_updated_at: entry.updatedAt },
            ],
          }),
        }),
      );
      expect(getDirtyEntries()).toHaveLength(0);
    });

    it("leaves entries dirty on a non-ok response", async () => {
      toggleCompletion(1);
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

      await flush();

      expect(getDirtyEntries()).toHaveLength(1);
    });

    it("leaves entries dirty on a network error", async () => {
      toggleCompletion(1);
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

      await flush();

      expect(getDirtyEntries()).toHaveLength(1);
    });

    it("doesn't start a second flush while one is already in flight", async () => {
      toggleCompletion(1);
      let resolveFetch: (value: unknown) => void = () => {};
      const fetchMock = vi.fn().mockReturnValue(
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
      );
      vi.stubGlobal("fetch", fetchMock);

      const firstFlush = flush();
      const secondFlush = flush();

      resolveFetch({ ok: true, json: async () => [] });
      await Promise.all([firstFlush, secondFlush]);

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("scheduleDebouncedFlush", () => {
    beforeEach(() => vi.useFakeTimers());

    it("flushes once, after the debounce window, following a single call", async () => {
      toggleCompletion(1);
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));

      scheduleDebouncedFlush();
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it("coalesces repeated calls into a single flush", async () => {
      toggleCompletion(1);
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));

      scheduleDebouncedFlush();
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS / 2);
      scheduleDebouncedFlush(); // resets the window instead of stacking a second flush
      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS / 2);
      expect(fetch).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(DEBOUNCE_MS / 2);
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("startPeriodicFlush", () => {
    beforeEach(() => vi.useFakeTimers());

    it("flushes repeatedly on the interval until stopped", async () => {
      toggleCompletion(1);
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));

      const stop = startPeriodicFlush();

      await vi.advanceTimersByTimeAsync(PERIODIC_MS);
      expect(fetch).toHaveBeenCalledTimes(1);

      toggleCompletion(2);
      await vi.advanceTimersByTimeAsync(PERIODIC_MS);
      expect(fetch).toHaveBeenCalledTimes(2);

      stop();
      toggleCompletion(3);
      await vi.advanceTimersByTimeAsync(PERIODIC_MS);
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("flushViaBeacon", () => {
    it("sends dirty entries through sendBeacon", () => {
      toggleCompletion(1);
      const sendBeacon = vi.fn().mockReturnValue(true);
      vi.stubGlobal("navigator", { ...navigator, sendBeacon });

      flushViaBeacon();

      expect(sendBeacon).toHaveBeenCalledTimes(1);
      const [url, body] = sendBeacon.mock.calls[0];
      expect(url).toContain("/api/v1/content-blocks/completions/batch");
      expect(body).toBeInstanceOf(Blob);
    });

    it("does nothing when there's nothing dirty", () => {
      const sendBeacon = vi.fn();
      vi.stubGlobal("navigator", { ...navigator, sendBeacon });

      flushViaBeacon();

      expect(sendBeacon).not.toHaveBeenCalled();
    });

    it("doesn't throw when sendBeacon isn't supported", () => {
      toggleCompletion(1);
      vi.stubGlobal("navigator", { ...navigator, sendBeacon: undefined });

      expect(() => flushViaBeacon()).not.toThrow();
    });
  });
});

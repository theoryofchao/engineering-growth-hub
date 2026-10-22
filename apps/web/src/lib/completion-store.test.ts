import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  CHANGE_EVENT,
  getDirtyEntries,
  hydrateFromServer,
  markSynced,
  readAll,
  toggleCompletion,
} from "./completion-store";

const STORAGE_KEY = "egh:block-completions";

describe("completion-store", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("starts empty when nothing is stored", () => {
    expect(readAll()).toEqual({});
  });

  it("toggling an untouched block marks it completed and dirty", () => {
    const entry = toggleCompletion(1);

    expect(entry.completed).toBe(true);
    expect(entry.dirty).toBe(true);
    expect(readAll()[1]).toEqual(entry);
  });

  it("toggling twice flips back to not completed", () => {
    toggleCompletion(1);
    const entry = toggleCompletion(1);

    expect(entry.completed).toBe(false);
    expect(entry.dirty).toBe(true);
  });

  it("persists across a fresh read of the same key", () => {
    toggleCompletion(1);

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    expect(stored["1"].completed).toBe(true);
  });

  it("dispatches the change event on toggle", () => {
    const listener = vi.fn();
    window.addEventListener(CHANGE_EVENT, listener);

    toggleCompletion(1);

    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(CHANGE_EVENT, listener);
  });

  it("getDirtyEntries returns only dirty blocks", () => {
    toggleCompletion(1);
    toggleCompletion(2);
    markSynced([
      {
        contentBlockId: 1,
        completed: true,
        updatedAt: null,
        sentUpdatedAt: readAll()[1].updatedAt,
      },
    ]);

    const dirty = getDirtyEntries();
    expect(dirty).toHaveLength(1);
    expect(dirty[0][0]).toBe(2);
  });

  it("ignores a corrupted stored value instead of crashing", () => {
    localStorage.setItem(STORAGE_KEY, "not json");

    expect(readAll()).toEqual({});
  });

  it("drops entries with the wrong shape instead of crashing", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ 1: { completed: "yes" } }));

    expect(readAll()).toEqual({});
  });

  describe("hydrateFromServer", () => {
    it("adopts the server's state for a block never touched locally", () => {
      hydrateFromServer([
        { contentBlockId: 1, completed: true, updatedAt: "2026-10-22T10:00:00Z" },
      ]);

      expect(readAll()[1]).toEqual({
        completed: true,
        updatedAt: "2026-10-22T10:00:00Z",
        dirty: false,
      });
    });

    it("never overwrites a locally dirty (unsynced) block", () => {
      toggleCompletion(1); // completed=true, dirty=true

      hydrateFromServer([
        { contentBlockId: 1, completed: false, updatedAt: "2026-10-22T10:00:00Z" },
      ]);

      expect(readAll()[1].completed).toBe(true);
      expect(readAll()[1].dirty).toBe(true);
    });
  });

  describe("markSynced", () => {
    it("clears dirty and adopts the server's echoed state", () => {
      const entry = toggleCompletion(1);

      markSynced([
        {
          contentBlockId: 1,
          completed: true,
          updatedAt: entry.updatedAt,
          sentUpdatedAt: entry.updatedAt,
        },
      ]);

      expect(readAll()[1]).toEqual({ completed: true, updatedAt: entry.updatedAt, dirty: false });
    });

    it("adopts the server's resolution when a write was rejected as stale", () => {
      const entry = toggleCompletion(1); // our local write

      // Server says a different (newer, from elsewhere) write won instead.
      markSynced([
        {
          contentBlockId: 1,
          completed: false,
          updatedAt: "2099-01-01T00:00:00Z",
          sentUpdatedAt: entry.updatedAt,
        },
      ]);

      expect(readAll()[1]).toEqual({
        completed: false,
        updatedAt: "2099-01-01T00:00:00Z",
        dirty: false,
      });
    });

    it("leaves a block dirty if it changed again after being read for this flush", () => {
      vi.useFakeTimers();
      try {
        vi.setSystemTime(new Date("2026-10-22T10:00:00Z"));
        const firstToggle = toggleCompletion(1);

        // Simulate a second toggle arriving while the first flush is in flight.
        vi.setSystemTime(new Date("2026-10-22T10:00:05Z"));
        const secondToggle = toggleCompletion(1);

        markSynced([
          {
            contentBlockId: 1,
            completed: firstToggle.completed,
            updatedAt: firstToggle.updatedAt,
            sentUpdatedAt: firstToggle.updatedAt,
          },
        ]);

        expect(readAll()[1]).toEqual(secondToggle);
        expect(readAll()[1].dirty).toBe(true);
      } finally {
        vi.useRealTimers();
      }
    });
  });
});

/**
 * Flushes the locally-queued completion toggles (completion-store.ts) to
 * the backend in batches. Three triggers call into this, per ADR 0030:
 * a debounce after the last toggle, a periodic safety-net interval, and
 * a best-effort flush when the tab is hidden/closed.
 */

import { getDirtyEntries, markSynced } from "@/lib/completion-store";
import { API_BASE_URL } from "@/lib/config";

const BATCH_URL = `${API_BASE_URL}/api/v1/content-blocks/completions/batch`;

export const DEBOUNCE_MS = 5_000;
export const PERIODIC_MS = 120_000;

type BatchResponseItem = {
  content_block_id: number;
  completed: boolean;
  updated_at: string | null;
};

function buildPayload(dirty: Array<[number, { completed: boolean; updatedAt: string }]>) {
  return {
    completions: dirty.map(([contentBlockId, entry]) => ({
      content_block_id: contentBlockId,
      completed: entry.completed,
      client_updated_at: entry.updatedAt,
    })),
  };
}

let flushing = false;

/** Posts every currently-dirty entry in one request. A no-op if nothing
 * is dirty, or if a flush is already in flight (the next trigger will
 * pick up anything that became dirty in the meantime). Failures (network
 * error or non-2xx) leave entries dirty for the next trigger to retry. */
export async function flush(): Promise<void> {
  if (flushing) return;

  const dirty = getDirtyEntries();
  if (dirty.length === 0) return;

  flushing = true;
  try {
    const response = await fetch(BATCH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload(dirty)),
    });
    if (!response.ok) return;

    const results = (await response.json()) as BatchResponseItem[];
    const sentUpdatedAtByBlockId = new Map(dirty.map(([id, entry]) => [id, entry.updatedAt]));

    markSynced(
      results.map((result) => ({
        contentBlockId: result.content_block_id,
        completed: result.completed,
        updatedAt: result.updated_at,
        sentUpdatedAt:
          sentUpdatedAtByBlockId.get(result.content_block_id) ?? result.updated_at ?? "",
      })),
    );
  } catch {
    // Network error -- leave dirty, the next trigger retries.
  } finally {
    flushing = false;
  }
}

/** Best-effort flush for the tab-hide/unload path, where there's no time
 * to await a normal fetch response. sendBeacon can't report delivery, so
 * entries are left dirty regardless -- redundant but harmless, since the
 * batch endpoint is idempotent, if the beacon actually got through. */
export function flushViaBeacon(): void {
  if (typeof navigator === "undefined" || typeof navigator.sendBeacon !== "function") return;

  const dirty = getDirtyEntries();
  if (dirty.length === 0) return;

  const blob = new Blob([JSON.stringify(buildPayload(dirty))], { type: "application/json" });
  navigator.sendBeacon(BATCH_URL, blob);
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/** Call after every local toggle. Coalesces bursts of toggles into one
 * flush a few seconds after the last one, rather than a request per click. */
export function scheduleDebouncedFlush(): void {
  if (debounceTimer !== null) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    void flush();
  }, DEBOUNCE_MS);
}

let periodicTimer: ReturnType<typeof setInterval> | null = null;

/** Safety net in case a debounced flush never settles (e.g. toggles kept
 * arriving) or silently failed earlier. Returns a stop function; starting
 * it again while already running restarts the interval rather than
 * stacking a second one. */
export function startPeriodicFlush(): () => void {
  if (periodicTimer !== null) clearInterval(periodicTimer);
  periodicTimer = setInterval(() => void flush(), PERIODIC_MS);

  return () => {
    if (periodicTimer !== null) clearInterval(periodicTimer);
    periodicTimer = null;
  };
}

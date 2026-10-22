/**
 * Local-first queue of per-content-block completion toggles, persisted in
 * localStorage so a checkmark click survives a reload before it's been
 * synced to the backend (see completion-sync.ts for the actual flush).
 *
 * `completion-sync.ts` and `use-block-completions.ts` are the only
 * intended callers -- this module owns the storage format and the merge
 * rules, nothing else should read/write the `egh:block-completions` key
 * directly.
 */

const STORAGE_KEY = "egh:block-completions";
export const CHANGE_EVENT = "egh:block-completions-changed";

export type CompletionEntry = {
  completed: boolean;
  /** ISO timestamp from the client's own clock at toggle time -- used
   * for last-write-wins conflict resolution, not server receipt time. */
  updatedAt: string;
  /** True until a sync has confirmed the backend reflects this value. */
  dirty: boolean;
};

export type CompletionMap = Record<number, CompletionEntry>;

export type ServerCompletionState = {
  contentBlockId: number;
  completed: boolean;
  updatedAt: string | null;
};

export type SyncedCompletionResult = ServerCompletionState & { sentUpdatedAt: string };

const EMPTY_MAP: CompletionMap = {};

// `readAll()` is called from useSyncExternalStore's getSnapshot, which
// requires a stable reference when the underlying data hasn't changed --
// otherwise React treats every render as "the store changed" and warns
// about (or loops on) an uncached snapshot. Caching on the raw string
// avoids re-parsing AND re-allocating on every call.
let cachedRaw: string | null = null;
let cachedMap: CompletionMap = EMPTY_MAP;

function isValidEntry(value: unknown): value is CompletionEntry {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.completed === "boolean" &&
    typeof entry.updatedAt === "string" &&
    typeof entry.dirty === "boolean"
  );
}

function parseStoredMap(raw: string): CompletionMap {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};

    const result: CompletionMap = {};
    for (const [key, value] of Object.entries(parsed)) {
      const blockId = Number(key);
      if (Number.isInteger(blockId) && isValidEntry(value)) {
        result[blockId] = value;
      }
    }
    return result;
  } catch {
    return {};
  }
}

export function readAll(): CompletionMap {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null; // private mode, quota exceeded, etc.
  }

  if (raw === cachedRaw) return cachedMap;

  cachedRaw = raw;
  cachedMap = raw === null ? EMPTY_MAP : parseStoredMap(raw);
  return cachedMap;
}

function writeAll(map: CompletionMap): void {
  const raw = JSON.stringify(map);
  cachedRaw = raw;
  cachedMap = map;

  try {
    localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    // Ignore storage access errors -- the in-memory cache above still
    // keeps the current tab working even if persistence failed.
  }

  try {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // No window (SSR) -- nothing to notify.
  }
}

export function toggleCompletion(blockId: number): CompletionEntry {
  const current = readAll();
  const next: CompletionEntry = {
    completed: !(current[blockId]?.completed ?? false),
    updatedAt: new Date().toISOString(),
    dirty: true,
  };
  writeAll({ ...current, [blockId]: next });
  return next;
}

export function getDirtyEntries(): Array<[number, CompletionEntry]> {
  return Object.entries(readAll())
    .filter(([, entry]) => entry.dirty)
    .map(([id, entry]) => [Number(id), entry]);
}

/**
 * Applies a server-authoritative baseline (e.g. on initial load of a
 * lesson). Never overwrites a block that's locally dirty -- an
 * unsynced optimistic toggle wins over the server's stale view of it
 * until that toggle actually gets flushed.
 */
export function hydrateFromServer(serverStates: ServerCompletionState[]): void {
  const current = readAll();
  const next: CompletionMap = { ...current };
  let changed = false;

  for (const state of serverStates) {
    if (next[state.contentBlockId]?.dirty) continue;

    next[state.contentBlockId] = {
      completed: state.completed,
      updatedAt: state.updatedAt ?? new Date(0).toISOString(),
      dirty: false,
    };
    changed = true;
  }

  if (changed) writeAll(next);
}

/**
 * Applies the canonical state a batch flush got back from the server.
 * `sentUpdatedAt` is the local `updatedAt` this entry had when it was
 * read for that flush request -- if the entry has since moved on (a
 * newer toggle queued while the request was in flight), this
 * confirmation is stale and is skipped, leaving the newer write dirty
 * for the next flush instead of clobbering it.
 */
export function markSynced(results: SyncedCompletionResult[]): void {
  const current = readAll();
  const next: CompletionMap = { ...current };
  let changed = false;

  for (const result of results) {
    const existing = next[result.contentBlockId];
    if (existing && existing.updatedAt !== result.sentUpdatedAt) continue;

    next[result.contentBlockId] = {
      completed: result.completed,
      updatedAt: result.updatedAt ?? result.sentUpdatedAt,
      dirty: false,
    };
    changed = true;
  }

  if (changed) writeAll(next);
}

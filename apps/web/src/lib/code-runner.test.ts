import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { caseResultToSubmittedOutput, runTestCases } from "./code-runner";

/** A minimal Worker-shaped stub -- just enough surface for code-runner.ts
 * to drive (onmessage/onerror/postMessage/terminate), with no real OS
 * thread. Each test controls what `postMessage` does so the timeout
 * race, error propagation, and success path can all be driven
 * deterministically.
 */
class FakeWorker {
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onerror: ((event: { message: string }) => void) | null = null;
  terminated = false;
  postMessage: (data: unknown) => void;

  constructor(postMessage: (data: unknown) => void) {
    this.postMessage = postMessage;
  }

  terminate() {
    this.terminated = true;
  }
}

describe("runTestCases", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves with the worker's reported value on success", async () => {
    const workers: FakeWorker[] = [];
    const createWorker = () => {
      const worker: FakeWorker = new FakeWorker(() => {
        queueMicrotask(() => worker.onmessage?.({ data: { ok: true, value: 42 } }));
      });
      workers.push(worker);
      return worker as unknown as Worker;
    };

    const results = await runTestCases("code", "fn", [{ input: [1] }], 1000, createWorker);

    expect(results).toEqual([{ ok: true, value: 42 }]);
    expect(workers[0].terminated).toBe(true); // cleaned up after resolving
  });

  it("surfaces a worker-reported error distinctly, without crashing", async () => {
    const createWorker = () => {
      const worker: FakeWorker = new FakeWorker(() => {
        queueMicrotask(() => worker.onmessage?.({ data: { ok: false, error: "boom" } }));
      });
      return worker as unknown as Worker;
    };

    const results = await runTestCases("code", "fn", [{ input: [] }], 1000, createWorker);

    expect(results).toEqual([{ ok: false, error: "boom" }]);
  });

  it("times out and terminates the worker if it never responds", async () => {
    const workers: FakeWorker[] = [];
    const createWorker = () => {
      const worker = new FakeWorker(() => {
        /* never calls onmessage -- simulates an infinite loop */
      });
      workers.push(worker);
      return worker as unknown as Worker;
    };

    const promise = runTestCases("code", "fn", [{ input: [] }], 500, createWorker);
    await vi.advanceTimersByTimeAsync(500);
    const results = await promise;

    expect(results).toEqual([{ ok: false, error: "timeout" }]);
    expect(workers[0].terminated).toBe(true);
  });

  it("surfaces a hard worker error (e.g. the bootstrap script itself failing)", async () => {
    const createWorker = () => {
      const worker: FakeWorker = new FakeWorker(() => {
        queueMicrotask(() => worker.onerror?.({ message: "script error" }));
      });
      return worker as unknown as Worker;
    };

    const results = await runTestCases("code", "fn", [{ input: [] }], 1000, createWorker);

    expect(results).toEqual([{ ok: false, error: "script error" }]);
  });

  it("gives each test case its own fresh worker, in order", async () => {
    const workers: FakeWorker[] = [];
    const createWorker = () => {
      const worker: FakeWorker = new FakeWorker((data) => {
        const { input } = data as { input: number[] };
        queueMicrotask(() => worker.onmessage?.({ data: { ok: true, value: input[0] * 2 } }));
      });
      workers.push(worker);
      return worker as unknown as Worker;
    };

    const results = await runTestCases(
      "code",
      "fn",
      [{ input: [1] }, { input: [2] }, { input: [3] }],
      1000,
      createWorker,
    );

    expect(results).toEqual([
      { ok: true, value: 2 },
      { ok: true, value: 4 },
      { ok: true, value: 6 },
    ]);
    expect(workers).toHaveLength(3); // one infinite loop can't affect another case's worker
  });
});

describe("caseResultToSubmittedOutput", () => {
  it("passes a successful value through unchanged", () => {
    expect(caseResultToSubmittedOutput({ ok: true, value: [1, 2] })).toEqual([1, 2]);
  });

  it("encodes a failure as a sentinel that can never equal a real expected output", () => {
    expect(caseResultToSubmittedOutput({ ok: false, error: "timeout" })).toEqual({
      __error__: "timeout",
    });
  });
});

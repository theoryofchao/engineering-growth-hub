/** Runs a learner's JS function against a list of test case inputs,
 * entirely in the browser, one sandboxed Web Worker per case so a
 * single infinite loop only kills feedback for that one case rather
 * than the whole run. `createWorker` is injected so tests can supply a
 * fake Worker-shaped stub instead of needing a real OS thread.
 *
 * This module (plus workers/code-runner-worker-source.ts) is the only
 * place learner code executes -- never in Flask. See
 * docs/decisions/0028-....md for the trust model this supports: the
 * server only ever sees the *output values* produced here, compared
 * against its own stored answer key, never the code itself.
 */

import { workerBootstrapSource } from "@/workers/code-runner-worker-source";
import type { EvaluateResult } from "@/workers/code-runner-worker-source";

export type TestCaseInput = { input: unknown[] };

export type CaseRunResult = { ok: true; value: unknown } | { ok: false; error: string };

/** A sentinel JSON value for a failed/timed-out case's wire-format
 * output -- it will never equal a real `expected_output`, so the
 * server's plain equality check (apps/api/app/services/exercises_service.py)
 * naturally scores it as failed without needing to special-case it.
 */
export function caseResultToSubmittedOutput(result: CaseRunResult): unknown {
  return result.ok ? result.value : { __error__: result.error };
}

/** Constructs a real sandbox Worker from the bootstrap source as a
 * Blob URL, rather than a bundler-native `new Worker(new URL(...))` --
 * this works identically regardless of whether the app is bundled with
 * Turbopack or webpack, avoiding a dependency on Turbopack's own
 * worker-asset handling. The Blob URL is intentionally never revoked:
 * revoking it immediately risks a race in some browsers against the
 * Worker's own (asynchronous) script fetch, and the number of Blob
 * URLs created in one browser tab's lifetime here is bounded by how
 * many times a learner clicks Run/Submit -- not a real leak at that
 * scale for a single-user tool.
 */
export function createSandboxWorker(): Worker {
  const blob = new Blob([workerBootstrapSource()], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);
  return new Worker(url);
}

function runOneCase(
  code: string,
  functionName: string,
  input: unknown[],
  timeoutMs: number,
  createWorker: () => Worker,
): Promise<CaseRunResult> {
  const worker = createWorker();

  return new Promise<CaseRunResult>((resolve) => {
    let settled = false;

    const finish = (result: CaseRunResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      worker.terminate();
      resolve(result);
    };

    const timeoutId = setTimeout(() => finish({ ok: false, error: "timeout" }), timeoutMs);

    worker.onmessage = (event: MessageEvent<EvaluateResult>) => {
      const data = event.data;
      finish(data.ok ? { ok: true, value: data.value } : { ok: false, error: data.error });
    };

    worker.onerror = (event: ErrorEvent) => {
      finish({ ok: false, error: event.message || "Worker failed to run." });
    };

    worker.postMessage({ code, functionName, input });
  });
}

/** Runs `code`'s `functionName` against every case in `cases`, in
 * order, returning one outcome per case in the same order. Each case
 * gets its own fresh Worker (no state/closures carry over between
 * cases, by construction) and up to `timeoutMs` to respond before
 * being terminated and recorded as a timeout.
 */
export async function runTestCases(
  code: string,
  functionName: string,
  cases: TestCaseInput[],
  timeoutMs: number,
  createWorker: () => Worker = createSandboxWorker,
): Promise<CaseRunResult[]> {
  const results: CaseRunResult[] = [];
  for (const testCase of cases) {
    results.push(await runOneCase(code, functionName, testCase.input, timeoutMs, createWorker));
  }
  return results;
}

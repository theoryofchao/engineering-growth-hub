/** The actual evaluation logic run inside the sandbox Worker, factored
 * out as a plain function so it's directly unit-testable in Node (no
 * Worker needed) -- `new Function` works identically in both. The
 * Worker itself (see `workerBootstrapSource` below) is just a thin
 * onmessage/postMessage wrapper around this one call.
 *
 * This is the *only* place learner code ever executes, and it never
 * runs anywhere but the browser -- see docs/decisions/0028-....md.
 */

export type EvaluateResult = { ok: true; value: unknown } | { ok: false; error: string };

export function evaluateSubmission(
  code: string,
  functionName: string,
  input: unknown[],
): EvaluateResult {
  try {
    const factory = new Function(
      `${code}\nreturn typeof ${functionName} === "function" ? ${functionName} : undefined;`,
    );
    const fn = factory();
    if (typeof fn !== "function") {
      return { ok: false, error: `No function named \`${functionName}\` was defined.` };
    }
    const value = fn(...input);
    return { ok: true, value };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message };
  }
}

/** Source text for the Worker's own bootstrap script, built from
 * `evaluateSubmission` via `.toString()` so the two never drift apart.
 * Instantiated as a Blob URL (see code-runner.ts) rather than a
 * bundler-native `new Worker(new URL(...))`, to stay bundler-agnostic
 * under Turbopack.
 */
export function workerBootstrapSource(): string {
  return `
"use strict";
const evaluateSubmission = ${evaluateSubmission.toString()};
self.onmessage = function (event) {
  const { code, functionName, input } = event.data;
  self.postMessage(evaluateSubmission(code, functionName, input));
};
`;
}

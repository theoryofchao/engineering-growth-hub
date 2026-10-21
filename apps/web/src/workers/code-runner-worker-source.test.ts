import { describe, expect, it } from "vitest";

import { evaluateSubmission } from "./code-runner-worker-source";

describe("evaluateSubmission", () => {
  it("runs a correct function and returns its value", () => {
    const result = evaluateSubmission("function add(a, b) { return a + b; }", "add", [2, 3]);

    expect(result).toEqual({ ok: true, value: 5 });
  });

  it("reports a thrown exception as an error, not a crash", () => {
    const result = evaluateSubmission("function boom() { throw new Error('nope'); }", "boom", []);

    expect(result).toEqual({ ok: false, error: "nope" });
  });

  it("reports a syntax error in the submitted code as an error", () => {
    const result = evaluateSubmission("function broken( {", "broken", []);

    expect(result.ok).toBe(false);
  });

  it("reports a missing function name as an error", () => {
    const result = evaluateSubmission("function other() { return 1; }", "notDefined", []);

    expect(result).toEqual({
      ok: false,
      error: "No function named `notDefined` was defined.",
    });
  });

  it("spreads multi-argument input positionally", () => {
    const result = evaluateSubmission(
      "function concat3(a, b, c) { return [a, b, c].join('-'); }",
      "concat3",
      ["x", "y", "z"],
    );

    expect(result).toEqual({ ok: true, value: "x-y-z" });
  });
});

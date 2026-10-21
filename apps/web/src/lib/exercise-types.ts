/** Client-safe exercise shapes, mirroring the discriminated union served
 * by apps/api/app/schemas.py's `ExerciseSummary`. `hidden_test_cases`
 * deliberately carries no `expected_output` -- the client's sandboxed
 * run produces that itself; the answer key stays server-side until a
 * submission is scored (see app/services/exercises_service.py).
 */

export type ExerciseQuizData = {
  id: number;
  type: "multiple_choice";
  prompt: string;
  options: string[];
};

export type CodeTestCase = {
  input: unknown[];
  expected_output: unknown;
};

export type CodeHiddenTestCaseInput = {
  input: unknown[];
};

export type ExerciseCodeData = {
  id: number;
  type: "code";
  prompt: string;
  language: string;
  function_name: string;
  starter_code: string;
  timeout_ms: number;
  visible_test_cases: CodeTestCase[];
  hidden_test_cases: CodeHiddenTestCaseInput[];
};

export type Exercise = ExerciseQuizData | ExerciseCodeData;

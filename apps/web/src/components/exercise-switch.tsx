import { ExerciseCode } from "@/components/exercise-code";
import { ExerciseProject } from "@/components/exercise-project";
import { ExerciseQuiz } from "@/components/exercise-quiz";
import type { Exercise } from "@/lib/exercise-types";

/** Renders whichever exercise component matches `exercise.type`, so the
 * call sites (content-blocks.tsx x2, lesson-content.tsx, review-queue.tsx)
 * don't each need their own type switch.
 */
export function ExerciseSwitch({
  exercise,
  onSubmitted,
}: {
  exercise: Exercise;
  /** Threaded through to quiz/code only -- a project exercise is
   * self-attested, not submitted, so it never fires this. */
  onSubmitted?: (result: { is_correct: boolean }) => void;
}) {
  if (exercise.type === "code")
    return <ExerciseCode exercise={exercise} onSubmitted={onSubmitted} />;
  if (exercise.type === "project") return <ExerciseProject exercise={exercise} />;
  return <ExerciseQuiz exercise={exercise} onSubmitted={onSubmitted} />;
}

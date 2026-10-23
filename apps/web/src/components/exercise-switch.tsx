import { ExerciseCode } from "@/components/exercise-code";
import { ExerciseProject } from "@/components/exercise-project";
import { ExerciseQuiz } from "@/components/exercise-quiz";
import type { Exercise } from "@/lib/exercise-types";

/** Renders whichever exercise component matches `exercise.type`, so the
 * three call sites (content-blocks.tsx x2, lesson-content.tsx) don't
 * each need their own type switch.
 */
export function ExerciseSwitch({ exercise }: { exercise: Exercise }) {
  if (exercise.type === "code") return <ExerciseCode exercise={exercise} />;
  if (exercise.type === "project") return <ExerciseProject exercise={exercise} />;
  return <ExerciseQuiz exercise={exercise} />;
}

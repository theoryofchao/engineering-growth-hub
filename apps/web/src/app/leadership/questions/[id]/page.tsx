import Link from "next/link";
import { Suspense } from "react";

import { ContentWidthContainer } from "@/components/content-width-container";
import { DecisionTree } from "@/components/decision-tree";

// Plain params type, not Next's generated `PageProps<"...">` helper --
// this host's `.next` build-cache directory is currently root-owned
// (unrelated to this change, pre-existing environment issue), which
// blocks regenerating the route-literal union that helper depends on.
// This is behaviorally identical once that's fixed.
export default function LeadershipQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="flex flex-1 justify-center bg-zinc-50 font-sans dark:bg-black">
      <ContentWidthContainer>
        <Link
          href="/leadership/questions"
          className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Question → competency → story
        </h1>
        <Suspense
          fallback={
            <p role="status" aria-live="polite" className="text-zinc-600 dark:text-zinc-400">
              Loading…
            </p>
          }
        >
          <QuestionSection params={params} />
        </Suspense>
      </ContentWidthContainer>
    </div>
  );
}

async function QuestionSection({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DecisionTree questionId={Number(id)} />;
}

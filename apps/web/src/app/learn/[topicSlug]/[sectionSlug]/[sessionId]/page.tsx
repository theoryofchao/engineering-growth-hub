import Link from "next/link";
import { Suspense } from "react";

import { ContentWidthContainer } from "@/components/content-width-container";
import { LessonContent } from "@/components/lesson-content";

export default function LearningSessionPage(
  props: PageProps<"/learn/[topicSlug]/[sectionSlug]/[sessionId]">,
) {
  return (
    <div className="flex flex-1 justify-center bg-zinc-50 font-sans dark:bg-black">
      <ContentWidthContainer>
        <Link href="/" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
          ← Back
        </Link>
        <Suspense
          fallback={
            <p role="status" aria-live="polite" className="text-zinc-600 dark:text-zinc-400">
              Loading lesson…
            </p>
          }
        >
          <LessonSection params={props.params} />
        </Suspense>
      </ContentWidthContainer>
    </div>
  );
}

async function LessonSection({
  params,
}: {
  params: PageProps<"/learn/[topicSlug]/[sectionSlug]/[sessionId]">["params"];
}) {
  const { topicSlug, sectionSlug, sessionId } = await params;
  return (
    <LessonContent topicSlug={topicSlug} sectionSlug={sectionSlug} sessionId={Number(sessionId)} />
  );
}

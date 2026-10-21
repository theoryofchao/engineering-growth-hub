import Link from "next/link";
import { Suspense } from "react";

import { ContentWidthContainer } from "@/components/content-width-container";
import { StoryForm } from "@/components/story-form";

export default function EditLeadershipStoryPage(props: PageProps<"/leadership/stories/[id]">) {
  return (
    <div className="flex flex-1 justify-center bg-zinc-50 font-sans dark:bg-black">
      <ContentWidthContainer>
        <Link
          href="/leadership"
          className="text-sm text-zinc-500 hover:underline dark:text-zinc-400"
        >
          ← Back
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Edit story
        </h1>
        <Suspense
          fallback={
            <p role="status" aria-live="polite" className="text-zinc-600 dark:text-zinc-400">
              Loading story…
            </p>
          }
        >
          <StorySection params={props.params} />
        </Suspense>
      </ContentWidthContainer>
    </div>
  );
}

async function StorySection({
  params,
}: {
  params: PageProps<"/leadership/stories/[id]">["params"];
}) {
  const { id } = await params;
  return <StoryForm mode="edit" storyId={Number(id)} />;
}

import Link from "next/link";

import { ContentWidthContainer } from "@/components/content-width-container";
import { StoryForm } from "@/components/story-form";

export default function NewLeadershipStoryPage() {
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
          New story
        </h1>
        <StoryForm mode="create" />
      </ContentWidthContainer>
    </div>
  );
}

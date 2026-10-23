import Link from "next/link";

import { ContentWidthContainer } from "@/components/content-width-container";
import { ReviewQueue } from "@/components/review-queue";

export default function ReviewPage() {
  return (
    <div className="flex flex-1 justify-center bg-zinc-50 font-sans dark:bg-black">
      <ContentWidthContainer>
        <Link href="/" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
          ← Back
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Review
        </h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Exercises you&apos;ve already done, resurfaced on a schedule so what you&apos;ve learned
          sticks.
        </p>
        <div className="mt-6">
          <ReviewQueue />
        </div>
      </ContentWidthContainer>
    </div>
  );
}

import Link from "next/link";
import { Suspense } from "react";

import { TopicOverview } from "@/components/topic-overview";

export default function TopicPage(props: PageProps<"/topics/[id]">) {
  return (
    <div className="flex flex-1 justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col gap-6 px-6 py-16">
        <Link href="/" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
          ← Back
        </Link>
        <Suspense
          fallback={
            <p role="status" aria-live="polite" className="text-zinc-600 dark:text-zinc-400">
              Loading topic…
            </p>
          }
        >
          <TopicSection params={props.params} />
        </Suspense>
      </main>
    </div>
  );
}

async function TopicSection({ params }: { params: PageProps<"/topics/[id]">["params"] }) {
  const { id } = await params;
  return <TopicOverview topicId={Number(id)} />;
}

import Link from "next/link";
import { Suspense } from "react";

import { SectionOverview } from "@/components/section-overview";

export default function SectionPage(props: PageProps<"/learn/[topicSlug]/[sectionSlug]">) {
  return (
    <div className="flex flex-1 justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col gap-6 px-6 py-16">
        <Link href="/" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
          ← Back
        </Link>
        <Suspense
          fallback={
            <p role="status" aria-live="polite" className="text-zinc-600 dark:text-zinc-400">
              Loading section…
            </p>
          }
        >
          <SectionPageContent params={props.params} />
        </Suspense>
      </main>
    </div>
  );
}

async function SectionPageContent({
  params,
}: {
  params: PageProps<"/learn/[topicSlug]/[sectionSlug]">["params"];
}) {
  const { topicSlug, sectionSlug } = await params;
  return <SectionOverview topicSlug={topicSlug} sectionSlug={sectionSlug} />;
}

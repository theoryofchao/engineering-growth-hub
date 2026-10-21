import Link from "next/link";
import { Suspense } from "react";

import { ContentWidthContainer } from "@/components/content-width-container";
import { SectionOverview } from "@/components/section-overview";

export default function SectionPage(props: PageProps<"/learn/[topicSlug]/[sectionSlug]">) {
  return (
    <div className="flex flex-1 justify-center bg-zinc-50 font-sans dark:bg-black">
      <ContentWidthContainer>
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
      </ContentWidthContainer>
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

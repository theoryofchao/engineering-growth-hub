import Link from "next/link";

import { ContentWidthContainer } from "@/components/content-width-container";
import { CurriculumTree } from "@/components/curriculum-tree";
import { HealthStatus } from "@/components/health-status";
import { TierLegend } from "@/components/tier-legend";

export default function Home() {
  return (
    <div className="flex flex-1 justify-center bg-zinc-50 font-sans dark:bg-black">
      <ContentWidthContainer
        baseMaxWidthClassName="max-w-4xl"
        className="flex-col gap-8 px-6 py-16"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
              Engineering Growth Hub
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              The full curriculum map. Most sections are still work in progress — only a few have
              lessons ready yet.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link
              href="/leadership"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-black hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              Leadership
            </Link>
            <Link
              href="/review"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-black hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              Review
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-black hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              Dashboard
            </Link>
          </div>
        </div>

        <TierLegend />

        <CurriculumTree />

        <div className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <HealthStatus />
        </div>
      </ContentWidthContainer>
    </div>
  );
}

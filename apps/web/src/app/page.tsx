import Link from "next/link";

import { HealthStatus } from "@/components/health-status";
import { TierLegend } from "@/components/tier-legend";
import { TopicList } from "@/components/topic-list";

export default function Home() {
  return (
    <div className="flex flex-1 justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-4xl flex-col gap-8 px-6 py-16">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
              Engineering Growth Hub
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              The full curriculum map. Most topics are still work in progress — only a few have
              lessons ready yet.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="shrink-0 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-black hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            Dashboard
          </Link>
        </div>

        <TierLegend />

        <TopicList />

        <div className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <HealthStatus />
        </div>
      </main>
    </div>
  );
}

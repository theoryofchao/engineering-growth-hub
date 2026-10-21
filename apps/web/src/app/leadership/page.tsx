import Link from "next/link";

import { ContentWidthContainer } from "@/components/content-width-container";
import { LeadershipHome } from "@/components/leadership-home";

export default function LeadershipPage() {
  return (
    <div className="flex flex-1 justify-center bg-zinc-50 font-sans dark:bg-black">
      <ContentWidthContainer>
        <Link href="/" className="text-sm text-zinc-500 hover:underline dark:text-zinc-400">
          ← Back
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Leadership
        </h1>
        <LeadershipHome />
      </ContentWidthContainer>
    </div>
  );
}

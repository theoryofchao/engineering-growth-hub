"use client";

import { useContentWidth } from "@/hooks/use-content-width";

/**
 * Wraps a page's main content area with a user-tunable max-width, as a
 * percentage of the viewport, so the content actually scales with the
 * viewport instead of being capped at a fixed pixel width regardless of
 * screen size. The control for this lives in the site-wide settings
 * panel (`SiteSettings`), not here -- this component only ever applies
 * whatever `useContentWidth` currently holds.
 */
export function ContentWidthContainer({
  baseMaxWidthClassName = "max-w-2xl",
  className = "flex-col gap-6 px-6 py-16",
  children,
}: {
  baseMaxWidthClassName?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [widthVw] = useContentWidth();

  return (
    <main
      className={`flex w-full ${baseMaxWidthClassName} ${className}`}
      style={widthVw !== null ? { maxWidth: `${widthVw}vw` } : undefined}
    >
      {children}
    </main>
  );
}

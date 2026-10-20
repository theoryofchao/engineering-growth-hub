export type ContentExample = { label: string; content: string };

/**
 * Worked examples for a slide, each collapsed by default so a long
 * code/config sample doesn't push past the slide's body. Native
 * <details>/<summary> (same pattern as ContentWidthContainer) rather
 * than a stateful component — no open/close logic to own.
 */
export function ExampleAccordion({ examples }: { examples: ContentExample[] }) {
  if (examples.length === 0) return null;

  return (
    <div className="mt-4 flex flex-col gap-2">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Examples
      </h4>
      {examples.map((example) => (
        <details
          key={example.label}
          className="rounded-lg border border-zinc-300 dark:border-zinc-700"
        >
          <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900">
            {example.label}
          </summary>
          <pre className="overflow-x-auto whitespace-pre-wrap border-t border-zinc-300 bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200">
            {example.content}
          </pre>
        </details>
      ))}
    </div>
  );
}

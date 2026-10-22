export type ReferenceLink = { label: string; url: string };

/**
 * External citations/further-reading links for a slide, author-provided
 * like ExampleAccordion's examples (not learner-generated like notes).
 * A plain list, not collapsed -- unlike a worked example these are just
 * short labeled links, not content that competes for the slide's space.
 */
export function ReferenceLinks({ links }: { links: ReferenceLink[] }) {
  if (links.length === 0) return null;

  return (
    <div className="mt-4 flex flex-col gap-1">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Reference links
      </h4>
      <ul className="flex flex-col gap-0.5">
        {links.map((link) => (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

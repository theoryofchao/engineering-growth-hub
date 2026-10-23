import { Fragment } from "react";

/** Matches a backtick-delimited code span. Checked first and left
 * untouched by emphasis parsing below -- body text sometimes contains a
 * literal `*` inside one (e.g. "`i * element_size`", a multiplication,
 * not markdown), and scanning through it for emphasis markers would
 * misread that `*` as an opening delimiter and then greedily swallow
 * everything up to the next real one, anywhere later in the text.
 */
const CODE_SPAN_PATTERN = /(`[^`]+`)/g;

/** Matches `**bold**` or `*italic*` -- checked in that order so `**` isn't
 * misread as two adjacent italic markers. Requires no `*` inside the span,
 * so a stray, unpaired `*` (e.g. "page * 2") is left as plain text rather
 * than swallowed looking for a closing marker that was never there.
 */
const EMPHASIS_PATTERN = /(\*\*[^*]+?\*\*|\*[^*]+?\*)/g;

function renderEmphasis(text: string, keyPrefix: string) {
  return text.split(EMPHASIS_PATTERN).map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    return <Fragment key={key}>{part}</Fragment>;
  });
}

/** Renders a very small, deliberately non-extensible subset of Markdown --
 * `**bold**` and `*italic*` only -- inline within content-block body text,
 * which otherwise renders as a plain, unparsed string (see
 * content-blocks.tsx). This isn't a general Markdown renderer: body text
 * is authored prose, not a place for links, lists, or headings, and
 * `whitespace-pre-wrap` on the parent element already preserves blank
 * lines between paragraphs without any help from this component.
 *
 * Backtick code spans are split out first and rendered as literal text,
 * untouched by emphasis parsing -- see CODE_SPAN_PATTERN above for why.
 */
export function InlineMarkdown({ text }: { text: string }) {
  return (
    <>
      {text.split(CODE_SPAN_PATTERN).map((segment, index) => {
        const key = `segment-${index}`;
        if (segment.startsWith("`") && segment.endsWith("`")) {
          return <Fragment key={key}>{segment}</Fragment>;
        }
        return <Fragment key={key}>{renderEmphasis(segment, key)}</Fragment>;
      })}
    </>
  );
}

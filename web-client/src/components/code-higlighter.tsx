import { createResource, Suspense } from "solid-js";
import {
  createHighlighter,
  type HighlighterLang,
  getHighlightedCode,
} from "~/lib/code-highlight";
import sanitizeHtml from "sanitize-html";
import { Highlighter } from "shiki";

type Props = {
  text: string | undefined;
  lang: HighlighterLang;
  highlightedLine?: number;
};

export function CodeHighlighter(props: Props) {
  // The used highlighter does not change at all atm so it does not need to be coupled
  const [highlighter] = createResource(() => createHighlighter());

  const html = (
    text: string | undefined,
    highlighter: Highlighter | undefined,
    lang: HighlighterLang,
    highlightedLine?: number
  ) => {
    if (!text || !highlighter) return undefined;
    const raw = getHighlightedCode([text, highlighter, lang, highlightedLine]);

    return sanitizeHtml(raw, {
      allowedTags: ["pre", "code", "span"],
      allowedAttributes: {
        pre: ["class"],
        span: ["class", "style"],
      },
    });
  };

  return (
    <div
      //eslint-disable-next-line solid/no-innerhtml
      innerHTML={html(
        props.text,
        highlighter(),
        props.lang,
        props.highlightedLine
      )}
    />
  );
}

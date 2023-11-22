import { Suspense, createResource } from "solid-js";
import { Connection } from "~/lib/connection/transport.ts";
import { useRouteData } from "@solidjs/router";
import { Loader } from "~/components/loader";
import {
  HighlighterLang,
  createHighlighter,
  getHighlightedCode,
  getText,
} from "~/lib/code-highlight";

import { Highlighter } from "shiki";

type CodeViewProps = {
  path: string;
  size: number;
  lang: HighlighterLang;
  highlightedLine?: number;
};

export default function CodeView(props: CodeViewProps) {
  const { client } = useRouteData<Connection>();

  // We split the computations into 3 steps. This decouples them from the reactive props they don't need to react to

  // The text only needs to be computed when the the source changes
  const [text] = createResource(
    () => [client.sources, props.path, props.size] as const,
    async (textProps) => getText(...textProps)
  );

  // The used highlighter does not change at all atm so it does not need to be coupled
  const [highlighter] = createResource(() => createHighlighter());

  const html = (
    text: string | undefined,
    highlighter: Highlighter | undefined,
    lang: HighlighterLang,
    highlightedLine?: number
  ) => {
    if (!text || !highlighter) return undefined;
    return getHighlightedCode([text, highlighter, lang, highlightedLine]);
  };

  return (
    <div class="min-h-full h-max min-w-full w-max bg-black bg-opacity-50">
      <Suspense fallback={<Loader />}>
        <div
          //eslint-disable-next-line solid/no-innerhtml
          innerHTML={html(
            text(),
            highlighter(),
            props.lang,
            props.highlightedLine
          )}
        />
      </Suspense>
    </div>
  );
}

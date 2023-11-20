import { Suspense, createResource } from "solid-js";
import { Loader } from "~/components/loader";
import { useConnection } from "~/context/connection-provider";
import {
  HighlighterLang,
  createHighlighter,
  getHighlightedCode,
} from "~/lib/code-highlight";

import { Highlighter } from "shiki";

type CodeViewProps = {
  path: string;
  size: number;
  lang: HighlighterLang;
  highlightedLine?: number;
};

export default function CodeView(props: CodeViewProps) {
  const { connectionStore } = useConnection();
  const [html] = createResource(
    () =>
      [
        connectionStore.client.sources,
        props.path,
        props.size,
        props.lang,
      ] as const,
    (sourceSignals) => getHighlightedCode(sourceSignals)
  );

  // The used highlighter does not change at all atm so it does not need to be coupled
  // const [highlighter] = createResource(() => createHighlighter());

  // const html = (
  //   text: string | undefined,
  //   highlighter: Highlighter | undefined,
  //   lang: HighlighterLang,
  //   highlightedLine?: number
  // ) => {
  //   if (!text || !highlighter) return undefined;
  //   return getHighlightedCode([text, highlighter, lang, highlightedLine]);
  // };

  return (
    <div class="min-h-full h-max min-w-full w-max bg-black bg-opacity-50">
      <Suspense fallback={<Loader />}>
        <div
          //eslint-disable-next-line solid/no-innerhtml
          innerHTML={html()}
        />
      </Suspense>
    </div>
  );
}

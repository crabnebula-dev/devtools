import { Highlighter } from "shiki";
import { Suspense, createResource } from "solid-js";
import { Loader } from "~/components/loader";
import { useConnection } from "~/context/connection-provider";
import {
  HighlighterLang,
  createHighlighter,
  getHighlightedCode,
  getText,
} from "~/lib/code-highlight";

type CodeViewProps = {
  path: string;
  size: number;
  lang: HighlighterLang;
  highlightedLine?: number;
};

export function CodeView(props: CodeViewProps) {
  const { connectionStore } = useConnection();

  const [text] = createResource(
    () => [connectionStore.client.sources, props.path, props.size] as const,
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

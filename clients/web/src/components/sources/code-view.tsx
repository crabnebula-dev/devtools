import { Suspense, createResource } from "solid-js";
import { Loader } from "~/components/loader";
import { useConnection } from "~/context/connection-provider";
import { HighlighterLang, getText } from "~/lib/code-highlight";
import { CodeHighlighter } from "../code-highlighter";

type CodeViewProps = {
  path: string;
  size: number;
  lang: HighlighterLang;
  highlightedLine?: number;
};

export default function CodeView(props: CodeViewProps) {
  const { connectionStore } = useConnection();

  const [text] = createResource(
    () => [connectionStore.client.sources, props.path, props.size] as const,
    async (textProps) => getText(...textProps)
  );

  return (
    <div class="min-h-full h-max min-w-full w-max bg-black bg-opacity-50">
      <Suspense fallback={<Loader />}>
        <CodeHighlighter
          text={text()}
          lang={props.lang}
          highlightedLine={props.highlightedLine}
        />
      </Suspense>
    </div>
  );
}

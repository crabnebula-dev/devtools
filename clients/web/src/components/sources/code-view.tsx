import { JSXElement, Suspense, createEffect, createResource } from "solid-js";
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
    async (textProps) => getText(...textProps),
  );

  return (
    <div class="min-h-full h-max min-w-full w-max">
      <Suspense fallback={<Loader />}>
        <ScrollToLine line={props.highlightedLine}>
          <CodeHighlighter
            text={text()}
            lang={props.lang}
            highlightedLine={props.highlightedLine}
          />
        </ScrollToLine>
      </Suspense>
    </div>
  );
}

function ScrollToLine(props: { children: JSXElement; line?: number }) {
  createEffect(() => {
    if (props.line) {
      const elements = document.getElementsByClassName(`line`);

      if (elements.length < props.line) return;
      const element = elements[props.line - 1];
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  });
  return <>{props.children}</>;
}

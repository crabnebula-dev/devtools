import { Suspense, createResource } from "solid-js";
import { Connection } from "~/lib/connection/transport.ts";
import { useRouteData } from "@solidjs/router";
import { Loader } from "~/components/loader";
import {
  HighlighterLang,
  getHighlightedCode,
} from "~/lib/sources/code-highlight";

type CodeViewProps = {
  path: string;
  size: number;
  lang: HighlighterLang;
};

export default function CodeView(props: CodeViewProps) {
  const { client } = useRouteData<Connection>();
  const [html] = createResource(
    () => [client.sources, props.path, props.size, props.lang] as const,
    (sourceSignals) => getHighlightedCode(sourceSignals)
  );

  return (
    <div class="min-h-full h-max min-w-full w-max bg-black bg-opacity-50">
      <Suspense fallback={<Loader />}>
        {/* eslint-disable-next-line solid/no-innerhtml */}
        <div innerHTML={html()} />
      </Suspense>
    </div>
  );
}

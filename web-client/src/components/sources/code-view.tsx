// Initializing a TextDecoder is expensive plus they can be reused,
// so we create a global instance
import { createResource, Suspense } from "solid-js";
import { getEntryBytes } from "~/lib/sources/util.ts";
import { getHighlighter, setCDN, setWasm } from "shiki";
import { Connection } from "~/lib/connection/transport.ts";
import { useRouteData } from "@solidjs/router";
import { Loader } from "~/components/loader";

const TEXT_DECODER = new TextDecoder();

function createHighlighter() {
  return createResource(async () => {
    const responseWasm = await fetch("/shiki/onig.wasm");
    setWasm(responseWasm);
    setCDN("/shiki/");

    return getHighlighter({
      theme: "material-theme-ocean",
      langs: ["js", "rust", "toml", "html", "json", "md", "yaml"],
      paths: { wasm: "dist/" },
    });
  });
}

export default function CodeView(props: {
  path: string;
  size: number;
  lang: string;
}) {
  const { client } = useRouteData<Connection>();
  const [bytes] = createResource(
    () => [client.sources, props.path, props.size] as const,
    ([client, path, size]) => getEntryBytes(client, path, size)
  );

  const text = () => TEXT_DECODER.decode(bytes());

  const [highlighter] = createHighlighter();

  const html = () => highlighter()?.codeToHtml(text(), { lang: props.lang });

  return (
    <div class="min-h-full h-max min-w-full w-max bg-black bg-opacity-50">
      <Suspense fallback={<Loader />}>
        {/* eslint-disable-next-line solid/no-innerhtml */}
        <div innerHTML={html()} />
      </Suspense>
    </div>
  );
}

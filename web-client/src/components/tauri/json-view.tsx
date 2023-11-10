// Initializing a TextDecoder is expensive plus they can be reused,
// so we create a global instance
import { useRouteData } from "@solidjs/router";
import { createResource, Suspense } from "solid-js";
import { getEntryBytes } from "~/lib/sources/util.ts";
import { getHighlighter, setCDN, setWasm } from "shiki";
import { Connection } from "~/lib/connection/transport.ts";
import "./highlight.css";
import { findLineNumberByNestedKey } from "~/lib/tauri/tauri-conf-schema";
import { useConfiguration } from "./configuration-context";
import { createEffect } from "solid-js";

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

export default function JsonView(props: {
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

  const {
    highlightKey: { highlightKey },
  } = useConfiguration();

  createEffect(() => {
    highlightKey();
    const highlightedLine = document.querySelector(".line.highlighted");
    if (highlightedLine) {
      highlightedLine.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });

  const html = () =>
    highlighter()?.codeToHtml(text(), {
      lang: props.lang,
      lineOptions: [
        {
          line: findLineNumberByNestedKey(text(), highlightKey()),
          classes: ["highlighted"],
        },
      ],
    });

  return (
    <div
      class={"min-h-full h-[max-content] min-w-full w-[max-content]"}
      style={{ "background-color": "rgb(7 7 7)" }}
    >
      <h1 class="text-2xl p-4">{props.path}</h1>
      <Suspense fallback={<span>Loading...</span>}>
        {/* eslint-disable-next-line solid/no-innerhtml */}
        <div innerHTML={html()} />
      </Suspense>
    </div>
  );
}

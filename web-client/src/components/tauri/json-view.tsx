import { findLineNumberByNestedKey } from "~/lib/tauri/tauri-conf-schema";
import { useConfiguration } from "./configuration-context";
import { createEffect, Show } from "solid-js";
import CodeView from "../sources/code-view";
import { useParams, useSearchParams } from "@solidjs/router";

export default function JsonView() {
  const params = useParams<{ config: string }>();
  const [searchParams] = useSearchParams<{ size: string }>();

  const {
    highlightKey: { highlightKey },
    configurations: { configurations },
  } = useConfiguration();

  const config = () =>
    configurations.configs?.find((x) => x.path === params.config);

  const lineNumber = () =>
    findLineNumberByNestedKey(config()?.raw ?? "", highlightKey());

  createEffect(() => {
    highlightKey();
    const highlightedLine = document.querySelector(".line.highlighted");
    if (highlightedLine) {
      highlightedLine.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });

  return (
    <Show when={params.config}>
      <CodeView
        path={params.config}
        size={Number(searchParams.size)}
        lang={"json"}
        highlightedLine={lineNumber()}
      />
    </Show>
  );
}

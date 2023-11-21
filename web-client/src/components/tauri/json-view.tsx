import {
  findLineNumberByKey,
  scrollToHighlighted,
} from "~/lib/tauri/tauri-conf-schema";
import { useConfiguration } from "./configuration-context";
import { createEffect, Show } from "solid-js";
import CodeView from "../sources/code-view";
import { useParams, useSearchParams } from "@solidjs/router";

export default function JsonView() {
  const params = useParams<{ config: string }>();
  const [searchParams] = useSearchParams<{ size: string }>();

  const {
    highlightKey: { highlightKey },
  } = useConfiguration();

  const lineNumber = () => findLineNumberByKey(highlightKey());

  createEffect(() => {
    highlightKey();
    scrollToHighlighted();
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

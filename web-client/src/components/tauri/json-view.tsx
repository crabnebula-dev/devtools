import {
  findLineNumberByKey,
  scrollToHighlighted,
} from "~/lib/tauri/tauri-conf-schema";
import { useConfiguration } from "./configuration-context";
import { createEffect, Show, Suspense } from "solid-js";
import { Loader } from "../loader";
import { useParams } from "@solidjs/router";
import { retrieveConfigurationByKey } from "~/lib/tauri/tauri-conf-schema";
import { CodeHighlighter } from "../code-higlighter";

export default function JsonView() {
  const params = useParams<{ config: string }>();
  const config = () => retrieveConfigurationByKey(params.config);
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
      <Show
        when={config()?.key !== "loaded"}
        fallback={
          <p class="p-3">
            This configuration is parsed and merged, so there is no direct
            source file to display.
          </p>
        }
      >
        <Suspense fallback={<Loader />}>
          <CodeHighlighter
            text={config()?.raw}
            lang="json"
            highlightedLine={lineNumber()}
          />
        </Suspense>
      </Show>
    </Show>
  );
}

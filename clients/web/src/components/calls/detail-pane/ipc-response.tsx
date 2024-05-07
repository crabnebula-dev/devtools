import { Show, Suspense } from "solid-js";
import { Loader } from "~/components/loader";
import { CodeHighlighter } from "~/components/code-highlighter";

export function IpcResponse(props: { response: string | null | undefined }) {
  return (
    <Show when={props.response}>
      {(raw) => (
        <div class="grid gap-2">
          <h2 class="text-xl p-4">Response</h2>
          <pre class="bg-black rounded max-w-full max-h-[250px] overflow-auto">
            <Suspense fallback={<Loader />}>
              <CodeHighlighter text={raw()} lang="rust" />
            </Suspense>
          </pre>
        </div>
      )}
    </Show>
  );
}

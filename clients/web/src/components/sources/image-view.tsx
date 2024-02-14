import { createResource, Show } from "solid-js";
import { useConnection } from "~/context/connection-provider";
import { decodeFileName, getEntryBytes } from "~/lib/sources/file-entries.ts";

export function ImageView(props: { path: string; size: number; type: string }) {
  const { connectionStore } = useConnection();
  const [bytes] = createResource(
    () => [connectionStore.client.sources, props.path, props.size] as const,
    ([client, path, size]) => getEntryBytes(client, decodeFileName(path), size),
  );

  const url = () => {
    const b = bytes();

    if (!b) return;
    return URL.createObjectURL(new Blob([b], { type: props.type }));
  };

  return (
    <Show when={url()}>
      <img
        class="max-w-full max-h-full"
        src={url()}
        alt={`image for ${props.path}`}
      />
    </Show>
  );
}

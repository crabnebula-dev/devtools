import { For, Show, createEffect, createSignal } from "solid-js";
import { useSocketData, useWs } from "~/lib/ws/context";
import { useSubscriber } from "~/lib/ws/queries";

export default function CommingSoon() {
  const { data } = useSocketData();
  const [currentAssetPath, setCurrentAssetPath] = createSignal("");
  const ws = useWs();
  const subscriber = useSubscriber(ws.socket);
  const [asset, setAsset] = createSignal("");

  createEffect(() => {
    setAsset(data.currentAsset ? new TextDecoder().decode(new Uint8Array(data.currentAsset.bytes)) : '');
  });

  function selectAsset(path: string) {
    setCurrentAssetPath(path);
    subscriber("tauri_getAsset", { path });
  }

  return (
    <>
      <For each={data.assetPaths}>
        {(path) => {
          return (
            <div>
              <input type="radio" name="asset-path" id={path} value={currentAssetPath()} onInput={() => selectAsset(path)}/>
              <label for={path}>{path}</label>
            </div>
          );
        }}
      </For>

      <Show when={asset()}>
        {asset()}
      </Show>
    </>
  );
}

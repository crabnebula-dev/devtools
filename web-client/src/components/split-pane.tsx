import { type JSXElement, onMount, For } from "solid-js";
import Split from "split.js";
import {
  getArrayFromLocalStorage,
  setToLocalStorage,
} from "~/lib/localstorage";

type WrapperProps = {
  class?: string;
  defaultPrefix: string;
  panes: JSXElement[];
  initialSizes: number[];
  defaultMinSizes: number[];
};

export function SplitPane(props: WrapperProps) {
  const splitGutterSizeKey = `${props.defaultPrefix}-sources-split-size`;
  const sizes = getArrayFromLocalStorage(splitGutterSizeKey);

  const paneNames = () => {
    const prefixes = [];
    for (let i = 0; i < props.panes.length; i++) {
      prefixes.push(`${props.defaultPrefix}-${i}-pane`);
    }

    return prefixes;
  };

  onMount(() => {
    Split(
      paneNames().map((i) => "#" + i),
      {
        sizes,
        minSize: props.defaultMinSizes,
        gutterSize: 70,
        onDragEnd: function (sizes) {
          setToLocalStorage(splitGutterSizeKey, sizes);
        },
      }
    );
  });
  return (
    <div class={`flex h-full overflow-y-hidden ${props.class || ""}`}>
      <For each={props.panes}>
        {(pane, idx) => (
          <section
            id={paneNames()[idx()]}
            class="border-neutral-800 border-x-2 overflow-y-auto"
          >
            {pane}
          </section>
        )}
      </For>
    </div>
  );
}

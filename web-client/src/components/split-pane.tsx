import { type JSXElement, onMount, onCleanup, For } from "solid-js";
import { clsx } from "clsx";
import Split from "split.js";
import {
  getArrayFromLocalStorage,
  setToLocalStorage,
} from "~/lib/localstorage";

type WrapperProps = {
  class?: string;
  defaultPrefix: string;
  children: JSXElement[];
  initialSizes: number[];
  defaultMinSizes: number[];
  gutterSize?: number;
};

export function SplitPane(props: WrapperProps) {
  /* Since we don't plan to use the SplitPane with dynamic properties we destructure them here */
  const { defaultPrefix, initialSizes, defaultMinSizes, gutterSize, children } =
    /* eslint-disable-next-line solid/reactivity */
    props;

  const splitGutterSizeKey = `${defaultPrefix}-sources-split-size`;
  const sizes = getArrayFromLocalStorage(splitGutterSizeKey, initialSizes);

  const paneNames: string[] = [];
  for (let i = 0; i < children.length; i++) {
    paneNames.push(`${defaultPrefix}-${i}-pane`);
  }

  const paneIds = paneNames.map((i) => "#" + i);

  let splitInstance: Split.Instance;

  onMount(() => {
    splitInstance = Split(paneIds, {
      sizes,
      minSize: defaultMinSizes,
      gutterSize: gutterSize ?? 10,
      onDragEnd: function (sizes) {
        setToLocalStorage(splitGutterSizeKey, sizes);
      },
    });
  });

  onCleanup(() => splitInstance?.destroy());

  return (
    <div class={clsx(`flex h-full overflow-auto`, props.class)}>
      <For each={children}>
        {(pane, idx) => (
          <section
            id={paneNames[idx()]}
            class="border-neutral-800 border-x-2 overflow-auto"
          >
            {pane}
          </section>
        )}
      </For>
    </div>
  );
}

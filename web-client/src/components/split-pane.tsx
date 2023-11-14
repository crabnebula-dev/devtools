import { type JSXElement, onMount } from "solid-js";
import Split from "split.js";
import {
  getArrayFromLocalStorage,
  setToLocalStorage,
} from "~/lib/localstorage";

type WrapperProps = {
  class?: string;
  defaultPrefix: string;
  leftPaneComponent: JSXElement;
  rightPaneComponent: JSXElement;
};

export function SplitPane(props: WrapperProps) {
  const splitGutterSizeKey = `${props.defaultPrefix}-sources-split-size`;
  const sizes = getArrayFromLocalStorage(splitGutterSizeKey);

  onMount(() => {
    Split(
      [
        `#${props.defaultPrefix}-left-pane`,
        `#${props.defaultPrefix}-right-pane`,
      ],
      {
        sizes: sizes,
        minSize: [70, 200],
        gutterSize: 100,
        onDragEnd: function (sizes) {
          setToLocalStorage(splitGutterSizeKey, sizes);
        },
      }
    );
  });
  return (
    <div class={`split flex h-full overflow-y-hidden ${props.class}`}>
      <section id={`${props.defaultPrefix}-left-pane`}>
        {props.leftPaneComponent}
      </section>
      <section id={`${props.defaultPrefix}-right-pane`}>
        {props.rightPaneComponent}
      </section>
    </div>
  );
}

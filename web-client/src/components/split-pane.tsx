import { type JSXElement, onMount } from "solid-js";
import Split from "split.js";

type WrapperProps = {
  class?: string;
  prefix: string;
  leftPaneComponent: JSXElement;
  rightPaneComponent: JSXElement;
};

export function SplitPane(props: WrapperProps) {
  /**
   * prefix is not a reactive prop.
   */
  // eslint-disable-next-line
  const splitGutterSizeKey = `${props.prefix}-sources-split-size`;
  const storedSizes = localStorage.getItem(splitGutterSizeKey);
  let sizes = [200, 800];

  if (storedSizes) {
    sizes = JSON.parse(storedSizes);
  }
  onMount(() => {
    Split([`#${props.prefix}-left-pane`, `#${props.prefix}-right-pane`], {
      sizes: sizes,
      minSize: [70, 200],
      gutterSize: 100,
      onDragEnd: function (sizes) {
        localStorage.setItem(splitGutterSizeKey, JSON.stringify(sizes));
      },
    });
  });
  return (
    <div class={`split flex h-full overflow-y-hidden ${props.class}`}>
      <section id={`${props.prefix}-left-pane`}>
        {props.leftPaneComponent}
      </section>
      <section id={`${props.prefix}-right-pane`}>
        {props.rightPaneComponent}
      </section>
    </div>
  );
}

import { type JSXElement, Show, For, createEffect, untrack } from "solid-js";
import { createVirtualizer } from "@tanstack/solid-virtual";
import clsx from "clsx";

export function VirtualList<VirtualItem>(props: {
  dataStream: VirtualItem[];
  class?: string;
  estimateSize: number;
  overscan: number;
  children: (item: VirtualItem, index: number) => JSXElement;
  shouldAutoScroll?: boolean;
}) {
  let virtualScrollElement: HTMLDivElement | undefined;

  const virtualizer = createVirtualizer({
    get count() {
      return props.dataStream.length;
    },
    getScrollElement: () => virtualScrollElement ?? null,
    estimateSize: () => props.estimateSize,
    overscan: untrack(() => props.overscan),
  });

  // Auto scroll on new element effect
  createEffect(() => {
    if (props.shouldAutoScroll && virtualizer.getTotalSize() > 0) {
      if (virtualizer.options.count > 0)
        virtualizer.scrollToIndex(virtualizer.options.count - 1);
    }
  });

  return (
    <div
      ref={virtualScrollElement}
      class={clsx("overflow-y-auto relative", props.class)}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        <ul
          class=""
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            transform: `translateY(${
              virtualizer.getVirtualItems()[0]?.start ?? 0
            }px)`,
          }}
        >
          <For each={virtualizer.getVirtualItems()}>
            {(virtualRow) => {
              return (
                <li
                  data-index={virtualRow.index}
                  ref={(el) =>
                    queueMicrotask(() => virtualizer.measureElement(el))
                  }
                >
                  <Show when={props.dataStream[virtualRow.index]}>
                    {props.children(
                      props.dataStream[virtualRow.index],
                      virtualRow.index,
                    )}
                  </Show>
                </li>
              );
            }}
          </For>
        </ul>
      </div>
    </div>
  );
}

import { Show, Accessor, JSXElement, For, createEffect } from "solid-js";
import { createVirtualizer } from "@tanstack/solid-virtual";

type AutoScrollPaneProps<AutoScrollItem> = {
  dataStream: AutoScrollItem[];
  displayComponent: (props: {
    event: AutoScrollItem;
    [key: string]: unknown;
  }) => JSXElement;
  displayOptions: Record<string, unknown>;
  shouldAutoScroll: Accessor<boolean>;
  fallback: JSXElement;
};

export function AutoScrollPane<AutoScrollItem>(
  props: AutoScrollPaneProps<AutoScrollItem>,
) {
  let logPanel: HTMLDivElement | undefined;

  const virtualizer = createVirtualizer({
    get count() {
      return props.dataStream.length;
    },
    getScrollElement: () => logPanel ?? null,
    estimateSize: () => 28,
    overscan: 25,
  });

  createEffect(() => {
    if (props.shouldAutoScroll() && props.dataStream.length > 0) {
      // When updating the filter really quick (fast typing for example) it is possible to void the virtual items
      // before the scroll can be performed, which will lead to an error
      try {
        virtualizer.scrollToIndex(virtualizer.options.count - 1);
      } catch (e) {
        /* intentionally ignore */
      }
    }
  });

  return (
    <div
      ref={logPanel}
      class="overflow-y-auto h-[calc(100%-var(--toolbar-height))]  relative"
      style={{
        contain: "strict",
      }}
    >
      <Show when={props.dataStream.length === 0 || !props.dataStream}>
        {props.fallback}
      </Show>
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
                  <props.displayComponent
                    event={props.dataStream[virtualRow.index]}
                    {...props.displayOptions}
                    odd={virtualRow.index & 1}
                  />
                </li>
              );
            }}
          </For>
        </ul>
      </div>
    </div>
  );
}

import {
  Show,
  Accessor,
  JSXElement,
  For,
  createEffect,
  createMemo,
} from "solid-js";
import { Virtualizer, createVirtualizer } from "@tanstack/solid-virtual";

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
  props: AutoScrollPaneProps<AutoScrollItem>
) {
  let logPanel: HTMLDivElement | undefined;

  function updateVirtualizer(
    virtualizer: Virtualizer<HTMLDivElement, Element>,
    count: number
  ) {
    virtualizer.setOptions({
      ...virtualizer.options,
      count: count,
    });
    virtualizer.measure();
    return virtualizer;
  }

  const virtualizer = createMemo(
    (oldVirtualizer: Virtualizer<HTMLDivElement, Element> | undefined) => {
      const newCount = props.dataStream.length;

      if (oldVirtualizer) return updateVirtualizer(oldVirtualizer, newCount);

      return createVirtualizer({
        count: newCount,
        getScrollElement: () => logPanel ?? null,
        estimateSize: () => 28,
        overscan: 25,
      });
    }
  );

  createEffect(() => {
    if (props.shouldAutoScroll() && props.dataStream.length > 0)
      virtualizer().scrollToIndex(props.dataStream.length - 1);
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
          height: `${virtualizer().getTotalSize()}px`,
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
              virtualizer().getVirtualItems()[0]?.start ?? 0
            }px)`,
          }}
        >
          <For each={virtualizer().getVirtualItems()}>
            {(virtualRow) => {
              return (
                <li
                  data-index={virtualRow.index}
                  ref={(el) =>
                    queueMicrotask(() => virtualizer().measureElement(el))
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

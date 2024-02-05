import { Show, Accessor, JSXElement, For, createEffect, on } from "solid-js";
import { createVirtualizer } from "@tanstack/solid-virtual";

function scrollEnd(ref?: HTMLElement, smooth?: boolean) {
  ref?.scroll({
    top: ref.scrollHeight,
    /**
     * @todo
     * make it smooth when autoscroll is turned BACK on.
     */
    behavior: smooth ? "smooth" : "instant",
  });
}

type AutoScrollPaneProps<DataType> = {
  shouldAutoScroll: Accessor<boolean>;
  dataStream: DataType[];
  fallback: JSXElement;
  displayOptions: Record<string, unknown>;
  displayComponent: (props: {
    event: DataType;
    [key: string]: unknown;
  }) => JSXElement;
};

export function AutoScrollPane<DataType>(props: AutoScrollPaneProps<DataType>) {
  let logPanel: HTMLDivElement | undefined;

  const virtualizer = createVirtualizer({
    count: props.dataStream.length,
    getScrollElement: () => logPanel ?? null,
    estimateSize: () => 30,
    overscan: 10,
  });

  function updateVirtualizer(newCount: number) {
    virtualizer.setOptions({
      ...virtualizer.options,
      count: newCount,
    });
    virtualizer.measure();
  }

  createEffect(
    on(
      () => props.dataStream,
      () => {
        updateVirtualizer(props.dataStream.length);
        if (props.shouldAutoScroll()) {
          scrollEnd(logPanel);
        }
      }
    )
  );

  return (
    <div
      ref={(e) => (logPanel = e)}
      class="overflow-auto h-[calc(100%-var(--toolbar-height))]  relative"
    >
      <Show when={props.dataStream.length === 0 || !props.dataStream}>
        {props.fallback}
      </Show>
      <ul class="" style={{ height: `${virtualizer.getTotalSize()}px` }}>
        <For each={virtualizer.getVirtualItems()}>
          {(virtualRow, index) => {
            return (
              <li
                data-id={virtualRow.index}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${
                    virtualRow.start - index() * virtualRow.size
                  }px)`,
                }}
              >
                <props.displayComponent
                  event={props.dataStream[virtualRow.index]}
                  {...props.displayOptions}
                />
              </li>
            );
          }}
        </For>
      </ul>
    </div>
  );
}

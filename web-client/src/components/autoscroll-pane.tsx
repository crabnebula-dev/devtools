import { Accessor, JSX, createEffect, on } from "solid-js";

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

type AutoScrollPaneProps = {
  dataStream: unknown;
  shouldAutoScroll: Accessor<boolean>;
  children: JSX.Element;
};

export function AutoscrollPane(props: AutoScrollPaneProps) {
  let logPannel: HTMLUListElement | undefined;

  createEffect(
    on(
      () => props.dataStream,
      () => {
        if (props.shouldAutoScroll()) {
          scrollEnd(logPannel);
        }
      }
    )
  );

  return (
    <ul
      ref={(e) => (logPannel = e)}
      class="m-5 px-5 border border-neutral-800 rounded-md max-h-80 overflow-y-auto"
    >
      {props.children}
    </ul>
  );
}

import type { ProcessedLogEvent } from "~/lib/console/process-log-event-for-view";
import {
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  Show,
  untrack,
} from "solid-js";
import { A } from "@solidjs/router";
import MigrateAlt from "~/components/icons/migrate--alt";
import { useConnection } from "~/context/connection-provider";
import { makeBreakable } from "~/lib/formatters";

export function Message(props: {
  processedEvent: ProcessedLogEvent;
  showLinks: boolean | undefined;
}) {
  const [ref, setRef] = createSignal<HTMLSpanElement>();
  const [overflows, setOverflows] = createSignal(false);
  const [collapse, setCollapse] = createSignal(true);
  const [pre, setPre] = createSignal(false);

  onMount(() => {
    const measure = () =>
      setOverflows(
        (ref()?.offsetHeight || 0) > (ref()?.parentElement?.offsetHeight || 0),
      );
    measure();
    window.addEventListener("resize", measure);
    onCleanup(() => {
      window.removeEventListener("resize", measure);
    });
  });

  const {
    connectionStore: { host, port },
  } = useConnection();

  const message = createMemo(() => props.processedEvent.message);

  return (
    <Show when={props.processedEvent.message.length}>
      <span class="group-hover:text-white text-slate-300 transition-colors relative">
        <Show when={props.showLinks && props.processedEvent.parent}>
          <A
            href={`/dash/${host}/${port}/calls?span=${props.processedEvent.parent}`}
            class="text-slate-400 group-hover:text-white absolute -left-6 top-1/2 -translate-y-1/2"
          >
            <span class="size-4 hover:scale-125 inline-block">
              <MigrateAlt />
            </span>
          </A>
        </Show>
        <span
          classList={{
            "group block max-h-[60px]": true,
            "overflow-hidden": collapse(),
          }}
        >
          <span
            classList={{
              [`block relative bg-black z-50
                before:shadow-[0_0_1rem_rgba(255,255,255,0.2)]
                before:absolute before:rounded-lg
                before:bg-black before:left-[-1rem]
                before:top-[-1rem] before:right-[-1rem]
                before:bottom-[-1rem] before:z-0 before:pointer-events-none`]:
                !collapse(),
              "whitespace-pre-wrap": pre(),
            }}
            title={overflows() && collapse() ? message() : undefined}
            ref={setRef}
          >
            <span
              classList={{
                "block max-h-[50vh] overflow-auto relative": !collapse(),
              }}
            >
              <Show when={message().length > 40} fallback={message()}>
                {makeBreakable(message())}
              </Show>
            </span>
            <Show when={overflows() || !collapse()}>
              <span class="hidden absolute bg-black/50 right-[-0.5rem] top-[-1rem] z-51 p-1 group-hover:flex flex-row">
                <button
                  onClick={() => navigator.clipboard.writeText(message())}
                  title="Copy full message to clipboard"
                >
                  <img
                    class="h-4 w-4"
                    src="/icons/copy.svg"
                    alt="Copy full message to clipboard"
                  />
                </button>
                <Show when={untrack(() => /\r|\n|\t|\s\s+/.test(message()))}>
                  <button
                    class="ml-1"
                    onClick={() => setPre(!pre())}
                    title={pre() ? "Hide indentation" : "Show indentation"}
                  >
                    <img
                      class="h-4 w-4"
                      src={
                        pre()
                          ? "/icons/text--align--justify.svg"
                          : "/icons/text--align--center.svg"
                      }
                      alt={pre() ? "Hide indentation" : "Show indentation"}
                    />
                  </button>
                </Show>
                <button
                  class="ml-1"
                  onClick={() => setCollapse(!collapse())}
                  title={collapse() ? "Row expand" : "Row collapse"}
                >
                  <img
                    class="h-4 w-4"
                    src={
                      collapse()
                        ? "/icons/row--expand.svg"
                        : "/icons/row--collapse.svg"
                    }
                    alt={collapse() ? "Row expand" : "Row collapse"}
                  />
                </button>
              </span>
            </Show>
          </span>
        </span>
      </span>
    </Show>
  );
}

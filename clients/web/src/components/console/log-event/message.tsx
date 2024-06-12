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
import { Tooltip } from "@kobalte/core";
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

  const indentationLabel = () =>
    pre() ? "Hide indentation" : "Show indentation";
  const collapseLabel = () => (collapse() ? "Row expand" : "Row collapse");

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
              [`block relative z-50
                before:shadow-[0_0_1rem_rgba(255,255,255,0.2)]
                before:border-gray-800 before:border-2
                before:absolute before:rounded-lg
                before:bg-gray-950/90 before:left-[-1rem]
                before:-top-4 before:right-[-1rem]
                before:bottom-[-1rem] before:z-0 before:pointer-events-none`]:
                !collapse(),
              "whitespace-pre-wrap": pre(),
            }}
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

            <span class="flex flex-row absolute bg-gray-950/50 border-box -right-2 -top-4 z-40 p-1 opacity-45 group-hover:opacity-100">
              <Tooltip.Root>
                <Tooltip.Trigger>
                  <button
                    onClick={() => navigator.clipboard.writeText(message())}
                    aria-label="Copy full message to clipboard"
                  >
                    <img
                      class="h-4 w-4"
                      src="/icons/copy.svg"
                      alt="Copy full message to clipboard"
                    />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Content class="z-50">
                  <div class="rounded p-2 border border-slate-500 bg-black shadow">
                    Copy full message to clipboard
                  </div>
                </Tooltip.Content>
              </Tooltip.Root>
              <Show when={untrack(() => /\r|\n|\t|\s\s+/.test(message()))}>
                <Tooltip.Root>
                  <Tooltip.Trigger>
                    <button
                      class="ml-1"
                      onClick={() => setPre(!pre())}
                      aria-label={indentationLabel()}
                    >
                      <img
                        class="h-4 w-4"
                        src={
                          pre()
                            ? "/icons/text--align--justify.svg"
                            : "/icons/text--align--center.svg"
                        }
                        alt={indentationLabel()}
                      />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Content class="z-50">
                    <div class="rounded p-2 border border-slate-500 bg-black shadow">
                      {indentationLabel()}
                    </div>
                  </Tooltip.Content>
                </Tooltip.Root>
              </Show>
              <Show when={overflows()}>
                <Tooltip.Root>
                  <Tooltip.Trigger>
                    <button
                      class="ml-1"
                      onClick={() => setCollapse(!collapse())}
                      aria-label={collapseLabel()}
                    >
                      <img
                        class="h-4 w-4"
                        src={
                          collapse()
                            ? "/icons/row--expand.svg"
                            : "/icons/row--collapse.svg"
                        }
                        alt={collapseLabel()}
                      />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Content class="z-50">
                    <div class="rounded p-2 border border-slate-500 bg-black shadow">
                      {collapseLabel()}
                    </div>
                  </Tooltip.Content>
                </Tooltip.Root>
              </Show>
            </span>
          </span>
        </span>
      </span>
    </Show>
  );
}

import { For, createSignal, Show } from "solid-js";
import { AutoscrollPane } from "~/components/autoscroll-pane";
import { FilterToggle } from "~/components/filter-toggle";
import { useMonitor } from "~/lib/connection/monitor";
import { Field } from "~/lib/proto/common";
import { Toolbar } from "~/components/toolbar";

function fieldValue(field: Field): string {
  switch (field.value.oneofKind) {
    case "debugVal":
      return field.value.debugVal;
    case "strVal":
      return field.value.strVal;
    case "u64Val":
      return field.value.u64Val.toString();
    case "i64Val":
      return field.value.i64Val.toString();
    case "boolVal":
      return field.value.boolVal.toString();
    case "doubleVal":
      return field.value.doubleVal.toString();
    default:
      return "";
  }
}

const serializer = (_: unknown, v: unknown) =>
  typeof v === "bigint" ? v.toString() : v;

export default function SpanWaterfall() {
  const { monitorData } = useMonitor();
  const [shouldAutoScroll, toggleAutoScroll] = createSignal<boolean>(true);

  const filteredSpans = () => {
    const spans = monitorData.spans.filter((s) => {
      const metadata = monitorData.metadata.get(s.metadataId);
      return (
        metadata && ["tauri", "wry"].some((t) => metadata.target.startsWith(t))
      );
    });

    return spans;
  };

  return (
    <div class="px-5 ">
      <Toolbar>
        <FilterToggle
          aria-label="auto scroll"
          defaultPressed
          changeHandler={() => toggleAutoScroll((prev) => !prev)}
        >
          Autoscroll
        </FilterToggle>
      </Toolbar>
      <AutoscrollPane
        dataStream={monitorData.spans[0]}
        shouldAutoScroll={shouldAutoScroll}
      >
        <For each={filteredSpans()}>
          {(span) => {
            const metadata = monitorData.metadata.get(span.metadataId);

            return (
              <li class="py-1 flex w-full">
                <pre class="border border-neutral-800 p-2 w-full overflow-x-auto">
                  <p>ID: {span.id.toString()}</p>
                  <p>
                    (Target, Name): ({metadata?.target} /// {metadata?.name})
                  </p>
                  <p>
                    Location: {metadata?.location?.file}@
                    {metadata?.location?.line}:{metadata?.location?.column}
                  </p>
                  <p>Created: {JSON.stringify(span.createdAt, serializer)}</p>
                  <p>Entered: {JSON.stringify(span.enteredAt, serializer)}</p>
                  <p>Exited: {JSON.stringify(span.exitedAt, serializer)}</p>
                  <Show when={span.fields.length > 0}>
                    <div>
                      <p>Fields</p>
                      <For each={span.fields}>
                        {(field) => {
                          return (
                            <p>
                              {field.name} = {fieldValue(field)}
                            </p>
                          );
                        }}
                      </For>
                    </div>
                  </Show>
                  <Show when={span.children.length > 0}>
                    <div>
                      <p>Children</p>
                      <For each={span.children}>
                        {(s) => {
                          return (
                            <div>
                              <p>Id: {s.id.toString()}</p>
                              <p>
                                Name:{" "}
                                {monitorData.metadata.get(s.metadataId)?.name}
                              </p>
                            </div>
                          );
                        }}
                      </For>
                    </div>
                  </Show>
                </pre>
              </li>
            );
          }}
        </For>
      </AutoscrollPane>
    </div>
  );
}

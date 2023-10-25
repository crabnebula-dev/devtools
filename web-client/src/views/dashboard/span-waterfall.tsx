import { For, createSignal, createEffect } from "solid-js";
import { AutoscrollPane } from "~/components/autoscroll-pane";
import { FilterToggle } from "~/components/filter-toggle";
import { Span, useMonitor } from "~/lib/connection/monitor";

export default function SpanWaterfall() {
  const { monitorData } = useMonitor();
  const [shouldAutoScroll, toggleAutoScroll] = createSignal<boolean>(true);

  const serializer = (_: unknown, v: unknown) => (typeof v === "bigint" ? v.toString() : v);

  const [filteredSpans, setFilteredSpans] = createSignal<Span[]>([]);
  createEffect(() => {
    const spans = monitorData.spans.filter(s => {
      const metadata = monitorData.metadata.get(s.metadataId);
      return metadata && ['tauri', 'wry'].some(t => metadata.target.startsWith(t));
    });
    setFilteredSpans(spans);
  });

  return (
    <>
      <FilterToggle
        aria-label="auto scroll"
        defaultPressed
        changeHandler={() => toggleAutoScroll((prev) => !prev)}
      >
        Autoscroll
      </FilterToggle>

      <AutoscrollPane
        dataStream={monitorData.spans[0]}
        shouldAutoScroll={shouldAutoScroll}
      >
        <For each={filteredSpans()}>
          {(span) => {
            const metadata = monitorData.metadata.get(span.metadataId);
            return (
              <li class="py-1 flex">
                <pre style={{"border":"2px solid grey", width: '100%'}}>
                  <p>ID: {span.id.toString()}</p>
                  <p>(Target, Name): ({metadata?.target} /// {metadata?.name})</p>
                  <p>Location: {metadata?.location?.file}@{metadata?.location?.line}:{metadata?.location?.column}</p>
                  <p>Created: {JSON.stringify(span.createdAt, serializer)}</p>
                  <p>Entered: {JSON.stringify(span.enteredAt, serializer)}</p>
                  <p>Exited: {JSON.stringify(span.exitedAt, serializer)}</p>
                  {span.fields.length && <div>
                    FIELDS
                    <For each={span.fields}>
                      {(field) => {
                        return (
                          <p>{field.name} = {field.value}</p>
                        )
                      }}
                    </For>
                  </div>}
                  {span.children.length && <div>
                    CHILDREN
                    <For each={span.children}>
                      {(s) => {
                        return (
                          <div>
                            <p>Id: {s.id.toString()}</p>
                            <p>Name: {monitorData.metadata.get(s.metadataId)?.name}</p>
                          </div>
                        )
                      }}
                    </For>
                  </div>}

                </pre>
              </li>
            );
          }}
        </For>
      </AutoscrollPane>
    </>
  );
}

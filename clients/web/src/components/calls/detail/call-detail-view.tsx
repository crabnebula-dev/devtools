import { For, JSXElement, Setter, Show } from "solid-js";
import { CallDetailTrace } from "./call-detail-trace";
import { CallDetailArgs } from "./call-detail-args";
import { A, useParams } from "@solidjs/router";
import clsx from "clsx";
import { TreeEntry } from "~/lib/span/get-span-children";
import { Metadata_Level } from "~/lib/proto/common";
import { FilterToggle } from "~/components/filter-toggle";

type Props = {
  name: string;
  minLevel: Metadata_Level;
  setMinLevel: Setter<Metadata_Level>;
  hasError: boolean | null;
  parentId?: bigint;
  rootSpanId?: bigint;
  spanChildren: TreeEntry[];
  valuesSectionTitle: string;
  values: (string | object)[];
  children: JSXElement;
};

export function CallDetailView(props: Props) {
  const { host, port } = useParams();
  const closedSpans = () =>
    props.spanChildren.filter((s) => s.span.closedAt > 0);

  const durations = () => {
    return {
      start: Math.min(...closedSpans().map((s) => s.span.createdAt)),
      end: Math.max(...closedSpans().map((s) => s.span.closedAt)),
      shortest: Math.min(...closedSpans().map((s) => s.span.duration)),
      longest: Math.max(...closedSpans().map((s) => s.span.duration)),
    };
  };

  return (
    <div class="h-full overflow-auto grid gap-4 content-start border-l border-gray-800 min-w-[420px]">
      <div class="pt-4 px-4">
        <Show when={props.rootSpanId}>
          <A href={`/dash/${host}/${port}/calls?span=${props.rootSpanId}`}>
            ↑ parent
          </A>
        </Show>
        <h2 class={clsx("text-2xl", props.hasError ? "text-red-400" : "")}>
          {props.name}
        </h2>
      </div>
      <div class="grid gap-2">
        <h2 class="text-xl p-4">{props.valuesSectionTitle}</h2>
        <table>
          <tbody>
            <CallDetailArgs args={props.values} />
          </tbody>
        </table>
      </div>
      {props.children}
      <div class="grid gap-2">
        <h2 class="text-xl p-4">Trace</h2>
        <div class="items-center flex justify-end h-toolbar p-2 gap-4">
          <FilterToggle
            defaultPressed={props.minLevel > Metadata_Level.DEBUG}
            aria-label="attributes"
            changeHandler={() =>
              props.setMinLevel((prev) =>
                prev == Metadata_Level.TRACE
                  ? Metadata_Level.DEBUG
                  : Metadata_Level.TRACE,
              )
            }
          >
            <span>Show trace level</span>
          </FilterToggle>
        </div>
        <table>
          <thead>
            <tr class="uppercase border-gray-800 border-b">
              <th>Name</th>
              <th>Waterfall</th>
            </tr>
          </thead>
          <tbody>
            <For each={props.spanChildren}>
              {({ depth, span }) => (
                <CallDetailTrace
                  depth={depth}
                  span={span}
                  durations={durations()}
                />
              )}
            </For>
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { For, JSXElement } from "solid-js";
import { Span } from "~/lib/connection/monitor";
import { CallDetailTrace } from "./call-detail-trace";
import { CallDetailArgs } from "./call-detail-args";
import { computeDurationsFromSpanArray } from "~/lib/calls/compute-durations-from-span-array";

type Props = {
  name: string;
  spanChildren: Span[];
  valuesSectionTitle: string;
  values: (string | object)[];
  children: JSXElement;
};

export function CallDetailView(props: Props) {
  const closedSpans = () => props.spanChildren.filter((s) => s.closedAt > 0);
  const durations = () => computeDurationsFromSpanArray(closedSpans());

  return (
    <div class="h-full overflow-auto grid gap-4 content-start border-l border-gray-800 min-w-[420px]">
      <div class="pt-4 px-4">
        <h2 class="text-2xl">{props.name}</h2>
      </div>
      <table>
        <tbody>
          <For each={props.spanChildren}>
            {(span) => <CallDetailTrace span={span} durations={durations()} />}
          </For>
        </tbody>
      </table>
      <div class="grid gap-2">
        <h2 class="text-xl p-4">{props.valuesSectionTitle}</h2>
        <table>
          <tbody>
            <CallDetailArgs args={props.values} />
          </tbody>
        </table>
      </div>
      {props.children}
    </div>
  );
}

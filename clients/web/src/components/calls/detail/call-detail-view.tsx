import { For, JSXElement, Show } from "solid-js";
import { Span } from "~/lib/connection/monitor";
import { CallDetailTrace } from "./call-detail-trace";
import { CallDetailArgs } from "./call-detail-args";
import { A, useParams } from "@solidjs/router";
import clsx from "clsx";

type Props = {
  name: string;
  hasError: boolean | null;
  parentId?: bigint;
  spanChildren: Span[];
  valuesSectionTitle: string;
  values: (string | object)[];
  children: JSXElement;
};

export function CallDetailView(props: Props) {
  const { host, port } = useParams();
  const closedSpans = () => props.spanChildren.filter((s) => s.closedAt > 0);

  const durations = () => {
    return {
      start: Math.min(...closedSpans().map((s) => s.createdAt)),
      end: Math.max(...closedSpans().map((s) => s.closedAt)),
      shortest: Math.min(...closedSpans().map((s) => s.duration)),
      longest: Math.max(...closedSpans().map((s) => s.duration)),
    };
  };

  return (
    <div class="h-full overflow-auto grid gap-4 content-start border-l border-gray-800 min-w-[420px]">
      <div class="pt-4 px-4">
        <Show when={props.parentId}>
          <A href={`/dash/${host}/${port}/calls?span=${props.parentId}`}>
            ↑ parent
          </A>
        </Show>
        <h2 class={clsx("text-2xl", props.hasError ? "text-red-400" : "")}>
          {props.name}
        </h2>
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

import { For, JSXElement, Show } from "solid-js";
import { UiSpan } from "~/lib/span/format-spans-for-ui";
import { SpanDetailTrace } from "./span-detail-trace";
import { SpanDetailArgs } from "./span-detail-args";
import { A, useParams } from "@solidjs/router";
import clsx from "clsx";

type Props = {
  name: string;
  hasError: boolean | null;
  parentId?: bigint;
  spanChildren: UiSpan[];
  valuesSectionTitle: string;
  values: (string | object)[];
  children: JSXElement;
};

export function SpanDetailView(props: Props) {
  const { host, port } = useParams();
  const closedSpans = () =>
    props.spanChildren.filter((s) => s.original.closedAt > 0);

  const durations = () => {
    return {
      start: Math.min(...closedSpans().map((s) => s.original.createdAt)),
      end: Math.max(...closedSpans().map((s) => s.original.closedAt)),
      shortest: Math.min(...closedSpans().map((s) => s.original.duration)),
      longest: Math.max(...closedSpans().map((s) => s.original.duration)),
    };
  };

  return (
    <div class="h-full overflow-auto grid gap-4 content-start border-l border-gray-800">
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
            {(span) => <SpanDetailTrace span={span} durations={durations()} />}
          </For>
        </tbody>
      </table>
      <div class="grid gap-2">
        <h2 class="text-xl p-4">{props.valuesSectionTitle}</h2>
        <table>
          <tbody>
            <SpanDetailArgs args={props.values} />
          </tbody>
        </table>
      </div>
      {props.children}
    </div>
  );
}

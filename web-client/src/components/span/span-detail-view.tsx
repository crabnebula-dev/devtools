import { For, children, JSXElement, Show } from "solid-js";
import { UiSpan } from "~/lib/span/format-spans-for-ui";
import { SpanDetailTrace } from "./span-detail-trace";
import { SpanDetailArgs } from "./span-detail-args";

type Props = {
  name: string;
  spanChildren: UiSpan[];
  valuesSectionTitle: string;
  values: (string | object)[];
  children: JSXElement;
};

export function SpanDetailView(props: Props) {
  const c = children(() => props.children);

  return (
    <div class="h-full overflow-auto grid gap-4 content-start border-l border-gray-800">
      <div class="pt-4 px-4">
        <h2 class="text-2xl">{props.name}</h2>
      </div>
      <table>
        <tbody>
          <For each={props.spanChildren}>
            {(span) => <SpanDetailTrace span={span} />}
          </For>
        </tbody>
      </table>
      <Show when={props.values.length > 0}>
        <div class="grid gap-2">
          <h2 class="text-xl p-4">{props.valuesSectionTitle}</h2>
          <table>
            <tbody>
              <SpanDetailArgs args={props.values} />
            </tbody>
          </table>
        </div>
      </Show>
      {c()}
    </div>
  );
}

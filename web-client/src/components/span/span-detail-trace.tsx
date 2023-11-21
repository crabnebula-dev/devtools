import { For } from "solid-js";
import { UiSpan } from "~/lib/span/format-spans-for-ui";

export function SpanDetailTrace(props: { span: UiSpan }) {
  return (
    <tr class="even:bg-nearly-invisible cursor-pointer hover:bg-[#ffffff05] even:hover:bg-[#ffffff10]">
      <td class="py-1 px-4">{props.span.name}</td>
      <td class="py-1 px-4 relative w-[60%]">
        <div class="relative w-[90%]">
          <div class="bg-gray-800 w-full absolute rounded-sm h-2" />
          <div class="relative h-2" style={props.span.waterfall}>
            {/* Slices is "time slices" as in multiple entry points to a given span */}
            <For each={props.span.slices}>
              {(slice) => (
                <div
                  class="absolute bg-teal-500 top-0 left-0 h-full"
                  style={slice}
                />
              )}
            </For>
          </div>
        </div>
      </td>
    </tr>
  );
}

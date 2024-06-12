import { Field as IField } from "~/lib/proto/common";
import { processFieldValue } from "~/lib/span/process-field-value";
import { shortenLogFilePath, makeBreakable } from "~/lib/formatters";
import { Tooltip } from "@kobalte/core";

export function Field(props: { field: IField }) {
  // HACK: overflow isn't handled nicely right now.
  const maxLen = 180;

  const fullStrVal = () => processFieldValue(props.field.value);
  const strVal = () => {
    const val = fullStrVal();
    if (/\/|\\/.test(val)) {
      return makeBreakable(shortenLogFilePath(val));
    }
    if (val.length > maxLen)
      return makeBreakable(val.substring(0, maxLen) + "…");
    return makeBreakable(val);
  };

  return (
    <span class="group-hover:text-slate-300 min-w-24 text-slate-500 transition-colors hackathon relative">
      <span class="fname">{props.field.name}</span>
      <span class="fequal"> = </span>
      <span
        class="fval group-hover:text-slate-100 text-slate-300 transition-colors"
        title={fullStrVal()}
      >
        {strVal()}
      </span>
      <span class="flex flex-row absolute bg-gray-950/50 -right-2 -top-4 z-40 p-1 opacity-45 group-hover:opacity-100">
        <Tooltip.Root>
          <Tooltip.Trigger>
            <button
              onClick={() => navigator.clipboard.writeText(fullStrVal())}
              aria-label="Copy data to clipboard"
            >
              <img
                class="h-4 w-4"
                src="/icons/copy.svg"
                alt="Copy data to clipboard"
              />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Content class="z-50">
            <div class="rounded p-2 border border-slate-500 bg-black shadow">
              Copy full message to clipboard
            </div>
          </Tooltip.Content>
        </Tooltip.Root>
      </span>
    </span>
  );
}

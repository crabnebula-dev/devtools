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
      <span class="hidden group-hover:flex flex-row absolute bg-gray-950/75 -right-6 -top-2 z-10 p-1">
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
          <Tooltip.Portal>
            <Tooltip.Content>
              <div class="rounded p-2 border border-slate-500 bg-black shadow z-50 pointer-events-none">
                Copy full message to clipboard
              </div>
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </span>
    </span>
  );
}

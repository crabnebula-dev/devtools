import { Field as IField } from "~/lib/proto/common";
import { processFieldValue } from "~/lib/span/process-field-value";
import { shortenLogFilePath, makeBreakable } from "~/lib/formatters";

export function Field(props: { field: IField }) {
  // HACK: overflow isn't handled nicely right now.
  const maxLen = 180;

  const fullStrVal = () => processFieldValue(props.field.value);
  const strVal = () => {
    const val = fullStrVal();
    if (/\/|\\/.test(val)) {
      return (
        <>
          {makeBreakable(shortenLogFilePath(val))}
          <button
            class="ml-2"
            onClick={() => navigator.clipboard.writeText(val)}
            title="copy full path to clipboard"
          >
            <img
              class="h-4 w-4"
              src="/icons/copy.svg"
              alt="copy full path to clipboard"
            />
          </button>
        </>
      );
    }
    if (val.length > maxLen)
      return makeBreakable(val.substring(0, maxLen) + "…");
    return makeBreakable(val);
  };

  return (
    <span class="group-hover:text-slate-300 text-slate-500 transition-colors hackathon">
      <span class="fname">{props.field.name}</span>
      <span class="fequal"> = </span>
      <span
        class="fval group-hover:text-slate-100 text-slate-300 transition-colors"
        title={fullStrVal()}
      >
        {strVal()}
      </span>
    </span>
  );
}

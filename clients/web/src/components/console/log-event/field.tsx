import { Field as IField } from "~/lib/proto/common";
import { processFieldValue } from "~/lib/span/process-field-value";

export function Field(props: { field: IField }) {
  // HACK: overflow isn't handled nicely right now.
  const maxLen = 180;

  const fullStrVal = () => processFieldValue(props.field.value);
  const strVal = () => {
    const val = fullStrVal();
    if (val.length > maxLen) return val.substring(0, maxLen) + "…";
    return val;
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

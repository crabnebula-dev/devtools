import { createSignal } from "solid-js";

type Props = {
  placeholder: string;
  name: string;
  defaultValue: string;
  label: string;
  title?: string;
  required?: boolean;
  type: "text" | "number";
  pattern?: string;
};

export const FormField = (props: Props) => {
  const [value, setValue] = createSignal(props.defaultValue);
  return (
    <div class="group">
      <label class=" grid  gap-2 group-focus-within:text-cyan-300 text-center">
        {props.label}
        <input
          name={props.name}
          title={props.title}
          required={props.required}
          type={props.type}
          pattern={props.pattern}
          placeholder={props.placeholder}
          class="text-2xl text-center bg-transparent border-b border-white p-2 focus:border-cyan-300 transition-colors outline-none text-white"
          value={value()}
          onInput={(e) => {
            setValue(e.currentTarget.value);
          }}
        />
      </label>
    </div>
  );
};

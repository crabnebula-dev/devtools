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
  // onInput: (
  //   e: InputEvent & {
  //     currentTarget: HTMLInputElement;
  //     target: HTMLInputElement;
  //   }
  // ) => void;
};

export const FormField = (props: Props) => {
  const [value, setValue] = createSignal(props.defaultValue);
  return (
    <label class="grid gap-2">
      {props.label}
      <input
        name={props.name}
        title={props.title}
        required={props.required}
        type={props.type}
        pattern={props.pattern}
        placeholder={props.placeholder}
        class="text-2xl bg-transparent border-b border-white focus:border-teal-500 p-2"
        value={value()}
        onInput={(e) => {
          setValue(e.currentTarget.value);
        }}
      />
    </label>
  );
};

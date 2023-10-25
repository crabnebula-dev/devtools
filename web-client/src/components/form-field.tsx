type Props = {
  placeholder: string;
  value: string;
  label: string;
  title?: string;
  required?: boolean;
  type: "text" | "number";
  pattern?: string;
  onInput: (
    e: InputEvent & {
      currentTarget: HTMLInputElement;
      target: HTMLInputElement;
    }
  ) => void;
};

export const FormField = (props: Props) => {
  return (
    <label class="grid gap-2">
      {props.label}
      <input
        title={props.title}
        required={props.required}
        type={props.type}
        pattern={props.pattern}
        value={props.value}
        placeholder={props.placeholder}
        onInput={props.onInput}
        class="text-2xl bg-transparent border-b border-white focus:border-teal-500 p-2"
      />
    </label>
  );
};

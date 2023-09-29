import { JSX, Show } from "solid-js";
import { ToggleButton } from "@kobalte/core";

type FilterToggleProps = {
  children: JSX.Element;
  defaultPressed?: boolean;
  changeHandler?: () => void;
  stylesOverride?: string;
  "aria-label": string;
};

export function FilterToggle(props: FilterToggleProps) {
  return (
    <ToggleButton.Root
      defaultPressed={props.defaultPressed}
      aria-label={props["aria-label"]}
      class={`px-2 py-1 ${props.stylesOverride}`}
      onChange={props.changeHandler}
    >
      {(state) => (
        <span class={`${state.pressed() ? "text-teal-500" : ""}`}>
          {props.children}
        </span>
      )}
    </ToggleButton.Root>
  );
}

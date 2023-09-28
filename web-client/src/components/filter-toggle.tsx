import { JSX, Show } from "solid-js";
import { ToggleButton } from "@kobalte/core";

type FilterToggleProps = {
  children: JSX.Element;
  fallbackElement: JSX.Element;
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
      class={`py-px px-2 border rounded-lg ${props.stylesOverride}`}
      onChange={props.changeHandler}
    >
      {(state) => (
        <Show when={state.pressed()} fallback={props.fallbackElement}>
          {props.children}
        </Show>
      )}
    </ToggleButton.Root>
  );
}

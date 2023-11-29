import { JSX } from "solid-js";

type Props = {
  children: JSX.Element;
};

export function Heading(props: Props) {
  return <h2 class="text-3xl font-bold">{props.children}</h2>;
}

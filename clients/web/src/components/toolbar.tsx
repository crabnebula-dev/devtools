import { JSXElement } from "solid-js";

type Props = {
  children: JSXElement;
};

export const Toolbar = (props: Props) => (
  <div class="sticky items-center h-toolbar text-sm text-gray-400 p-2 top-0 flex justify-end border-b gap-4 border-gray-800 z-10">
    {props.children}
  </div>
);

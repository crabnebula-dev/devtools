import { JSXElement } from "solid-js";

import * as styles from "~/css/styles";

type Props = {
  children: JSXElement;
};

export const Toolbar = (props: Props) => (
  <div
    class={
      "sticky items-center h-toolbar text-sm text-gray-400 p-2 top-0 flex justify-end border-b gap-4 border-gray-800 z-10" +
      styles.surface
    }
  >
    {props.children}
  </div>
);

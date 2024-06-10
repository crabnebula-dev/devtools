import { JSXElement, Show } from "solid-js";
import { Info } from "../icons/info";

// The Brave browser exports a navigator function to determine whether we are using it.
declare global {
  interface Navigator {
    brave?: {
      isBrave: () => Promise<boolean>;
    };
  }
}

export function BraveWarning() {
  const isBrave = !!navigator.brave?.isBrave();

  return (
    <Show when={isBrave}>
      <section class="text-base border border-neutral-800 rounded-lg p-3 shadow-lg shadow-navy-600 my-2 break-words">
        <p class="text-2xl text-slate-200">
          <Info /> Info
        </p>
        <h1 class="text-slate-200 text-xl pb-2 font-semibold">
          We noticed you are using the <Highlight>Brave browser</Highlight>
        </h1>
        <p class="pb-2">
          Users have reported that requests to{" "}
          <Highlight>localhost will be blocked</Highlight> by the{" "}
          <Highlight>Brave browser shield</Highlight> by default.
        </p>
        <p>
          We have a little section in our docs on how to add an exception to
          this rule for <Highlight>DevTools Web</Highlight>:{" "}
          <Highlight>
            <a
              class="underline"
              href="https://docs.crabnebula.dev/devtools/troubleshooting/web/brave-browser"
              target="_blank"
            >
              docs.crabnebula.dev/devtools/troubleshooting/web/brave-browser
            </a>
          </Highlight>
        </p>
      </section>
    </Show>
  );
}

function Highlight(props: { children: JSXElement }) {
  return <strong class="bg-slate-800 px-1 rounded-sm">{props.children}</strong>;
}

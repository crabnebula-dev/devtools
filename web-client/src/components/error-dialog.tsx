import { AlertDialog } from "@kobalte/core";
import { A } from "@solidjs/router";
import { JSXElement, Show, mergeProps } from "solid-js";

type Props = {
  title?: JSXElement;
  children: JSXElement;
};

export function ErrorDialog(p: Props) {
  const props = mergeProps({ title: "Alert" }, p);

  return (
    <AlertDialog.Root defaultOpen modal preventScroll>
      {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion*/}
      <AlertDialog.Portal mount={document.getElementById("app")!}>
        <AlertDialog.Overlay class="fixed h-screen w-screen grid place-items-center backdrop-blur-md z-50 top-0 left-0" />
        <div class="fixed inset-0 z-50 flex items-center justify-center text-xl">
          <AlertDialog.Content class="z-50 text-4xl max-w-prose md:max-w-96 border border-neutral-800 rounded-lg p-10 bg-navy-700 bg-opacity-80 shadow-lg shadow-navy-600 kb-expanded:animate-content-show kb-disabled:animate-content-hide">
            <div class="flex items-baseline justify-between mb-3">
              <Show when={props.title}>{props.title}</Show>
            </div>
            <AlertDialog.Description class="text-base text-neutral-300">
              {props.children}
            </AlertDialog.Description>
            <div class="pt-8 flex gap-10 justify-center">
              <AlertDialog.CloseButton
                class="border border-neutral-400 hover:bg-neutral-800 hover:border-neutral-100 text-white text-lg py-2 px-4 rounded focus:outline-dashed focus:outline-white focus:outline-offset-2"
                onClick={() => {
                  window.location.reload();
                }}
              >
                Reload route
              </AlertDialog.CloseButton>
              <AlertDialog.CloseButton class="border border-neutral-400 hover:bg-neutral-800 hover:border-neutral-100 text-white text-lg py-2 px-4 rounded focus:outline-dashed focus:outline-white focus:outline-offset-2">
                Dismiss
              </AlertDialog.CloseButton>
              <A
                href="/"
                class="bg-red-400 border border-red-400 hover:bg-red-700 hover:border-red-900 text-white text-lg py-2 px-4 rounded focus:outline-dashed focus:outline-white focus:outline-offset-2"
              >
                Reset App
              </A>
            </div>
          </AlertDialog.Content>
        </div>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

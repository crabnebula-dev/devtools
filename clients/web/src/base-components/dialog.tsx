import { AlertDialog } from "@kobalte/core";
import { JSXElement } from "solid-js";
import { mergeProps } from "solid-js";
import { Signal, createSignal, untrack } from "solid-js";

type Props = {
  children: JSXElement;
  title: JSXElement;
  buttons: JSXElement;
  defaultOpen?: boolean;
  open?: Signal<boolean>;
};

export function Dialog(p: Props) {
  const props = mergeProps({ defaultOpen: true }, p);

  const configuredOpen = untrack(() => props.open);
  const [open, setOpen] = configuredOpen
    ? configuredOpen
    : /*  Since the linter is not able to resolve the ternary properly we disable the linting rule */
      /*  eslint-disable-next-line solid/reactivity  */
      createSignal(props.defaultOpen);

  return (
    <AlertDialog.Root
      defaultOpen={props.defaultOpen}
      open={open()}
      onOpenChange={setOpen}
      modal
      preventScroll
    >
      <Content {...props}>{props.children}</Content>
    </AlertDialog.Root>
  );
}

function Content(props: Props) {
  return (
    <AlertDialog.Portal mount={document.getElementById("app") ?? undefined}>
      <AlertDialog.Overlay class="fixed h-screen w-screen grid place-items-center backdrop-blur-md z-50 top-0 left-0" />
      <div class="fixed inset-0 z-50 flex items-center justify-center text-xl">
        <AlertDialog.Content class="z-50 text-4xl max-w-prose md:max-w-96 border border-neutral-800 rounded-lg p-10 bg-navy-700 bg-opacity-80 shadow-lg shadow-navy-600 kb-expanded:animate-content-show kb-disabled:animate-content-hide">
          <div class="flex items-baseline justify-between mb-3">
            {props.title}
          </div>
          <AlertDialog.Description class="text-base text-neutral-300">
            {props.children}
          </AlertDialog.Description>
          <div class="pt-8 flex gap-10 justify-center">{props.buttons}</div>
        </AlertDialog.Content>
      </div>
    </AlertDialog.Portal>
  );
}

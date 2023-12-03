import { AlertDialog } from "@kobalte/core";
import { JSXElement } from "solid-js";
import { Slot, getSlots } from "./slot";
import { mergeProps } from "solid-js";
import { Signal, createSignal } from "solid-js";

export { Title, Buttons, Root };

type Props = {
  children: JSXElement;
  defaultOpen?: boolean;
  open?: Signal<boolean>;
};

function Title(props: Props) {
  return <Slot name="title">{props.children}</Slot>;
}

function Buttons(props: Props) {
  return <Slot name="buttons">{props.children}</Slot>;
}

function Content(props: Props) {
  const slots = getSlots(props.children);

  return (
    <AlertDialog.Portal mount={document.getElementById("app") ?? undefined}>
      <AlertDialog.Overlay class="fixed h-screen w-screen grid place-items-center backdrop-blur-md z-50 top-0 left-0" />
      <div class="fixed inset-0 z-50 flex items-center justify-center text-xl">
        <AlertDialog.Content class="z-50 text-4xl max-w-prose md:max-w-96 border border-neutral-800 rounded-lg p-10 bg-navy-700 bg-opacity-80 shadow-lg shadow-navy-600 kb-expanded:animate-content-show kb-disabled:animate-content-hide">
          <div class="flex items-baseline justify-between mb-3">
            {slots.title}
          </div>
          <AlertDialog.Description class="text-base text-neutral-300">
            {slots.default}
          </AlertDialog.Description>
          <div class="pt-8 flex gap-10 justify-center">{slots.buttons}</div>
        </AlertDialog.Content>
      </div>
    </AlertDialog.Portal>
  );
}

function Root(p: Props) {
  const props = mergeProps({ defaultOpen: true }, p);
  let [open, setOpen] = createSignal(props.defaultOpen);
  if (props.open) {
    [open, setOpen] = props.open;
  }

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

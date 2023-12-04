import { type JSXElement, mergeProps } from "solid-js";
import { Dialog } from "~/base-components/dialog";
import { AlertDialog } from "@kobalte/core";

type Props = {
  title?: string;
  children: JSXElement;
};

export function ErrorDialog(p: Props) {
  const props = mergeProps({ title: "Alert" }, p);
  return (
    <Dialog
      title={props.title}
      buttons={
        <>
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
          <a
            href="/"
            class="bg-red-400 border border-red-400 hover:bg-red-700 hover:border-red-900 text-white text-lg py-2 px-4 rounded focus:outline-dashed focus:outline-white focus:outline-offset-2"
          >
            Reset App
          </a>
        </>
      }
    >
      {props.children}
    </Dialog>
  );
}

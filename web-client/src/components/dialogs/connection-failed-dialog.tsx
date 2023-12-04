import { Dialog } from "~/base-components/dialog";
import { AlertDialog } from "@kobalte/core";
import { Signal } from "solid-js";

type Props = {
  host: string;
  port: string;
  open: Signal<boolean>;
  retry: (host: string, port: string) => void;
};

export function ConnectionFailedDialog(props: Props) {
  return (
    <Dialog
      defaultOpen={false}
      open={props.open}
      title="Connecting to the specified app failed"
      buttons={
        <>
          <AlertDialog.CloseButton
            class="border border-neutral-400 hover:bg-neutral-800 hover:border-neutral-100 text-white text-lg py-2 px-4 rounded focus:outline-dashed focus:outline-white focus:outline-offset-2"
            onClick={() => {
              props.retry(props.host, props.port);
            }}
          >
            Retry
          </AlertDialog.CloseButton>
          <AlertDialog.CloseButton class="border border-neutral-400 hover:bg-neutral-800 hover:border-neutral-100 text-white text-lg py-2 px-4 rounded focus:outline-dashed focus:outline-white focus:outline-offset-2">
            Dismiss
          </AlertDialog.CloseButton>
        </>
      }
    >
      <p class="text-xl">
        You tried to connect to{" "}
        <span class="text-red-400 ">
          https://{props.host}:{props.port}{" "}
        </span>
        but the connection could not be established.
      </p>
      <p class="text-xl">
        Are you sure your app is running and setup with the DevTools plugin?
      </p>
    </Dialog>
  );
}

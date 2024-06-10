import { Dialog } from "~/base-components/dialog";
import { AlertDialog } from "@kobalte/core";

export function SafariNotSupportedDialog() {
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  return (
    <Dialog
      title="Safari is not supported"
      buttons={
        <AlertDialog.CloseButton class="border border-neutral-400 hover:bg-neutral-800 hover:border-neutral-100 text-white text-lg py-2 px-4 rounded focus:outline-dashed focus:outline-white focus:outline-offset-2">
          Dismiss
        </AlertDialog.CloseButton>
      }
      defaultOpen={isSafari}
    >
      <p>
        DevTools Web currently does not support the use of Safari. Sadly Safari
        does not allow you to make requests to localhost. More information in
        our docs:{" "}
        <strong>
          <a
            class="break-words underline"
            href="https://docs.crabnebula.dev/devtools/troubleshooting/web/safari-not-supported/"
          >
            docs.crabnebula.dev/devtools/troubleshooting/web/safari-not-supported/
          </a>
        </strong>
      </p>
    </Dialog>
  );
}

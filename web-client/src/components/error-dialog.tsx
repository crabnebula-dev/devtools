import { AlertDialog, Collapsible } from "@kobalte/core";
import { A } from "@solidjs/router";
import { Dialog } from "~/components/dialog";

type Props = {
  error: unknown;
};

function ErrorTitle() {
  return (
    <AlertDialog.Title class="text-4xl font-semibold text-red-400 text-center w-full">
      Irrecoverable Error
    </AlertDialog.Title>
  );
}

export function ErrorDialog(props: Props) {
  return (
    <Dialog title={<ErrorTitle />}>
      <div class=" pt-8 text-center">
        <p>Something terrible happened.</p>
        <p>The log is on the way and we'll work on it!</p>
      </div>
      <div class="pt-8 flex gap-10 justify-center">
        <A
          href="/"
          class="bg-red-600 border border-red-400 hover:bg-red-700 hover:border-red-900 text-white text-lg py-2 px-4 rounded focus:outline-dashed focus:outline-white focus:outline-offset-2"
        >
          Reset App
        </A>
        <AlertDialog.CloseButton class="border border-neutral-400 hover:bg-neutral-800 hover:border-neutral-100 text-white text-lg py-2 px-4 rounded focus:outline-dashed focus:outline-white focus:outline-offset-2">
          Something else
        </AlertDialog.CloseButton>
      </div>
      <aside>
        <p class="pt-8 text-center">
          Feel free to reach us at the{" "}
          <a
            href="https://discord.gg/tauri"
            rel="noreferrer noopener"
            target="_blank"
            class="text-white focus:outline-none focus:underline focus:decoration-dotted focus:underline-offset-2"
          >
            Tauri Discord: #CrabNebula
          </a>
          .
        </p>
      </aside>
      <Collapsible.Root>
        <Collapsible.Trigger class="kb-expanded:text-pink-400 group">
          See the stack trace
          <Collapsible.Trigger class="kb-expanded:rotate-180 transition-transform">
            ↓
          </Collapsible.Trigger>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <pre>{props.error?.toString() || String(props.error)}</pre>
        </Collapsible.Content>
      </Collapsible.Root>
    </Dialog>
  );
}

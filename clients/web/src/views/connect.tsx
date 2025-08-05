import { Button } from "@kobalte/core";
import { useNavigate } from "@solidjs/router";
import { Logo } from "~/components/logo";
import { Logo as CrabNebula } from "~/components/crabnebula-logo";
import { FormField } from "~/components/form-field";
import { checkConnection } from "~/lib/connection/transport";
import { GithubIcon } from "~/components/icons/github";
import { ConnectionFailedDialog } from "~/components/dialogs/connection-failed-dialog";
import { createStore } from "solid-js/store";
import { createSignal, DEV, Show } from "solid-js";
import { SafariNotSupportedDialog } from "~/components/dialogs/safari-not-supported-dialog";
import { TosTimestamp } from "~/components/tos-timestamp";

export default function Connect() {
  const navigate = useNavigate();

  const [connectionStore, setConnectionStore] = createStore({
    host: "127.0.0.1",
    port: "3033",
  });

  const [connectionFailed, setConnectionFailed] = createSignal(false);

  const handleFormSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    if (!(e.currentTarget instanceof HTMLFormElement)) return;

    const data = Object.fromEntries(new FormData(e.currentTarget));

    tryToConnect(`${data.host}`, `${data.port}`);
  };

  const tryToConnect = async (host: string, port: string) => {
    const url = `http://${host}:${port}`;
    const ping = await checkConnection(url);

    if (ping.status === "error") {
      setConnectionFailed(true);
      setConnectionStore({
        host,
        port,
      });
      return;
    }
    navigate(`/dash/${host}/${port}/`);
  };

  return (
    <div class="w-full min-h-screen grid grid-rows-[auto_1fr_auto_1fr_auto] place-items-center">
      <nav class="max-w-screen-sm w-full py-12 flex justify-between">
        <a
          href="https://crabnebula.dev"
          target="_blank"
          rel="noopener"
          class="flex items-center gap-4 text-3xl font-bold hover:scale-110 transition-transform ease-in-out"
        >
          <CrabNebula size={32} /> <h2>CrabNebula</h2>
        </a>
        <a
          class="bg-transparent border-white text-white relative flex items-center gap-2 text-sm md:text-base border-2 rounded-full py-2 px-4 hover:scale-110 transition-transform ease-in-out"
          href="https://github.com/crabnebula-dev/devtools"
        >
          <GithubIcon />
          GitHub
        </a>
      </nav>
      <header class="grid place-items-center">
        <div>
          <h1 class="text-6xl font-sans font-bold pb-10">
            <Logo />
          </h1>
          <strong class="block font-semibold text-2xl text-center">
            Tauri App Development Demystified
          </strong>
        </div>
      </header>
      <aside class="max-w-screen-sm w-full flex flex-col gap-5 text-xl leading-tight text-center text-neutral-400">
        <p>
          Check our{" "}
          <a
            class="after:[content:'↗'] after:relative after:-top-2 after:text-xs text-white hover:text-cyan-300 focus:text-cyan-300 transition-colors"
            href="https://docs.crabnebula.dev/devtools/get-started/"
            rel="noopener"
            target="_blank"
          >
            <code class="font-mono ">docs</code>
          </a>{" "}
          for information on how to get started.
        </p>
      </aside>
      <form
        class="max-w-screen-sm w-full grid grid-cols-2 gap-8 p-12 border-navy-900 border-px backdrop-blur-md bg-navy-800 bg-opacity-30 rounded-md place-items-center"
        onSubmit={handleFormSubmit}
      >
        <FormField
          name="host"
          type="text"
          defaultValue="127.0.0.1"
          placeholder="127.0.0.1"
          pattern="^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$"
          label="Host"
          required
          title="Enter a valid IP address like 127.0.0.1."
        />
        <FormField
          name="port"
          type="text"
          placeholder="3033"
          defaultValue="3033"
          label="Port"
          required
        />
        <Button.Root
          type="submit"
          class="bg-white border-white text-gray-950 flex items-center gap-2 text-2xl border-2 rounded-md py-2 px-4 col-span-2 focus:outline-dashed focus:outline-white focus:outline-offset-2 hover:scale-110 transition-transform ease-in-out"
        >
          <span>Inspect</span>
        </Button.Root>
      </form>

      <footer class="pb-24 text-sm text-neutral-400 text-center">
        <p>
          Your data is yours. No private information collected from you or your
          app.
        </p>
        <div>
          Check CrabNebula's{" "}
          <a class="underline" href="https://crabnebula.dev/terms-of-service/">
            terms of service
          </a>
          ,{" "}
          <a class="underline" href="https://crabnebula.dev/privacy-policy/">
            privacy policy
          </a>
          , and{" "}
          <a class="underline" href="https://crabnebula.dev/cookie-policy/">
            cookie policy
          </a>
          .
          <TosTimestamp />
        </div>
      </footer>

      <div class="surf-container">
        <img class="bg-surface static" src="/bg.webp" aria-hidden />
      </div>

      <ConnectionFailedDialog
        open={[connectionFailed, setConnectionFailed]}
        host={connectionStore.host}
        port={connectionStore.port}
        retry={tryToConnect}
      />
      <Show when={!DEV}>
        <SafariNotSupportedDialog />
      </Show>
    </div>
  );
}

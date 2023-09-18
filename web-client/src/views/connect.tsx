import { createSignal } from "solid-js";
import { Button } from "@kobalte/core";
import { useNavigate } from "@solidjs/router";

export default function Connect() {
  const [host, setHost] = createSignal("127.0.0.1");
  const [port, setPort] = createSignal("58671");
  const navigate = useNavigate();

  return (
    <div class="w-full min-h-screen grid place-items-center">
      <form class="text-2xl flex flex-col gap-4 border-2 border-neutral-800 p-8 rounded-sm">
        <legend class="text-3xl text-neutral-600">Web Socket</legend>
        <fieldset>
          <legend class="sr-only">web socket URL host</legend>
          <label for="port" class="text-neutral-600">
            Host:{" "}
          </label>
          <input
            id="port"
            type="text"
            value={host()}
            onInput={(evt) => setHost(evt.currentTarget.value)}
            class="bg-transparent border-b-2 border-neutral-600 py-1"
          />
        </fieldset>
        <fieldset>
          <legend class="sr-only">web socket URL port</legend>
          <label for="port" class="text-neutral-600">
            Port:{" "}
          </label>
          <input
            id="port"
            type="text"
            value={port()}
            onInput={(evt) => setPort(evt.currentTarget.value)}
            class="bg-transparent border-b-2 border-neutral-600 py-1"
          />
        </fieldset>
        <Button.Root
          class="border-2 border-neutral-200 py-1 px-2 rounded-sm disabled:opacity-70"
          disabled={port() === null}
          onClick={() => {
            navigate(`/dash/${host()}/${port()}/tauri`);
          }}
        >
          Inspect:{" "}
          <code>
            ws://{host()}:{port()}
          </code>
        </Button.Root>
      </form>
    </div>
  );
}

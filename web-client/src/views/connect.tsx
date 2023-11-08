import { createSignal } from "solid-js";
import { Button } from "@kobalte/core";
import { useNavigate } from "@solidjs/router";
import { Logo } from "~/components/crabnebula-logo";
import { FormField } from "~/components/form-field";

export default function Connect() {
  const [host, setHost] = createSignal("127.0.0.1");
  const [port, setPort] = createSignal("3000");
  const navigate = useNavigate();

  return (
    <div class="w-full min-h-screen flex items-center justify-center">
      <div class="grid gap-16 max-w-screen-sm mx-auto">
        <div class="mx-auto text-3xl font-sans flex items-center gap-4 font-bold">
          <Logo size={32} /> <h1>CrabNebula</h1>
        </div>
        <h2 class="text-6xl font-sans font-bold mx-auto">Developer Tools</h2>
        <p class="text-xl">
          To get started, instrument your application and run it with the{" "}
          <code>--inspect</code> flag. Then, paste the appropriate connection
          values below.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate(`/dash/${host()}/${port()}/`);
          }}
          class="grid gap-8 border-neutral-800 p-4 rounded"
        >
          <fieldset>
            <legend class="sr-only">web socket URL host</legend>
            <FormField
              type="text"
              placeholder="127.0.0.1"
              value={host()}
              pattern="^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$"
              label="Host"
              required
              title="Enter a valid IP address like 127.0.0.1."
              onInput={(evt) => setHost(evt.currentTarget.value)}
            />
          </fieldset>
          <fieldset>
            <legend class="sr-only">web socket URL port</legend>
            <FormField
              type="number"
              placeholder="3000"
              value={port()}
              label="Port"
              required
              onInput={(evt) => setPort(evt.currentTarget.value)}
            />
          </fieldset>
          <Button.Root
            type="submit"
            class="p-2 disabled:opacity-25 disabled:cursor-not-allowed bg-white text-black text-xl font-bold rounded-sm"
            disabled={!port() || !host()}
          >
            Inspect
          </Button.Root>
        </form>

        <div class="surf-container">
          <img class="bg-surface static" src="/bg.jpeg" alt="" />
        </div>
      </div>
    </div>
  );
}

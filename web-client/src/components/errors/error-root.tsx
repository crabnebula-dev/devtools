import * as pkg from "~/../package.json";
import { Switch, Match } from "solid-js";
import { NotFoundError } from "./not-found-error";
import { GeneralError } from "./general-error";

type Props = {
  error: unknown;
};

export function ErrorRoot(props: Props) {
  const errorMessage = () => props.error?.toString() || String(props.error);
  return (
    <>
      <div class="surf-container">
        <img class="bg-surface static" src="/app/bg.jpeg" aria-hidden />
      </div>
      <div class="p-28 grid grid-rows-[auto_1fr_auto] gap-5 h-screen text-neutral-400 ">
        <header>
          <Switch fallback={<GeneralError />}>
            <Match when={errorMessage().includes("404")}>
              <NotFoundError />
            </Match>
          </Switch>
        </header>
        <article class="flex flex-col justify-evenly">
          <div class="p-5 border-2 border-slate-800 rounded-lg font-mono">
            <h2 class="text-4xl relative -top-12">System log</h2>
            <pre class="text-2xl">{errorMessage()}</pre>
            <ul class="pt-12">
              <li>App version: {pkg.version}</li>
              <li>Browser: {window.navigator.userAgent}</li>
            </ul>
          </div>
          <div class="flex gap-10">
            <a
              href="/"
              class="border border-red-400 hover:bg-red-700 hover:border-red-900 text-white text-lg py-2 px-4 rounded focus:outline-dashed focus:outline-white focus:outline-offset-2 focus:outline-1"
            >
              Reset App
            </a>
            <button
              onClick={() => {
                window.location.reload();
              }}
              class="border border-neutral-400 hover:bg-neutral-800 hover:border-neutral-100 text-white text-lg py-2 px-4 rounded focus:outline-dashed focus:outline-white focus:outline-offset-2"
            >
              Reload Route
            </button>
          </div>
        </article>
        <aside>
          <p class="text-3xl">
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
      </div>
    </>
  );
}

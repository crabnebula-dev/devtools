import { Warning } from "../icons/warning";

export function Troubleshooting() {
  return (
    <section class="text-base border border-neutral-800 rounded-lg p-3 shadow-lg shadow-navy-600 mt-8 break-words">
      <h1 class="text-2xl text-slate-200">
        <Warning /> Troubleshooting
      </h1>
      <p class="text-slate-200 text-base font-semibold">
        See our docs for help:{" "}
        <strong class="bg-slate-800 px-1 rounded-sm">
          <a
            class="underline"
            href="https://docs.crabnebula.dev/devtools/troubleshoot/broken-connection/"
            target="_blank"
          >
            docs.crabnebula.dev/devtools/troubleshoot/broken-connection/
          </a>
        </strong>
      </p>
    </section>
  );
}

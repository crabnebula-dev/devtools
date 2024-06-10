import { Show, Suspense } from "solid-js";

// The Brave browser exports a navigator function to determine whether we are using it.
declare global {
  interface Navigator {
    brave?: {
      isBrave: () => Promise<boolean>;
    };
  }
}

export function BraveWarning() {
  const isBrave = (navigator.brave && navigator.brave.isBrave()) || false;

  return (
    <Suspense>
      <Show when={isBrave}>
        <section class="text-3xl pt-8">
          <h1 class="text-orange-300 font-semibold text-4xl">
            Info: We noticed you are using the Brave browser.
          </h1>
          <p>
            Users have reported that requests to{" "}
            <strong>localhost will be blocked</strong> by the{" "}
            <strong>Brave browser shield</strong> by default.
          </p>
          <p>
            We have a little section in our docs on how to add an exception to
            this rule for <strong>devtools.crabnebula.dev</strong>:{" "}
            <a href="https://docs.crabnebula.dev/devtools/brave-browser">
              docs.crabnebula.dev/devtools/brave-browser
            </a>
          </p>
        </section>
      </Show>
    </Suspense>
  );
}

import { Button } from "@kobalte/core";
import { useNavigate } from "@solidjs/router";
import { useConnection } from "~/context/connection-provider";
import * as styels from "~/css/styles.ts";

export function DisconnectButton() {
  const { connectionStore } = useConnection();
  const goto = useNavigate();
  return (
    <Button.Root
      type="button"
      id="close"
      class={
        "px-2 transition-all inline-flex items-center justify-center text-slate-200" +
        styels.genericHover
      }
      onClick={() => {
        connectionStore.abortController.abort();
        goto("/");
      }}
    >
      <svg
        class="h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </Button.Root>
  );
}

import { Button } from "@kobalte/core";
import { useRouteData } from "@solidjs/router";
import { Connection, disconnect } from "~/lib/connection/transport";
export function DisconnectButton(){
    const { abortController } = useRouteData<Connection>();

    function disconnectSession() {
        disconnect(abortController);
    }

    return(
        <section>
            <Button.Root
            type="button"
            id="close"
            class="border-white border rounded-md p-1 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={disconnectSession}
            >
                <span class="sr-only">Close connection</span>
                <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </Button.Root>
        </section>
    );
}
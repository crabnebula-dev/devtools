import { Button } from "@kobalte/core";
import { Accessor } from "solid-js";

type Props = {
  socket: WebSocket;
  status: Accessor<string>;
};

export function ConnectionStatus(props: Props) {
  return (
    <div class="flex justify-between items-center w-full px-4">
      <div id="status" class="inline-block text-sm py-1 my-4">
        Status: <span class="text-emerald-500">{props.status()}</span>
      </div>
      <Button.Root
        type="button"
        id="close"
        class=" py-1 px-3 mx-1 text-sm border-2 font-bold border-red-500 hover:bg-red-500 hover:text-black focus:bg-red-500 focus:text-black"
        onClick={() => {
          props.socket.close();
        }}
      >
        Close Connection
      </Button.Root>
    </div>
  );
}

import { Accessor } from "solid-js";
import { StatusIndicator } from "./status-indicator";

type Props = {
  socket: WebSocket;
  status: Accessor<string>;
};

export function ConnectionStatus(_: Props) {
  return (
    <div id="status" class="flex items-center gap-2">
      <StatusIndicator status="on" />
      Connected
    </div>
  );
}

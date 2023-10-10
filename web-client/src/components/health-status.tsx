import { useState } from "~/lib/state";
import { Tooltip } from "@kobalte/core";
import { HealthCheckResponse_ServingStatus } from "~/lib/proto/health";

export function HealthStatus() {
  const { state } = useState();

  const variant = (status: HealthCheckResponse_ServingStatus) => {
    return [
      // unknown
      {
        style: "flex w-3 h-3 bg-gray-200 rounded-full",
        tooltip: "Instrumentation is not connected",
      },
      // serving
      {
        style: "flex w-3 h-3 bg-green-500 rounded-full",
        tooltip: "Instrumentation is operating normally",
      },
      // not serving
      {
        style: "flex w-3 h-3 bg-red-500 rounded-full",
        tooltip: "Instrumentation not operational",
      },
    ][status];
  };

  return (
    <section>
      <Tooltip.Root>
        <Tooltip.Trigger>
          <span class={variant(state.health).style} />
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            class={
              "bg-gray-900 text-sm font-medium text-white p-1 border-solid border border-gray-700"
            }
          >
            <Tooltip.Arrow />
            <p>{variant(state.health).tooltip}</p>
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </section>
  );
}

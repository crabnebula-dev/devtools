import { Show } from "solid-js";
import { Heading } from "../heading";
import { LogFilterObject } from "~/lib/console/filter-logs";
import { Button } from "@kobalte/core";

type Props = {
  filter: LogFilterObject;
  reset: () => void;
};

export function NoLogs(props: Props) {
  return (
    <div class="flex items-center h-full content-center justify-center">
      <div class="grid gap-4 text-center">
        <Heading>No Logs</Heading>
        <div>
          <span>
            We could not find any logs for your application.
            <br />
            Interacting with your application may help.
          </span>
        </div>
        <Show
          when={
            props.filter.textContent.length > 0 ||
            props.filter.levels.length < 5
          }
        >
          <div>
            You've also got some filters set.
            <br />
            Would you like to{" "}
            <Button.Root
              onClick={() => props.reset()}
              class="underline underline-offset-2"
            >
              reset them
            </Button.Root>
            ?
          </div>
        </Show>
      </div>
    </div>
  );
}

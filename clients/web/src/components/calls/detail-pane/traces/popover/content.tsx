import type { Span } from "~/lib/connection/monitor";
import { Popover } from "@kobalte/core";
import { processFieldValue } from "~/lib/span/process-field-value";
import { For } from "solid-js";
import { Content as ToolTipContent } from "./tool-tip/content";
import { Row } from "./tool-tip/row";

export function Content(props: { span: Span }) {
  const busy = (span: Span) =>
    span.enters.reduce((acc, enter, i) => {
      const exit = span.exits[i];

      //Don't count enters without exits
      if (!exit) return acc;
      const duration = exit.timestamp - enter.timestamp;
      return acc + duration;
    }, 0);

  return (
    <Popover.Content
      class="z-50 bg-gray-700 rounded-sm drop-shadow-2xl px-2 py-1 focus:outline-none"
      style={{ "max-width": "min(calc(100vw - 16px), 380px)" }}
    >
      <ToolTipContent>
        <Row title={props.span.name} />
        <Row title="target">{props.span.metadata?.target}</Row>
        <For each={props.span.fields}>
          {(field) => (
            <Row title={field.name}>{processFieldValue(field.value)}</Row>
          )}
        </For>
        <Row title="Busy">{(busy(props.span) / 1e6).toFixed(3)}ms</Row>
        <Row title="Idle">
          {(props.span.time - busy(props.span) / 1e6).toFixed(3)}ms
        </Row>
        <Row title="Total">{props.span.time.toFixed(3)}ms</Row>
      </ToolTipContent>
    </Popover.Content>
  );
}

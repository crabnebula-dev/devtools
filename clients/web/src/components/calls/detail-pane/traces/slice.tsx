import { Popover } from "@kobalte/core";
import { Row } from "./popover/tool-tip/row";
import { Content } from "./popover/tool-tip/content";
import { getDetailedTime } from "~/lib/formatters";

export function Slice(props: {
  slice: {
    entered: number;
    exited: number;
    threadID: number;
    width: number;
    marginLeft: number;
  };
}) {
  return (
    <Popover.Root>
      <Popover.Trigger
        class="absolute bg-teal-500 top-0 left-0 h-full hover:bg-teal-300"
        style={{
          width: `${props.slice.width}%`,
          "margin-left": `${props.slice.marginLeft}%`,
        }}
      />
      <Popover.Portal>
        <Popover.Content
          class="z-50 bg-gray-700 rounded-sm drop-shadow-2xl px-2 py-1 focus:outline-none"
          style={{
            "max-width": "min(calc(100vw - 16px), 380px)",
          }}
        >
          <Content>
            <Row title="Time">
              {((props.slice.exited - props.slice.entered) / 1e6).toFixed(3)}
              ms
            </Row>
            <Row title="Thread">{props.slice.threadID}</Row>
            <Row title="Start">
              {getDetailedTime(new Date(props.slice.entered / 1e6))}
            </Row>
            <Row title="End">
              {getDetailedTime(new Date(props.slice.exited / 1e6))}
            </Row>
          </Content>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

import { DropdownMenu } from "@kobalte/core";
import clsx from "clsx";
import { SetStoreFunction } from "solid-js/store";
import { LogFilterObject } from "~/lib/console/filter-logs";
import { getLevelClasses } from "~/lib/console/get-level-classes";
import { Metadata_Level } from "~/lib/proto/common";

type Props = {
  filter: LogFilterObject;
  setFilter: SetStoreFunction<LogFilterObject>;
};

export function LogLevelFilter(props: Props) {
  const toggleLogLevel = (level: Metadata_Level) => {
    if (props.filter.levels.includes(level)) {
      props.setFilter(
        "levels",
        props.filter.levels.filter((l) => l !== level)
      );
    } else {
      props.setFilter("levels", (levels) => [...levels, level]);
    }
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger class="flex items-center gap-1">
        {props.filter.levels.length === 5 ? "All" : "Custom"} Levels
        <DropdownMenu.Icon class="text-[8px]" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content class="bg-black rounded overflow-hidden shadow">
        <DropdownMenu.CheckboxItem
          closeOnSelect
          checked={props.filter.levels.length === 5}
          onChange={() =>
            props.setFilter({ ...props.filter, levels: [0, 1, 2, 3, 4] })
          }
          class="p-1 cursor-pointer justify-between flex items-center gap-2 hover:bg-gray-900"
        >
          All Events <DropdownMenu.ItemIndicator>✓</DropdownMenu.ItemIndicator>
        </DropdownMenu.CheckboxItem>
        <DropdownMenu.CheckboxItem
          closeOnSelect
          onChange={() => toggleLogLevel(3)}
          class="p-1 cursor-pointer justify-between flex items-center gap-2 hover:bg-gray-900"
          checked={props.filter.levels.includes(3)}
        >
          Debug Events{" "}
          <DropdownMenu.ItemIndicator>✓</DropdownMenu.ItemIndicator>
        </DropdownMenu.CheckboxItem>
        <DropdownMenu.CheckboxItem
          closeOnSelect
          onChange={() => toggleLogLevel(4)}
          class="p-1 cursor-pointer justify-between flex items-center gap-2 hover:bg-gray-900"
          checked={props.filter.levels.includes(4)}
        >
          General Events{" "}
          <DropdownMenu.ItemIndicator>✓</DropdownMenu.ItemIndicator>
        </DropdownMenu.CheckboxItem>
        <DropdownMenu.CheckboxItem
          closeOnSelect
          onChange={() => toggleLogLevel(2)}
          class={clsx(
            "p-1 cursor-pointer justify-between flex items-center gap-2 hover:bg-gray-900",
            getLevelClasses(2)
          )}
          checked={props.filter.levels.includes(2)}
        >
          Info Events <DropdownMenu.ItemIndicator>✓</DropdownMenu.ItemIndicator>
        </DropdownMenu.CheckboxItem>
        <DropdownMenu.CheckboxItem
          closeOnSelect
          onChange={() => toggleLogLevel(1)}
          class={clsx(
            "p-1 cursor-pointer justify-between flex items-center gap-2 hover:bg-gray-900",
            getLevelClasses(1)
          )}
          checked={props.filter.levels.includes(1)}
        >
          Warn Events <DropdownMenu.ItemIndicator>✓</DropdownMenu.ItemIndicator>
        </DropdownMenu.CheckboxItem>
        <DropdownMenu.CheckboxItem
          closeOnSelect
          onChange={() => toggleLogLevel(0)}
          class={clsx(
            "p-1 cursor-pointer justify-between flex items-center gap-2 hover:bg-gray-900",
            getLevelClasses(0)
          )}
          checked={props.filter.levels.includes(0)}
        >
          Error Events{" "}
          <DropdownMenu.ItemIndicator>✓</DropdownMenu.ItemIndicator>
        </DropdownMenu.CheckboxItem>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

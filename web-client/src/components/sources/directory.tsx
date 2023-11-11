import { createSignal, For, JSX, Suspense } from "solid-js";
import { Entry } from "~/lib/proto/sources.ts";
import { A, useRouteData } from "@solidjs/router";
import { Connection } from "~/lib/connection/transport.ts";
import { Collapsible } from "@kobalte/core";
import CaretDown from "~/components/icons/caret-down.tsx";
import CaretRight from "~/components/icons/caret-right.tsx";
import IDEicon from "~/components/icons/ide-icons";
import {
  awaitEntries,
  isDirectory,
  sortByPath,
  isAssetOrResource,
} from "~/lib/sources/util.ts";

interface DirectoryProps extends JSX.HTMLAttributes<HTMLDivElement> {
  entry: Entry;
}

export default function Directory(props: DirectoryProps) {
  const { client } = useRouteData<Connection>();
  const [entries] = awaitEntries(client.sources, props.entry.path);
  const sortedEntries = () => entries()?.sort(sortByPath);

  return (
    <Suspense fallback={<span class={"pl-2"}>Loading...</span>}>
      <ol class={props.class}>
        <For each={sortedEntries()} fallback={<li>Empty</li>}>
          {(child) => {
            const absolutePath = [props.entry.path, child.path]
              .filter((e) => !!e)
              .join("/");
            const [isOpen, setIsOpen] = createSignal(false);

            if (isDirectory(child)) {
              return (
                <Collapsible.Root
                  as={"li"}
                  onOpenChange={(isOpen) => setIsOpen(isOpen)}
                >
                  <Collapsible.Trigger class={"w-full"}>
                    <TreeEntry
                      caret={() => (isOpen() ? <CaretDown /> : <CaretRight />)}
                      icon={<IDEicon path={child.path} />}
                      isAssetOrResource={isAssetOrResource(child)}
                    >
                      {child.path}
                    </TreeEntry>
                  </Collapsible.Trigger>
                  <Collapsible.Content class={"tree_view__content"}>
                    <div class={"pl-4"}>
                      <Directory entry={{ ...child, path: absolutePath }} />
                    </div>
                  </Collapsible.Content>
                </Collapsible.Root>
              );
            } else {
              return (
                <TreeEntry
                  icon={<IDEicon path={child.path} />}
                  isAssetOrResource={isAssetOrResource(child)}
                >
                  <A href={`${absolutePath}?sizeHint=${child.size}`}>
                    {child.path}
                  </A>
                </TreeEntry>
              );
            }
          }}
        </For>
      </ol>
    </Suspense>
  );
}

interface TreeEntryProps
  extends Omit<JSX.HTMLAttributes<HTMLLIElement>, "class"> {
  caret?: () => JSX.Element;
  icon: JSX.Element;
  isAssetOrResource: boolean;
}

function TreeEntry(props: TreeEntryProps) {
  const { caret, icon, children, ...rest } = props;

  return (
    <li
      {...rest}
      class={`grid gap-1.5 hover:bg-gray-800 items-center text-left`}
      style={{
        "grid-template-columns": "1em 1em 1fr",
        "background-color": props.isAssetOrResource
          ? "rgba(255,165,0, 0.35)"
          : "",
      }}
    >
      {caret ? caret() : <span />}
      {icon}
      {children}
      {props.isAssetOrResource}
    </li>
  );
}
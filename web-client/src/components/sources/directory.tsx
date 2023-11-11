import { createSignal, For, JSX, JSXElement, Show, Suspense } from "solid-js";
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
import { Loader } from "~/components/loader";

interface DirectoryProps extends JSX.HTMLAttributes<HTMLDivElement> {
  entry: Entry;
}

export function Directory(props: DirectoryProps) {
  const { client } = useRouteData<Connection>();
  const [entries] = awaitEntries(client.sources, props.entry.path);
  const sortedEntries = () => entries()?.sort(sortByPath);

  return (
    <Suspense fallback={<Loader />}>
      <ul class={props.class}>
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
                  <Collapsible.Trigger class="w-full">
                    <TreeEntry
                      caret={isOpen() ? <CaretDown /> : <CaretRight />}
                      icon={<IDEicon path={child.path} />}
                      isAssetOrResource={isAssetOrResource(child)}
                    >
                      {child.path}
                    </TreeEntry>
                  </Collapsible.Trigger>
                  <Collapsible.Content>
                    <div class="pl-4">
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
                  <A
                    class="block w-full"
                    activeClass="bg-neutral-400 text-pink-900"
                    href={`${absolutePath.replaceAll(".", "-")}?sizeHint=${
                      child.size
                    }`}
                  >
                    {child.path}
                  </A>
                </TreeEntry>
              );
            }
          }}
        </For>
      </ul>
    </Suspense>
  );
}

type TreeEntryProps = {
  caret?: JSXElement;
  icon: JSX.Element;
  isAssetOrResource: boolean;
  children: JSXElement;
};

function TreeEntry(props: TreeEntryProps) {
  return (
    <li
      class={`grid gap-1.5 text-lg hover:bg-gray-800 focus:bg-gray-800 text-left ${
        props.caret ? "grid-cols-[1em_1em_1fr]" : "grid-cols-[1em_1fr]"
      }`}
    >
      <Show when={Boolean(props.caret)}>{props.caret}</Show>
      {props.icon}
      {props.children}
    </li>
  );
}

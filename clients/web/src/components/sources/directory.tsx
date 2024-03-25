import {
  createEffect,
  createSignal,
  For,
  mergeProps,
  Show,
  Suspense,
  untrack,
} from "solid-js";
import { Entry } from "~/lib/proto/sources.ts";
import { A } from "@solidjs/router";
import { Collapsible } from "@kobalte/core";
import CaretDown from "~/components/icons/caret-down.tsx";
import CaretRight from "~/components/icons/caret-right.tsx";
import { FileIcon, FolderIcon } from "~/components/icons/ide-icons";
import {
  awaitEntries,
  isDirectory,
  sortByPath,
  isAssetOrResource,
  encodeFileName,
} from "~/lib/sources/file-entries";
import { Loader } from "~/components/loader";
import { useMonitor } from "~/context/monitor-provider";
import * as styles from "~/css/styles.ts";

type DirectoryProps = {
  parent?: Entry["path"];
  defaultPath: Entry["path"];
  defaultSize: Entry["size"];
  defaultFileType: Entry["fileType"];
  class?: string;
};

export function Directory(props: DirectoryProps) {
  const { monitorData } = useMonitor();
  const path = untrack(() =>
    props.parent ? `${props.parent}/${props.defaultPath}` : props.defaultPath,
  );
  const [entries, { refetch }] = awaitEntries(path);
  createEffect((prevHealth) => {
    const currentHealth = monitorData.health;
    if (prevHealth === 0 && currentHealth === 1) {
      refetch();
    }
    return currentHealth;
  });
  const sortedEntries = () => entries()?.sort(sortByPath);

  return (
    <Suspense fallback={<Loader />}>
      <ul class={props.class + styles.hierarchy}>
        <For each={sortedEntries()} fallback={<li>Empty</li>}>
          {(child) => {
            const absolutePath = [path, child.path]
              .filter((e) => !!e)
              .join("/");
            const [isOpen, setIsOpen] = createSignal(false);

            if (isDirectory(child)) {
              const defaultProps = {
                path,
                size: props.defaultSize,
                fileType: props.defaultFileType,
              };
              const childProps = mergeProps(defaultProps, child);

              return (
                <Collapsible.Root
                  as="li"
                  onOpenChange={(isOpen) => setIsOpen(isOpen)}
                >
                  <Collapsible.Trigger class={`w-full`}>
                    <TreeEntry
                      caret={isOpen() ? <CaretDown /> : <CaretRight />}
                      icon={<FolderIcon path={child.path} />}
                      isAssetOrResource={isAssetOrResource(child)}
                    >
                      {child.path}
                    </TreeEntry>
                  </Collapsible.Trigger>
                  <Collapsible.Content>
                    <div class={styles.hierarchySubDir}>
                      <Directory
                        parent={path}
                        defaultPath={childProps.path}
                        defaultSize={childProps.size}
                        defaultFileType={childProps.fileType}
                      />
                    </div>
                  </Collapsible.Content>
                </Collapsible.Root>
              );
            } else {
              return (
                <A
                  draggable={false}
                  href={`${encodeFileName(absolutePath)}?sizeHint=${
                    child.size
                  }`}
                  activeClass={styles.hierarchyActive}
                >
                  <TreeEntry
                    icon={<FileIcon path={child.path} />}
                    isAssetOrResource={isAssetOrResource(child)}
                  >
                    {child.path}
                  </TreeEntry>
                </A>
              );
            }
          }}
        </For>
      </ul>
    </Suspense>
  );
}

function TreeEntry(props: TreeEntryProps) {
  return (
    <>
      <li class={styles.hierarchyItem}>
        <div class={styles.hierarchyItemCaret}>
          <Show when={Boolean(props.caret)}>{props.caret}</Show>
        </div>
        <div class={styles.hierarchyIcon}>{props.icon}</div>
        {props.children}
      </li>
    </>
  );
}

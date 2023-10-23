import {createSignal, For, JSX, Suspense} from "solid-js";
import {Entry} from "~/lib/proto/workspace.ts";
import {A, useRouteData} from "@solidjs/router";
import {Connection} from "~/lib/connection/transport.ts";
import {Collapsible} from "@kobalte/core";
import CaretDown from "~/components/icons/caret-down.tsx";
import CaretRight from "~/components/icons/caret-right.tsx";
import FolderIcon from "~/components/icons/folder.tsx";
import FileIcon from "~/components/icons/file.tsx";
import {awaitEntries, isDirectory, sortByPath} from "~/lib/sources/util.ts";

interface DirectoryProps extends JSX.HTMLAttributes<HTMLDivElement> {
    entry: Entry
}

export default function Directory(props: DirectoryProps) {
    const { client } = useRouteData<Connection>();
    const [entries] = awaitEntries(client.workspace, props.entry.path);
    const sortedEntries = () => entries()?.sort(sortByPath);

    return <Suspense fallback={<span class={"pl-2"}>Loading...</span>}>
        <ol class={props.class}>
            <For each={sortedEntries()} fallback={<li>Empty</li>}>
                {(child) => {
                    const absolutePath = [props.entry.path, child.path].filter(e => !!e).join("/")
                    const [isOpen, setIsOpen] = createSignal(false);

                    if (isDirectory(child)) {
                        return <Collapsible.Root as={'li'} onOpenChange={(isOpen) => setIsOpen(isOpen)}>
                            <Collapsible.Trigger class={'w-full'}>
                                <TreeEntry caret={() => isOpen() ? <CaretDown /> : <CaretRight/>} icon={<FolderIcon />}>
                                    {child.path}
                                </TreeEntry>
                            </Collapsible.Trigger>
                            <Collapsible.Content class={'tree_view__content'}>
                                <div class={"pl-4"}>
                                    <Directory entry={{...child, path: absolutePath}} />
                                </div>
                            </Collapsible.Content>
                        </Collapsible.Root>
                    } else {
                        return <TreeEntry icon={<FileIcon />}>
                            <A href={`${absolutePath}?sizeHint=${child.size}`}>
                                {child.path}
                            </A>
                        </TreeEntry>
                    }
                }}
            </For>
        </ol>
    </Suspense>
}

interface TreeEntryProps extends Omit<JSX.HTMLAttributes<HTMLLIElement>, 'class'> {
    caret?: () => JSX.Element,
    icon: JSX.Element
}

function TreeEntry(props: TreeEntryProps) {
    const { caret, icon, children, ...rest } = props;

    return <li {...rest} class={`grid gap-1.5 hover:bg-gray-800 justify-items-start text-left`} style={{'grid-template-columns': '1em 1em 1fr'}}>
        {caret ? caret() : <span></span>}
        {icon}
        {children}
    </li>
}
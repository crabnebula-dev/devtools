import {Collapsible} from "@kobalte/core"
import {WorkspaceClient} from "~/lib/proto/workspace.client.ts";
import {createMemo, createResource, For, Match, Show, Suspense, Switch} from "solid-js";
import {Entry} from "~/lib/proto/workspace.ts";
import {A, useParams, useRouteData, useSearchParams} from "@solidjs/router";
import {Connection} from "~/lib/connection/transport.ts";
import {setCDN, getHighlighter, setWasm, BUNDLED_LANGUAGES} from 'shiki'

const FileType = {
    DIR: 1 << 0,
    FILE: 1 << 1,
    SYMLINK: 1 << 2,
    ASSET: 1 << 3,
    RESOURCE: 1 << 4
}

function awaitEntries(client: WorkspaceClient, path: string) {
    return createResource(client, async (client) => {
        const entries = []
        try {
            const call = client.listEntries({path});

            for await (const entry of call.responses) {
                entries.push(entry);
            }

            return entries;
        } catch (e) {
            throw new Error(`Failed to list entries for path ${path}`)
        }
    })
}

function isDirectory(entry: Entry): boolean {
    return !!(entry.fileType & FileType.DIR);
}

function File(props: { entry: Entry, absolutePath: string }) {
    return <li>
        <A href={`${props.absolutePath}?sizeHint=${props.entry.size}`}>
            {props.entry.path}
        </A>
    </li>
}

function Directory(entry: Entry) {
    const { client } = useRouteData<Connection>();
    const [entries] = awaitEntries(client.workspace, entry.path);

    return <li>
        <Suspense fallback={<span>Loading...</span>}>
        <ol>
            <For each={entries()} fallback={<li>Empty</li>}>
                {(child) => {
                    const absolutePath = [entry.path, child.path].filter(e => !!e).join("/")

                    if (isDirectory(child)) {
                        return <Collapsible.Root>
                             <Collapsible.Trigger>
                                 <span class={"bg-green-500"}>{child.path}</span>
                             </Collapsible.Trigger>
                             <Collapsible.Content>
                                 <div class={"pl-4"}>
                                    <Directory {...child} path={absolutePath} />
                                 </div>
                             </Collapsible.Content>
                         </Collapsible.Root>
                    } else {
                        return <File entry={child} absolutePath={absolutePath} />
                    }
                }}
            </For>
        </ol>
        </Suspense>
    </li>
}

export default function AssetViewer() {
    const root: Entry = { path: "", size: 0n, fileType: FileType.DIR };
    const params = useParams();

    const [searchParams] = useSearchParams();


    const contentType = () => guessContentType(params.path);
    const sizeHint = () => parseInt(searchParams.sizeHint);

    return <div class={"grid"} style={"grid-template-columns: 12vw 1fr; grid-template-rows: 1fr; height: 85vh; overflow-y: hidden;"}>
        <Directory {...root} />
        <Show when={params.path && searchParams.sizeHint}>
            <div style={{ 'overflow-y': 'scroll' }}>
                <Suspense fallback={<span>Loading...</span>}>
                    <Switch fallback={<span>Not Found</span>}>
                        <Match when={contentType()?.startsWith('code/')}>
                            <CodeView path={params.path} size={sizeHint()} lang={contentType()!.replace("code/", '')}/>
                        </Match>
                        <Match when={contentType()?.startsWith('image/')}>
                            <ImageView path={params.path} size={sizeHint()} type={contentType()!.replace("image/", '')} />
                        </Match>
                    </Switch>
                </Suspense>
            </div>
        </Show>
    </div>
}

function guessContentType(path: string): string | undefined {
    const ext = path.slice(path.lastIndexOf(".") + 1);

    return {
        rs: "code/rust",
        toml: "code/toml",
        lock: "code/toml",
        js: "code/javascript",
        ts: "code/typescript",
        json: "code/json",
        html: "code/html",
        css: "code/css",
        md: "code/markdown",

        jpeg: "image/jpeg",
        jpg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        svg: "image/svg+xml",
        avif: "image/avif",
        webp: "image/webp",

        mp4: "video/mp4",
        webm: "video/webm"
    }[ext]
}

// Initializing a TextDecoder is expensive plus they can be reused,
// so we create a global instance
const TEXT_DECODER = new TextDecoder();

function createHighlighter() {
    return createResource(async () => {
        const responseWasm = await fetch("/shiki/dist/onig.wasm");
        setWasm(responseWasm);
        setCDN("/shiki/");

        return getHighlighter({ theme: "material-ocean", langs: ["js", "rust", "toml", "html", "json", "md"], paths: { wasm: 'dist/' } })
    })
}

function CodeView(props: { path: string, size: number, lang: string }) {
    const {client} = useRouteData<Connection>();
    const [bytes] = createResource(
        () => [client.workspace, props.path, props.size] as const,
        ([client, path, size]) => getEntryBytes(client, path, size));

    const text = () => TEXT_DECODER.decode(bytes());

    const [highlighter] = createHighlighter();

    const html = () => highlighter()?.codeToHtml(text(), { lang: props.lang })

    return <Suspense fallback={<span>Loading...</span>}>
        <div>RenderCodeFile {props.path} {props.size} {props.lang}</div>
        <div innerHTML={html()}></div>
    </Suspense>
}

function ImageView(props: { path: string, size: number, type: string }) {
    const {client} = useRouteData<Connection>();
    const [bytes] = createResource(
        () => [client.workspace, props.path, props.size] as const,
        ([client, path, size]) => getEntryBytes(client, path, size));

    const url = () => URL.createObjectURL(new Blob([bytes()], { type: props.type }));

    return <Suspense fallback={<span>Loading...</span>}>
        <div>RenderImageView {props.path} {props.size} {props.type}</div>
        <img class={"w-full h-full"} src={url()}/>
    </Suspense>
}

async function getEntryBytes(client: WorkspaceClient, path: string, size: number) {
    const call = client.getEntryBytes({ path });

    // we pre-allocate a uint8array with the correct size to avoid reallocation
    const out = new Uint8Array(size);

    let offset = 0
    for await (const chunk of call.responses) {
        out.set(chunk.bytes, offset);
        offset += chunk.bytes.length;
    }

    return out
}
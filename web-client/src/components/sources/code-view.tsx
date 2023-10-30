// Initializing a TextDecoder is expensive plus they can be reused,
// so we create a global instance
import {useRouteData} from "@solidjs/router";
import {createResource, Suspense} from "solid-js";
import {getEntryBytes} from "~/lib/sources/util.ts";
import {getHighlighter, setCDN, setWasm} from "shiki";
import {Connection} from "~/lib/connection/transport.ts";

const TEXT_DECODER = new TextDecoder();

function createHighlighter() {
    return createResource(async () => {
        const responseWasm = await fetch("/shiki/onig.wasm");
        setWasm(responseWasm);
        setCDN("/shiki/");

        return getHighlighter({ theme: "material-ocean", langs: ["js", "rust", "toml", "html", "json", "md", "yaml"], paths: { wasm: 'dist/' } })
    })
}

export default function CodeView(props: { path: string, size: number, lang: string }) {
    const {client} = useRouteData<Connection>();
    const [bytes] = createResource(
        () => [client.sources, props.path, props.size] as const,
        ([client, path, size]) => getEntryBytes(client, path, size));

    const text = () => TEXT_DECODER.decode(bytes());

    const [highlighter] = createHighlighter();

    const html = () => highlighter()?.codeToHtml(text(), { lang: props.lang })

    return <div class={'min-h-full h-[max-content] min-w-full w-[max-content]'} style={{'background-color': 'rgb(7 7 7)'}}>
        <Suspense fallback={<span>Loading...</span>}>
            <div innerHTML={html()} />
        </Suspense>
    </div>
}
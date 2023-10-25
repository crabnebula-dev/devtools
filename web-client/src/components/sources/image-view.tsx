import {useRouteData} from "@solidjs/router";
import {Connection} from "~/lib/connection/transport.ts";
import {createResource, Suspense} from "solid-js";
import {getEntryBytes} from "~/lib/sources/util.ts";

export function ImageView(props: { path: string, size: number, type: string }) {
    const {client} = useRouteData<Connection>();
    const [bytes] = createResource(
        () => [client.workspace, props.path, props.size] as const,
        ([client, path, size]) => getEntryBytes(client, path, size));

    const url = () => URL.createObjectURL(new Blob([bytes()!], { type: props.type }));

    return <Suspense fallback={<span>Loading...</span>}>
        <img class={"max-w-full max-h-full"} style={'margin: auto;'} src={url()}/>
    </Suspense>
}
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
        <div>RenderImageView {props.path} {props.size} {props.type}</div>
        <img class={"w-full h-full"} src={url()}/>
    </Suspense>
}
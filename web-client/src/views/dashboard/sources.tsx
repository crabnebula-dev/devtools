import {Match, Show, Suspense, Switch} from "solid-js";
import {Entry} from "~/lib/proto/sources.ts";
import {useParams, useSearchParams} from "@solidjs/router";
import {FileType, guessContentType} from "~/lib/sources/util.ts";
import Directory from "~/components/sources/directory.tsx";
import {UnknownView} from "~/components/sources/unknown-view.tsx";
import CodeView from "~/components/sources/code-view.tsx";
import {ImageView} from "~/components/sources/image-view.tsx";

export default function Sources() {
    const root: Entry = { path: "", size: 0n, fileType: FileType.DIR };
    const params = useParams();

    const [searchParams] = useSearchParams();

    const contentType = () => guessContentType(params.path);
    const sizeHint = () => parseInt(searchParams.sizeHint);

    return <div class={"grid h-full w-full"} style={{"grid-template-columns": "minmax(5vw, max-content) 1fr", "grid-template-rows": "1fr", "overflow-y": "hidden"}}>
        <div style={{ 'overflow-y': 'auto', 'resize': 'horizontal' }}>
            <Directory entry={root} />
        </div>
        <Show when={params.path && searchParams.sizeHint}>
            <div style={{ 'overflow': 'auto' }}>
                <Suspense fallback={<span>Loading...</span>}>
                    <Switch fallback={<UnknownView path={params.path}/>}>
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

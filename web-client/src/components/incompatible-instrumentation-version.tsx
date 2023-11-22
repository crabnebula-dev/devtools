import {createResource, Show, Suspense} from "solid-js";
import {createHighlighter, getHighlightedCode} from "~/lib/code-highlight.ts";
import {Highlighter} from "shiki";
import {getInstrumentationMetadata} from "~/lib/connection/getters.ts";
import {useConnection} from "~/context/connection-provider.tsx";
import {Loader} from "~/components/loader.tsx";
import {ErrorDialog} from "~/components/error-dialog.tsx";

export default function IncompatibleInstrumentationVersion() {
    const {connectionStore} = useConnection();
    const [instrumentationMetadata] = getInstrumentationMetadata(connectionStore.client.meta);

    // The used highlighter does not change at all atm so it does not need to be coupled
    const [highlighter] = createResource(() => createHighlighter());

    const html = (text: string | undefined, highlighter: Highlighter | undefined, highlightedLine?: number) => {
        if (!text || !highlighter) return undefined;
        return getHighlightedCode([text, highlighter, 'toml', highlightedLine])
    };

    const expectedVersion = window.INSTRUMENTATION_VERSION;

    console.log(expectedVersion)

    const codeSnippet = `[dependencies]
# ...
tauri-devtools = "${expectedVersion}"
# ...
`

    return <Suspense fallback={<Loader/>}>
        <Show when={instrumentationMetadata()?.version === expectedVersion}>
            <ErrorDialog title="Incompatible Instrumentation Version" dismissible={false}>
                <p>You are using an outdated version of the <code>tauri-devtools</code> Rust instrumentation.</p>
                <p>Please update the crate to continue.</p>
                <p class="text-xl py-4">How to update:</p>
                <p>
                    Modify your <code>Cargo.toml</code> file, so that the <code>tauri-devtools</code> version
                    reads <strong class="text-green-300"><code>{expectedVersion}</code></strong>.
                </p>
                <div
                    innerHTML={html(codeSnippet, highlighter(), 3)}
                />
                <p>After you have updated the version, restart your Tauri app and then click "Reset App" below.</p>
                <p class="pt-1">
                    If this error persists, feel free to reach out on the{" "}
                    <a
                        href="https://discord.gg/tauri"
                        rel="noreferrer noopener"
                        target="_blank"
                        class="text-white focus:outline-none focus:underline focus:decoration-dotted focus:underline-offset-2"
                    >
                        Tauri Discord: #CrabNebula
                    </a>
                    .
                </p>
            </ErrorDialog>
        </Show>
    </Suspense>
}
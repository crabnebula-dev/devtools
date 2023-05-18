<script lang="ts">
    import { listen } from "@tauri-apps/api/event";
    import { invoke } from "@tauri-apps/api/tauri";
    import { onMount, onDestroy } from "svelte";
    import LiveSessionPreview from "./LiveSessionPreview.svelte";

    interface SessionInfo {
        grpc_port: number;
        hostname: string;
        os: string;
        arch: string;
    }

    let active_sessions: SessionInfo[] = [];

    async function updateSessions() {
        console.log("update sessions");

        const sessions = await invoke<SessionInfo[]>(
            "plugin:zeroconf|network_sessions"
        );
        console.log(sessions);

        active_sessions = sessions;
    }

    let unlisten1: () => void, unlisten2: () => void;
    onMount(async () => {
        invoke('plugin:zeroconf|start_browse')
        updateSessions();

        unlisten1 = await listen("devtools://network-session-found", () => {
            updateSessions();
        });

        unlisten2 = await listen("devtools://network-session-removed", () => {
            updateSessions();
        });
    });

    onDestroy(() => {
        unlisten1();
        unlisten2();
    });
</script>

<ul>
    <!-- {@debug active_sessions} -->
    {#each active_sessions as session}
        <LiveSessionPreview {...session} />
    {:else}
        no live sessions
    {/each}
</ul>

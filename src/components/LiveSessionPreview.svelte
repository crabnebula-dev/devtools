<script lang="ts">
    export let hostname: string;
    export let grpc_port: number;
    export let addresses: string[];
    export let os: string;
    export let arch: string;
    export let name: string;
    export let version: string;
    export let authors: string;
    export let description: string;
</script>

<a href="/console?addresses={addresses}&port={grpc_port}"
    class="grid grid-cols-[repeat(4,minmax(30px,max-content))] transition-all gap-x-2 grid-rows-2 border border-slate-300 p-2 rounded-md hover:bg-slate-100 active:bg-slate-200 active:border-slate-400">
    <span class="sk-spinner sk-spinner-pulse row-span-2 my-auto" />
    <span class="col-span-3">{name} v{version}</span>
    <span class="text-slate-500">{os}</span>
    <span class="text-slate-500">{arch}</span>
    <span class="text-slate-500">{hostname}</span>
</a>

<style lang="scss">
    $spinkit-size: 1.75em;
    $spinkit-spinner-color: #1cc043;

    .sk-spinner-pulse {
        width: $spinkit-size;
        height: $spinkit-size;
        margin: auto;
        background-color: $spinkit-spinner-color;
        border-radius: 100%;
        animation: sk-spinner-pulse 1s infinite ease-in-out;
    }

    @keyframes sk-spinner-pulse {
        0% {
            transform: scale(0);
        }
        100% {
            transform: scale(1);
            opacity: 0;
        }
    }
</style>

<script lang="ts">
    import { invoke } from "@tauri-apps/api";
    import { listen } from "@tauri-apps/api/event";
    import VirtualList from './VirtualList.svelte';

    interface Timestamp {
        secs_since_epoch: number;
        nanos_since_epoch: number;
    }

    interface Field {
        name: number,
        value: FieldValue
    }

    interface FieldValue {
        Debug: number | null;
        Str: number | null;
        U64: number | null;
        I64: number | null;
        Bool: boolean | null;
    }

    interface LogRecord {
        at: Timestamp;
        message: FieldValue;
        metadata_id: number;
        fields: Field[]
    }

    interface Metadata {
        id: number;
        level: string;
        file: number;
        module_path: number;
        line: number;
        column: number;
        target: number;
        field_name: number[];
    }

    interface RenderRecords {
        at: Date;
        message: string | undefined;
        level: string;
        file: string;
        line: number;
    }

    let records: RenderRecords[] = [
//        {at: new Date(), message: 'trace', level: 'Trace', file: 'test', line: 0 },
//        {at: new Date(), message: 'debug', level: 'Debug', file: 'test', line: 0 },
//        {at: new Date(), message: 'info', level: 'Info', file: 'test', line: 0 },
//        {at: new Date(), message: 'warn', level: 'Warn', file: 'test', line: 0 },
//        {at: new Date(), message: 'error', level: 'Error', file: 'test', line: 0 }
    ];

    const strings = new Map();
    listen<[number, string]>("intern-str", (event) => {
        strings.set(event.payload[0], event.payload[1]);
    });
    invoke<Record<number, string>>("plugin:instrument|get_string_map").then(
        (new_strings) => {
            console.log(new_strings);

            for (const idx in Object.keys(new_strings)) {
                strings.set(parseInt(idx), new_strings[idx]);
            }
        }
    );

    let search = new URLSearchParams(location.search);

    invoke("plugin:instrument|connect", {
        addrs: search.get("addresses"),
        port: parseInt(search.get("port")!),
    });

    function liftFieldValue(value: FieldValue): string | number | boolean | null {
        if (value.Debug) {
            return strings.get(value.Debug);
        }
        if (value.Str) {
            return strings.get(value.Str);
        }
        if (value.U64) {
            return value.U64
        }
        if (value.I64) {
            return value.I64
        }
        if (value.Bool) {
            return value.Bool
        }
        return null;
    }

    listen<[LogRecord, Metadata]>("log_event", (ev) => {
        console.log(ev);
        
        const payload = ev.payload;

        const at = new Date(payload[0].at.secs_since_epoch * 1000);

        const fields: Record<string, FieldValue> = Object.fromEntries(payload[0].fields.map(field => [strings.get(field.name), liftFieldValue(field.value)]))

        let file = strings.get(payload[1].file) || fields['log.file'] as unknown as string
        let line = payload[1].line || fields['log.line'] as unknown as number

        records = [
            ...records,
            {
                at,
                message: liftFieldValue(payload[0].message)?.toString(),
                level: payload[1].level,
                file,
                line
            },
        ];

        // end = records.length
    });

    let start = 0, end = 0
</script>

<output>
    <VirtualList itemHeight={25} items={records} autoscroll let:item bind:start bind:end>
        <!-- this will be rendered for each currently visible item -->
        {#if item.level == "Trace" || item.level == "Debug" || item.level == "Info"}
                <li class="border-b border-gray-200">
                    <span class="">{item.message}</span>
                    <span class="float-right">{item.file}:{item.line}</span>
                </li>
            {:else if item.level == "Warn"}
                <li class="bg-yellow-200 border-b border-yellow-400">
                    <span class="text-orange-800">{item.message}</span
                    >
                    <span class="float-right">{item.file}:{item.line}</span>
                </li>
            {:else}
                <li class="bg-red-200 border-b border-red-400">
                    <span class="text-red-600">{item.message}</span
                    >
                    <span class="float-right">{item.file}:{item.line}</span>
                </li>
            {/if}
      </VirtualList>
      <p>showing {start}-{end} of {records.length} rows</p>
</output>

<style>
    output {
        overflow: none;
        position: relative;
        width: 100%;
        height: 800px;
    }

    output ol {
        overflow-y: auto;
        position: absolute;
        bottom: 0;
        max-height: 800px;
    }
</style>
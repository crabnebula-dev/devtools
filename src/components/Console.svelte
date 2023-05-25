<script lang="ts">
    import { invoke } from "@tauri-apps/api";
    import { listen } from "@tauri-apps/api/event";

    interface Timestamp {
        secs_since_epoch: number;
        nanos_since_epoch: number;
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
        message: string | null;
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

    function messageToString(value: FieldValue): string | null {
        if (value.Debug) {
            return strings.get(value.Debug);
        }
        if (value.Str) {
            return strings.get(value.Str);
        }
        if (value.U64) {
            return value.U64.toString();
        }
        if (value.I64) {
            return value.I64.toString();
        }
        if (value.Bool) {
            return value.Bool.toString();
        }
        return null;
    }

    listen<[LogRecord, Metadata]>("log_event", (ev) => {
        console.log(ev);

        const payload = ev.payload;

        const at = new Date(payload[0].at.secs_since_epoch * 1000);

        records = [
            ...records,
            {
                at,
                message: messageToString(payload[0].message),
                level: payload[1].level,
                file: strings.get(payload[1].file),
                line: payload[1].line,
            },
        ];
    });
</script>

<output>
    <ol>
        {#each records as record}
            {#if record.level == "Trace" || record.level == "Debug" || record.level == "Info"}
                <li class="border-b border-gray-200">
                    <span class="">{record.message}</span
                    >
                    <span class="float-right">{record.file}:{record.line}</span>
                </li>
            {:else if record.level == "Warn"}
                <li class="bg-yellow-200 border-b border-yellow-400">
                    <span class="text-orange-800">{record.message}</span
                    >
                    <span class="float-right">{record.file}:{record.line}</span>
                </li>
            {:else}
                <li class="bg-red-200 border-b border-red-400">
                    <span class="text-red-600">{record.message}</span
                    >
                    <span class="float-right">{record.file}:{record.line}</span>
                </li>
            {/if}
        {/each}
    </ol>
</output>

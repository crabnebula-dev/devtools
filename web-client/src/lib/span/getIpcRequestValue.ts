import { Span } from "../connection/monitor";
import { Field, Metadata } from "../proto/common";
import { recursivelyFindSpanByName as recursivelyFindSpansByName } from "./recursivelyFindSpanByName";

type SpanName =
    /* tracks the whole duration of a req. fields: id = invoke ID and kind = "postmessage" */
    | "ipc::request"
    /*  = the time it takes to deserialize the arguments. fields: id = invoke ID and args = string repo of the unparsed data */
    | "ipc::request::deserialize_arg"
    /*  this gets emitted when we have found the right handler and are processing the request. fields: id= Invoke ID, cmd = the command name, kind the kind of command, loc.line the source code line of the handler, loc.col the source code column of the handler, is_internal = whether the command is internal to tauri or user defined */
    | "ipc::request::handler"
    /*  this tracks the duration of the user written code that handles the request */
    | "ipc::request::run"
    /*  tracks how much time it took to respond to the request (from the rust side) */
    | "ipc::request::respond"
    /*  shows the actual response */
    | "ipc::request::response"

type Options = {
    metadata: Map<bigint, Metadata>
    rootSpan: Span,
}

export function getIpcRequestValues({ metadata, rootSpan }: Options) {
    return function (name: SpanName) {
        const spans = recursivelyFindSpansByName(
            { span: rootSpan, metadata },
            name
        );

        if (!spans) {
            return null;
        }

        const result = {
            spans,
            fields: spans.map(span => (span?.fields?.reduce((acc, field) => ({ ...acc, [field.name]: field.value }), {}) ?? {}) as Record<string, Field['value']>),
            metadata: spans.map(span => metadata.get(span?.metadataId ?? BigInt(0)))
        }

        return result;
    }
};
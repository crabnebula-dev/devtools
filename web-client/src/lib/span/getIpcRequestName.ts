import { Metadata } from "../proto/common";
import { processFieldValue } from "./processFieldValue";
import { findSpansByName } from "./findSpansByName";
import { SpanWithChildren } from "./types";

type Options = {
  metadata: Map<bigint, Metadata>;
  span: SpanWithChildren;
};

const ipcSpanNameMap: Record<string, string> = {
  "ipc::request": "Request",
  "ipc::request::run": "Command Run",
  "ipc::request::respond": "Response",
  "wry::eval": "Eval Response",
};

export function getIpcRequestName({ metadata, span }: Options) {
  const meta = metadata.get(span.metadataId);
  if (meta?.name === "wry::ipc::handle") {
    const commandHandlerSpan =
      findSpansByName({ span, metadata }, "ipc::request::handle")?.[0] ?? null;
    if (commandHandlerSpan) {
      const val = commandHandlerSpan.fields.find(
        (f) => f.name === "cmd"
      )?.value;
      // this is actually always strVal unless the Tauri tracing implementation messes it up
      return val?.oneofKind === "strVal" ? val.strVal : null;
    }
  } else if (meta?.name === "ipc::request::deserialize_arg") {
    const argField = span.fields.find((f) => f.name === "arg");
    if (argField) {
      return `Deserialize "${processFieldValue(argField.value)}"`;
    }
  }
  const name = meta?.name;
  return name ? ipcSpanNameMap[name] ?? name : null;
}

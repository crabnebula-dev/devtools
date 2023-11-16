import { Span } from "../connection/monitor";
import { Metadata } from "../proto/common";
import { processFieldValue } from "./processFieldValue";
import { recursivelyFindSpanByName } from "./recursivelyFindSpanByName";

type Options = {
  metadata: Map<bigint, Metadata>;
  span: Span;
};

export function getIpcRequestName({ metadata, span }: Options) {
  const meta = metadata.get(span.metadataId);
  if (meta?.name === "wry::ipc::handle") {
    const commandHandlerSpan =
      recursivelyFindSpanByName(
        { span, metadata },
        "ipc::request::handle"
      )?.[0] ?? null;
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
      return `deserialize arg ${processFieldValue(argField.value)}`
    }
  }
  return meta?.name ?? null;
}

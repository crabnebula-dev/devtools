import { processFieldValue } from "./process-field-value";
import { getIpcRequestValues } from "./get-ipc-request-value";
import type { Span } from "../connection/monitor";
import { getSpanChildren } from "./get-span-children";

const ipcSpanNameMap: Record<string, string> = {
  "ipc::request": "Request",
  "ipc::request::run": "Command Run",
  "ipc::request::respond": "Response",
  "wry::eval": "Eval Response",
};

export function getIpcRequestName(span: Span) {
  const meta = span.metadata;
  if (
    ["wry::custom_protocol::handle", "wry::ipc::handle"].includes(
      meta?.name ?? "",
    )
  ) {
    const commandHandlerSpan =
      getSpanChildren(span, "ipc::request::handle")?.[0] ?? null;
    if (commandHandlerSpan) {
      const val = commandHandlerSpan.fields.find(
        (f) => f.name === "cmd",
      )?.value;
      // this is actually always strVal unless the Tauri tracing implementation messes it up
      const commandName = val?.oneofKind === "strVal" ? val.strVal : null;

      if (commandName === "tauri") {
        const args =
          getIpcRequestValues(span)("ipc::request")?.fields.map((f) =>
            processFieldValue(f.request),
          ) ?? [];
        try {
          const arg = args.length > 0 ? JSON.parse(args[0]) : {};
          const cmd =
            arg.__tauriModule === "Window" && arg.message.cmd === "manage"
              ? arg.message.data.cmd.type
              : arg.message.cmd;
          return `${arg.__tauriModule}.${cmd}`;
        } catch (e) {
          /* intentionally ignore */
        }
      }

      return commandName;
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

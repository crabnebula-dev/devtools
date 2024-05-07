import type { Span, IpcData } from "~/lib/connection/monitor";
import { findNamedSpan } from "~/lib/span/find-named-span";
import { processFieldValue } from "~/lib/span/process-field-value";
import { getIpcResponse } from "./get-ipc-response";
import { detectIpcKind } from "./detect-ipc-kind";

// TODO: Revisit this function to see if we can improve on the logic and the eslint disable comments.
export function detectIpcTrace(root: Span): IpcData | undefined {
  // First we'd like to be sure the root has a specific name.
  if (!detectIpcKind(root)) return;

  // Then we try to parse a child span with request data.
  const requestSpan = findNamedSpan(root, "tauri::", "ipc::request");
  const requestField = requestSpan?.fields.find((f) => f.name === "request");
  const requestHandleSpan = findNamedSpan(
    root,
    "tauri::",
    "ipc::request::handle",
  );
  const cmdField = requestHandleSpan?.fields.find((f) => f.name === "cmd");
  if (!requestField) return;
  const request = JSON.parse(processFieldValue(requestField.value)) as unknown;
  if (!request || typeof request !== "object") return;

  // eslint-disable-next-line prefer-const
  let { cmd, ...requestRemainder } = request as Record<
    string,
    string | undefined
  >;

  // Intentionally filtering variables we don't want in `inputs`
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { callback, error, __tauriModule, ...inputs } = requestRemainder;

  cmd = cmd ?? (cmdField ? processFieldValue(cmdField.value) : undefined);

  // cmd is required.
  if (!cmd) return;

  // Ignore this particular kind of command as being "internal".
  // TODO: Why though? I just copied this behavior.
  if (cmd === "plugin:__TAURI_CHANNEL__|fetch") return;

  // Parse plugin commands for nicer display.
  let pluginName, pluginCmd;
  if (cmd.startsWith("plugin:")) {
    // Note: this colon split will always have a 2nd part, because we checked it exists with startsWith.
    const parts = cmd.split(":")[1].split("|");
    pluginName = parts[0];
    pluginCmd = parts[1];
  }

  // Doesn't this beautiful code remind you of es5?
  let tauriModule, tauriCmd, tauriInputs;
  if (cmd === "tauri" && inputs.message && typeof inputs.message === "object") {
    /*
      Example IPC request, wraps another "message".
      {
        "cmd":"tauri",
        "callback":3826522349,
        "error":1782778738,
        "__tauriModule":"Event",
        "message":{"cmd":"listen","event":"tauri://update-available","windowLabel":null,"handler":3485047437}
      }
    */

    const {
      cmd: messageCmd,
      // Intentionally filtering variables we don't want in `inputs`
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      handler: messageHandler,
      ...messageInputs
    } = inputs.message as Record<string, string | undefined>;

    tauriModule = __tauriModule;
    tauriCmd = messageCmd;
    tauriInputs = messageInputs;
  }

  // Note: allow this to be null, so that commands that are still running are detected as IPC calls.
  const response = getIpcResponse(root);

  const responseKind = !response
    ? undefined
    : response.startsWith("Ok(")
      ? "Ok"
      : response.startsWith("Err(")
        ? "Err"
        : undefined;

  return {
    cmd,
    inputs,
    response,
    responseKind,
    tauriCmd,
    tauriModule,
    tauriInputs,
    pluginName,
    pluginCmd,
  };
}

import { EventData, IpcData, Span } from "../connection/monitor";
import { processFieldValue } from "./process-field-value";
import { findNamedSpan } from "./find-named-span";
import { detectEventKind } from "./update/type/event/detect-event-kind";

export function mutateWhenKnownKind(root: Span): boolean {
  try {
    return mutateWhenEventTrace(root) || mutateWhenIpcTrace(root);
  } catch (e) {
    console.error("An error happened interpreting traces", e);
    return false;
  }
}

function mutateWhenEventTrace(root: Span): boolean {
  const eventData = detectEventTrace(root);
  if (!eventData) return false;
  root.kind = "event";
  root.displayName = `${eventData.kind}: ${eventData.event}`;
  root.eventData = eventData;
  return true;
}

function detectEventTrace(root: Span): EventData | undefined {
  // First we check the root name is one of the expected kinds.
  const kind = detectEventKind(root);
  if (!kind) return;

  const eventField = root.fields.find((f) => f.name === "event");
  if (!eventField) return;

  return {
    kind,
    event: processFieldValue(eventField.value),
  };
}

function mutateWhenIpcTrace(root: Span): boolean {
  const ipcData = detectIpcTrace(root);
  if (!ipcData) return false;
  root.kind = "ipc";
  root.displayName = ipcData.pluginName
    ? `plugin: ${ipcData.pluginName}.${ipcData.pluginCmd}`
    : ipcData.tauriModule
      ? `${ipcData.tauriModule}.${ipcData.tauriCmd}`
      : `command: ${ipcData.cmd}`;
  root.ipcData = ipcData;
  root.hasError = root.hasError || ipcData.responseKind === "Err";
  return true;
}

function detectIpcTrace(root: Span): IpcData | undefined {
  const ipcNames = ["wry::ipc::handle", "wry::custom_protocol::handle"];

  // First we'd like to be sure the root has a specific name.
  if (!root.metadata?.name || !ipcNames.includes(root.metadata?.name)) return;

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
  const response = getResponse(root);

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

function getResponse(root: Span): string | null {
  const responseSpan = findNamedSpan(root, "tauri::", "ipc::request::response");
  const responseField = responseSpan?.fields.find((f) => f.name === "response");
  const response = responseField
    ? processFieldValue(responseField.value).replace(
        /\\n/gim, // Turn escaped newlines into actual newlines
        "\n",
      )
    : null; // Note: allow this to be null, so that commands that are still running are detected as IPC calls.
  return response;
}

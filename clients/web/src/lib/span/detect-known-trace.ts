import { EventData, EventKind, IpcData, Span } from "../connection/monitor";
import { getSpanChildren } from "./get-span-children";
import { processFieldValue } from "./process-field-value";

/**
 * Like Array.find but recursively for the tree of children.
 *
 * Performs a depth-first search and returns on the first match.
 * When the predicate returns a *truthy* value it's considered a match.
 *
 * Note: this may match the root span as well.
 */
export function findSpan(
  value: Span,
  predicate: (value: Span, depth: number) => unknown,
  // Add max depth before current depth, as you may want to set a max when calling.
  maxDepth = 10,
  depth = 0,
): Span | undefined {
  // Try to match ourself.
  if (predicate(value, depth)) return value;

  // Break before looping if we shouldn't go deeper.
  if (depth === maxDepth) return;

  // Go depth-first on the children.
  for (const child of value.children) {
    const match = findSpan(child, predicate, maxDepth, depth + 1);
    if (match) return match;
  }
}

/**
 * Like Array.filter but recursively for the tree of children.
 *
 * Performs a depth-first search and returns all matches as an iterable.
 * When the predicate returns a *truthy* value it's considered a match.
 *
 * Note: this may match the root span as well.
 */
export function* filterSpan(
  value: Span,
  predicate: (value: Span, depth: number) => unknown,
  // Add max depth before current depth, as you may want to set a max when calling.
  maxDepth = 10,
  depth = 0,
): Iterable<Span> {
  // Try to match ourself.
  if (predicate(value, depth)) yield value;

  // Break before looping if we shouldn't go deeper.
  if (depth === maxDepth) return;

  // Go depth-first on the children.
  for (const child of value.children) {
    for (const match of filterSpan(child, predicate, maxDepth, depth + 1)) {
      yield match;
    }
  }
}

export function findNamedSpan(
  value: Span,
  partialTarget: string,
  name: string,
  maxDepth = 10,
): Span | undefined {
  return findSpan(
    value,
    (s) =>
      s.metadata?.target.startsWith(partialTarget) && s.metadata?.name === name,
    maxDepth,
  );
}

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
  let kind: EventKind;
  switch (root.metadata?.name) {
    case "app::emit::all":
    case "app::emit::filter":
    case "app::emit::to":
    case "app::emit::rust":
      kind = "global event";
      break;
    case "window::trigger":
      kind = "rust event";
      break;
    case "window::emit":
    case "window::emit::to":
    case "window::emit::all":
      kind = "event";
      break;

    // Didn't match any known root names.
    default:
      return;
  }

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
  const responseSpan = findNamedSpan(root, "tauri::", "ipc::request::response");
  const responseField = responseSpan?.fields.find((f) => f.name === "response");
  const response = responseField
    ? processFieldValue(responseField.value).replace(
        /\\n/gim, // Turn escaped newlines into actual newlines
        "\n",
      )
    : null;

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

export function getSpanValues(span: Span): Record<string, unknown> | undefined {
  switch (span.kind) {
    case "ipc": {
      const field = getSpanChildren(span, "ipc::request")[0]?.fields.find(
        (f) => f.name === "request",
      );
      if (!field) return;

      const obj = JSON.parse(processFieldValue(field.value));
      if (typeof obj !== "object") return;
      return obj;
    }

    default:
      return;
  }
}

export function getCode(span: Span): string | null {
  switch (span.kind) {
    case "ipc": {
      const field = getSpanChildren(
        span,
        "ipc::request::response",
      )[0]?.fields.find((f) => f.name === "response");
      return field
        ? processFieldValue(field.value).replace(
            /\\n/gim, // Turn escaped newlines into actual newlines
            "\n",
          )
        : null;
    }

    default:
      return null;
  }
}

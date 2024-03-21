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
function findSpan(
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

function findNamedSpan(
  value: Span,
  target: string,
  name: string,
  maxDepth = 10,
): Span | undefined {
  return findSpan(
    value,
    (s) => s.metadata?.target === target && s.metadata?.name === name,
    maxDepth,
  );
}

// add updater traces from
// https://github.com/crabnebula-dev/devtools/pull/109

export function mutateWhenKnownKind(root: Span): boolean {
  return mutateWhenEventTrace(root) || mutateWhenIpcTrace(root);
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
  root.displayName = ipcData.tauriModule
    ? `${ipcData.tauriModule}.${ipcData.tauriCmd}`
    : `command: ${ipcData.cmd}`;
  root.ipcData = ipcData;
  return true;
}

function detectIpcTrace(root: Span): IpcData | undefined {
  const ipcNames = ["wry::ipc::handle", "wry::custom_protocol::handle"];

  // First we'd like to be sure the root has a specific name.
  if (!root.metadata?.name || !ipcNames.includes(root.metadata?.name)) return;

  // Then we try to parse a child span with request data.
  const requestSpan = findNamedSpan(root, "tauri::manager", "ipc::request");
  const requestField = requestSpan?.fields.find((f) => f.name === "request");
  if (!requestField) return;
  const request = JSON.parse(processFieldValue(requestField.value)) as unknown;
  if (!request || typeof request !== "object") return;

  // Intentionally filtering variables we don't want in `inputs`
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { cmd, callback, error, __tauriModule, ...inputs } = request as Record<
    string,
    string | undefined
  >;

  // cmd is required.
  if (!cmd) return;

  // Ignore this particular kind of command as being "internal".
  // TODO: Why though? I just copied this behavior.
  if (cmd === "plugin:__TAURI_CHANNEL__|fetch") return;

  let tauriModule;
  let tauriCmd;
  let tauriInputs;
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
  const responseSpan = findNamedSpan(
    root,
    "tauri::hooks",
    "ipc::request::response",
  );
  const responseField = responseSpan?.fields.find((f) => f.name === "response");
  const response = responseField
    ? processFieldValue(responseField.value).replace(
        /\\n/gim, // Turn escaped newlines into actual newlines
        "\n",
      )
    : null;

  return { cmd, inputs, response, tauriCmd, tauriModule, tauriInputs };
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

import type { Span } from "~/lib/connection/monitor";
import { processFieldValue } from "~/lib/span/process-field-value";
import { findNamedSpan } from "~/lib/span/find-named-span";

export function getIpcResponse(root: Span): string | null {
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

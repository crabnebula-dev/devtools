import type { Span } from "../../../connection/monitor";
import { mutateWhenNamedSpan } from "./named-span/mutate-when-named-span";
import { mutateWhenEventTrace } from "./event/mutate-when-event-trace";
import { mutateWhenIpcTrace } from "./ipc/mutate-when-ipc-trace";

export function mutateWhenKnownKind(root: Span): boolean {
  try {
    return (
      mutateWhenEventTrace(root) ||
      mutateWhenIpcTrace(root) ||
      mutateWhenNamedSpan(root)
    );
  } catch (e) {
    console.error("An error happened interpreting traces", e);
    return false;
  }
}

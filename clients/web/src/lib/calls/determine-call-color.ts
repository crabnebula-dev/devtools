import type { Span } from "../connection/monitor";
import { Metadata_Level } from "../proto/common";

export function determineCallColor(call: Span) {
  if (call.hasError) return "text-red-400";
  if (call.hasChildError) return "text-orange-300";

  switch (call.metadata?.level) {
    case Metadata_Level.TRACE:
      return "text-slate-600";
    case Metadata_Level.DEBUG:
      return "text-slate-400";
  }

  return "";
}

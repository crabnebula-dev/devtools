export const EventKinds = [
  {
    type: "global event",
    names: new Set([
      "app::emit",
      "app::emit::all",
      "app::emit::filter",
      "app::emit::to",
      "app::emit::rust",
    ]),
  },
  {
    type: "rust event",
    names: new Set(["window::trigger"]),
  },
  {
    type: "event",
    names: new Set(["window::emit", "window::emit::to", "window::emit::all"]),
  },
] as const;

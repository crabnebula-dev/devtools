type IpcKind = "ipc";

export const IpcKinds = [
  {
    type: "ipc",
    names: new Set(["wry::ipc::handle", "wry::custom_protocol::handle"]),
  },
] as const satisfies {
  type: IpcKind;
  names: Set<string>;
}[];

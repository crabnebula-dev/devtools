export type IpcSpanName =
  /* tracks the whole duration of a req. fields: id = invoke ID and kind = "postmessage" */
  | "ipc::request"
  /*  = the time it takes to deserialize the arguments. fields: id = invoke ID and args = string repo of the unparsed data */
  | "ipc::request::deserialize_arg"
  /*  this gets emitted when we have found the right handler and are processing the request. fields: id= Invoke ID, cmd = the command name, kind the kind of command, loc.line the source code line of the handler, loc.col the source code column of the handler, is_internal = whether the command is internal to tauri or user defined */
  | "ipc::request::handler"
  /*  this tracks the duration of the user written code that handles the request */
  | "ipc::request::run"
  /*  tracks how much time it took to respond to the request (from the rust side) */
  | "ipc::request::respond"
  /*  shows the actual response */
  | "ipc::request::response"
  /*  @todo describe 👇 */
  | "wry::eval";

export const NamedSpanMap = new Map<string, string>([
  ["ipc::request", "Request"],
  ["ipc::request::run", "Command Run"],
  ["ipc::request::respond", "Response"],
  ["wry::eval", "Eval Response"],
  ["ipc::request::deserialize_arg", "Deserialize Args"],
  ["ipc::request::handler", "Command Handler"],
  ["ipc::request::response", "Response"],
]);

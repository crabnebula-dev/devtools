#[test]
fn m() {
    let span = probes::ipc_request!({ id: 66, cmd: "foo", kind: "async", line: 10, col: 0 });
    let _enter = span.enter();
}
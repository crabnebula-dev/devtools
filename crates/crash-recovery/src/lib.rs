mod client;
mod error;
mod grpc_server;
mod os;
mod server;

use bytes::Bytes;
use client::Client;
use grpc_server::GRPCServer;
use server::Server;
use std::{
    env, mem,
    path::Path,
    process, slice,
    sync::Arc,
    thread,
    time::Duration,
};
use tokio::sync::{oneshot, Mutex};

const OBSERVER_ENV_VAR: &str = "RUN_AS_OBSERVER";
const SOCKET_NAME: &str = "/tmp/minidumper-disk-example";

static mut CRASH_HANDLER: Option<crash_handler::CrashHandler> = None;

pub use error::Error;
type Result<T> = std::result::Result<T, Error>;

/// TODO
///
/// # Panics
///
/// TODO
pub fn init() {
    try_init().unwrap();
}

/// TODO
///
/// # Errors
///
/// TODO
///
/// # Panics
///
/// TODO
pub fn try_init() -> Result<()> {
    if env::vars().any(|(k, v)| k == OBSERVER_ENV_VAR && v == "true") {
        let runtime = tokio::runtime::Builder::new_current_thread()
            .enable_io()
            .build()?;
        let _enter = runtime.enter();

        let watchers: Arc<Mutex<Vec<oneshot::Sender<Bytes>>>> = Default::default();
        let grpc_server = GRPCServer::new(watchers.clone());
        let ipc_server = Server::bind(Path::new(SOCKET_NAME), watchers)?;

        runtime.block_on(async move {
            let grpc = spawn_named(grpc_server.serve(), "crash_handler::grpc");

            spawn_named(ipc_server.run(), "crash_handler::ipc")
                .await
                .unwrap()
                .unwrap();
            grpc.abort();
        });

        process::exit(0);
    } else {
        let exe = std::env::current_exe().unwrap();

        println!("spawning observer process...");
        process::Command::new(exe)
            .env(OBSERVER_ENV_VAR, "true")
            .spawn()
            .unwrap();

        let client = loop {
            println!("connecting to server...");
            if let Ok(client) = Client::connect(Path::new(SOCKET_NAME)) {
                println!("connected to server");
                break client;
            }
            println!("failed to connect, going to sleep");

            thread::sleep(Duration::from_millis(50));
        };

        // The sync io methods on windows need &mut self
        let client = Arc::new(Mutex::new(client));

        let handler = crash_handler::CrashHandler::attach(unsafe {
            crash_handler::make_crash_event(move |ctx| {
                println!("got crash");
                let mut client = client.blocking_lock();
                crash_handler::CrashEventResult::Handled(client.send_crash_context(ctx).is_ok())
            })
        })
        .unwrap();

        unsafe {
            CRASH_HANDLER.replace(handler);
        }

        Ok(())
    }
}

#[derive(Debug, Clone, Copy)]
#[repr(C)]
struct MessageHeader {
    kind: MessageKind,
    len: usize,
}

#[derive(Debug, Clone, Copy, PartialEq)]
#[repr(u8)]
enum MessageKind {
    Crash,
    #[cfg(not(target_os = "macos"))]
    CrashAck,
}

impl MessageHeader {
    fn as_bytes(&self) -> &[u8] {
        #[allow(unsafe_code)]
        unsafe {
            let size = mem::size_of::<Self>();
            let ptr = (self as *const Self).cast();
            slice::from_raw_parts(ptr, size)
        }
    }

    fn from_bytes(buf: &[u8]) -> Option<&Self> {
        if buf.len() != mem::size_of::<Self>() {
            return None;
        }

        #[allow(unsafe_code)]
        unsafe {
            let (_head, body, _tail) = buf.align_to::<Self>();

            Some(&body[0])
        }
    }
}

#[track_caller]
pub fn spawn_named<T>(
    task: impl std::future::Future<Output = T> + Send + 'static,
    _name: &str,
) -> tokio::task::JoinHandle<T>
where
    T: Send + 'static,
{
    #[cfg(tokio_unstable)]
    return tokio::task::Builder::new().name(_name).spawn(task).unwrap();

    #[cfg(not(tokio_unstable))]
    tokio::spawn(task)
}

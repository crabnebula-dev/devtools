mod client;
mod error;
mod os;
mod server;

use client::Client;
use server::Server;
use std::{
    env, mem,
    path::Path,
    process, slice,
    sync::{Arc, Mutex},
    time::Duration,
};

const OBSERVER_ENV_VAR: &str = "RUN_AS_OBSERVER";
const SOCKET_NAME: &str = "/tmp/minidumper-disk-example";

pub use error::Error;
type Result<T> = std::result::Result<T, Error>;

pub fn init<T>(inner: impl FnOnce(crash_handler::CrashHandler) -> T) -> T {
    try_init(inner).unwrap()
}

/// This function initializes the crash observer process and attaches a crash handler
pub fn try_init<T>(inner: impl FnOnce(crash_handler::CrashHandler) -> T) -> Result<T> {
    if env::vars().any(|(k, v)| k == OBSERVER_ENV_VAR && v == "true") {
        let runtime = tokio::runtime::Builder::new_multi_thread()
            .enable_io()
            .build()?;
        let _enter = runtime.enter();

        let server = Server::bind(Path::new(SOCKET_NAME))?;

        runtime.block_on(async move {
            server.run().await.unwrap();
        });

        process::exit(0);
    } else {
        let exe = std::env::current_exe()?;

        println!("spawning observer process...");
        let mut observer = process::Command::new(exe)
            .env(OBSERVER_ENV_VAR, "true")
            .spawn()?;

        let runtime = tokio::runtime::Handle::current();

        let client = runtime.block_on(async move {
            loop {
                println!("connecting to server...");
                if let Ok(client) = Client::connect(Path::new(SOCKET_NAME)).await {
                    println!("connected to server");
                    break client;
                }
                println!("failed to connect, going to sleep");

                tokio::time::sleep(Duration::from_millis(50)).await
            }
        });

        let client = Arc::new(Mutex::new(client));

        #[allow(unsafe_code)]
        let handler = crash_handler::CrashHandler::attach(unsafe {
            crash_handler::make_crash_event(move |ctx| {
                println!("got crash");
                let mut client = client.lock().unwrap();
                crash_handler::CrashEventResult::Handled(client.send_crash_context(ctx).is_ok())
            })
        })?;

        let res = inner(handler);

        observer.wait()?;

        Ok(res)
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

    fn from_bytes(buf: &[u8]) -> Option<Self> {
        if buf.len() != mem::size_of::<Self>() {
            return None;
        }

        #[allow(unsafe_code)]
        unsafe {
            Some(*buf.as_ptr().cast::<Self>())
        }
    }
}

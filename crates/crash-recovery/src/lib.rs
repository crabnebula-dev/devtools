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
    thread,
    time::Duration,
};

const OBSERVER_ENV_VAR: &str = "RUN_AS_OBSERVER";
const SOCKET_NAME: &str = "/tmp/minidumper-disk-example";

static mut CRASH_HANDLER: Option<crash_handler::CrashHandler> = None;

pub use error::Error;
type Result<T> = std::result::Result<T, Error>;

pub fn init() {
    try_init().unwrap();
}

/// This function initializes the crash observer process and attaches a crash handler
pub fn try_init() -> Result<()> {
    if env::vars().any(|(k, v)| k == OBSERVER_ENV_VAR && v == "true") {
        let server = Server::bind(Path::new(SOCKET_NAME))?;

        server.run()?;

        process::exit(0);
    } else {
        let exe = std::env::current_exe()?;

        process::Command::new(exe)
            .env(OBSERVER_ENV_VAR, "true")
            .spawn()?;

        let client = loop {
            if let Ok(client) = Client::connect(Path::new(SOCKET_NAME)) {
                break client;
            }

            thread::sleep(Duration::from_millis(50));
        };
        let client = Arc::new(Mutex::new(client));

        let handler = crash_handler::CrashHandler::attach(unsafe {
            crash_handler::make_crash_event(move |ctx| {
                let mut client = client.lock().unwrap();
                crash_handler::CrashEventResult::Handled(client.send_crash_context(ctx).is_ok())
            })
        })?;

        unsafe { CRASH_HANDLER.replace(handler); }

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

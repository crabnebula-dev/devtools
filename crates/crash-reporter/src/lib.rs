mod builder;
mod client;
mod error;
mod grpc;
mod server;

use bytes::Bytes;
use std::{mem, slice, sync::Arc};
use tokio::sync::{oneshot, Mutex};

pub use builder::Builder;
pub use error::Error;

type Result<T> = std::result::Result<T, Error>;
type Watchers = Arc<Mutex<Vec<oneshot::Sender<Bytes>>>>;

/// TODO
///
/// # Panics
///
/// TODO
pub fn init() {
    Builder::default().init()
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
    Builder::default().try_init()
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

#[cfg(target_os = "windows")]
#[repr(C)]
pub struct DumpRequest {
    /// The address of an `EXCEPTION_POINTERS` in the client's memory
    pub exception_pointers: usize,
    /// The process id of the client process
    pub process_id: u32,
    /// The id of the thread in the client process in which the crash originated
    pub thread_id: u32,
    /// The top level exception code, also found in the `EXCEPTION_POINTERS.ExceptionRecord.ExceptionCode`
    pub exception_code: i32,
}

#[cfg(target_os = "windows")]
impl DumpRequest {
    pub fn as_bytes(&self) -> &[u8] {
        #[allow(unsafe_code)]
        unsafe {
            let size = mem::size_of::<Self>();
            let ptr = (self as *const Self).cast();
            slice::from_raw_parts(ptr, size)
        }
    }

    pub fn from_bytes(buf: &[u8]) -> Option<&Self> {
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

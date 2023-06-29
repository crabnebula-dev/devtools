use std::path::Path;

cfg_if::cfg_if! {
    if #[cfg(unix)] {
        pub type Stream = interprocess::os::unix::udsocket::UdStream;
        pub type AsyncStream = interprocess::os::unix::udsocket::tokio::UdStream;
        pub type Listener = interprocess::os::unix::udsocket::tokio::UdStreamListener;

        pub fn connect(path: &Path) -> crate::Result<Stream> {
            Stream::connect(path).map_err(Into::into)
        }

        pub fn bind(path: &Path) -> crate::Result<Listener> {
            Listener::bind(path).map_err(Into::into)
        }
    } else if #[cfg(target_os = "windows")] {
        use std::{mem, slice};

        pub type Stream = interprocess::os::windows::named_pipe::DuplexBytePipeStream;
        pub type AsyncStream = interprocess::os::windows::named_pipe::tokio::DuplexBytePipeStream;
        pub type Listener = interprocess::os::windows::named_pipe::tokio::PipeListener<AsyncStream>;

        pub fn connect(path: &Path) -> crate::Result<Stream> {
            Stream::connect(path.as_os_str()).map_err(Into::into)
        }

        pub fn bind(path: &Path) -> crate::Result<Listener> {
            use interprocess::os::windows::named_pipe::{PipeListenerOptions, tokio::PipeListenerOptionsExt};

            PipeListenerOptions::new()
                .name(path.as_os_str())
                .create_tokio::<AsyncStream>()
                .map_err(Into::into)
        }

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
    } else {
        compile_error!("unsupported target platform");
    }
}

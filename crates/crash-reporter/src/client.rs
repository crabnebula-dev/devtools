use crate::{Error, MessageHeader, MessageKind};
use std::{
    io::{IoSlice, Write},
    mem,
    path::Path,
    time::Duration,
};

pub struct Client {
    socket: interprocess::local_socket::LocalSocketStream,
    #[cfg(target_os = "macos")]
    port: crash_context::ipc::Client,
}

impl Client {
    pub fn connect(path: &Path) -> crate::Result<Self> {
        let socket = interprocess::local_socket::LocalSocketStream::connect(path)?;

        #[cfg(target_os = "macos")]
        let port = {
            // Note that sun_path is limited to 108 characters including null,
            // while a mach port name is limited to 128 including null, so
            // the length is already effectively checked here
            let port_name = std::ffi::CString::new(path.to_str().ok_or(Error::InvalidPortName)?)
                .map_err(|_err| Error::InvalidPortName)?;
            crash_context::ipc::Client::create(&port_name)?
        };

        Ok(Self {
            socket,
            #[cfg(target_os = "macos")]
            port,
        })
    }

    pub fn send_crash_context(&mut self, ctx: &crash_context::CrashContext) -> crate::Result<()> {
        #[cfg(any(target_os = "linux", target_os = "android"))]
        let crash_ctx_buf = ctx.as_bytes();
        #[cfg(target_os = "macos")]
        let crash_ctx_buf = {
            self.port.send_crash_context(
                ctx,
                Some(Duration::from_secs(2)),
                Some(Duration::from_secs(5)),
            )?;

            &[]
        };
        #[cfg(target_os = "windows")]
        let crash_ctx_buf = {
            let req = crate::DumpRequest {
                exception_pointers: ctx.exception_pointers as usize,
                process_id: ctx.process_id,
                thread_id: ctx.thread_id,
                exception_code: ctx.exception_code,
            };

            req.as_bytes()
        };

        self.send_impl(MessageKind::Crash, crash_ctx_buf)?;

        #[cfg(not(target_os = "macos"))]
        {
            let mut ack = [0u8; mem::size_of::<MessageHeader>()];
            self.socket.read(&mut ack)?;

            let header = MessageHeader::from_bytes(&ack);

            if header
                .filter(|hdr| hdr.kind == MessageKind::CrashAck)
                .is_none()
            {
                return Err(Error::ProtocolError("received invalid response to crash"));
            }
        }

        Ok(())
    }

    fn send_impl(&mut self, kind: MessageKind, buf: &[u8]) -> crate::Result<()> {
        let header = MessageHeader {
            kind,
            len: buf.len(),
        };

        let hdr_buf = header.as_bytes();

        let bytes_written = self
            .socket
            .write_vectored(&[IoSlice::new(hdr_buf), IoSlice::new(buf)])?;

        assert_eq!(bytes_written, buf.len() + mem::size_of::<MessageHeader>());

        Ok(())
    }
}

use crate::{Error, MessageHeader, MessageKind};

#[cfg(windows)]
use futures_util::AsyncReadExt;
use std::{
    fs,
    path::{Path, PathBuf},
    time::Duration, sync::Arc,
};
use bytes::Bytes;
use tokio::{
    io::AsyncReadExt, sync::{Mutex, oneshot}
};

#[cfg(not(windows))]
use tokio::io::AsyncReadExt;

pub struct Server {
    listener: crate::os::Listener,
    #[cfg(target_os = "macos")]
    port: crash_context::ipc::Server,
    socket_path: PathBuf,
    // TODO this is horrific
    watchers: Arc<Mutex<Vec<oneshot::Sender<Bytes>>>>,
}

struct ClientConnection {
    socket: crate::os::AsyncStream,
}

impl Server {
    pub fn bind(path: &Path, watchers: Arc<Mutex<Vec<oneshot::Sender<Bytes>>>>,) -> crate::Result<Self> {
        if path.exists() {
            fs::remove_file(path).unwrap();
        }

        let listener = crate::os::bind(path)?;

        #[cfg(target_os = "macos")]
        let port = {
            // Note that sun_path is limited to 108 characters including null,
            // while a mach port name is limited to 128 including null, so
            // the length is already effectively checked here
            let port_name = std::ffi::CString::new(path.to_str().ok_or(Error::InvalidPortName)?)
                .map_err(|_err| Error::InvalidPortName)?;
            crash_context::ipc::Server::create(&port_name)?
        };

        Ok(Self {
            listener,
            #[cfg(target_os = "macos")]
            port,
            socket_path: path.to_path_buf(),
            watchers
        })
    }

    pub async fn run(self) -> crate::Result<()> {
        if let Ok(socket) = self.listener.accept().await {
            let mut conn = ClientConnection { socket };

            while let Some((kind, body)) = conn.recv().await {
                if kind == MessageKind::Crash {
                    self.handle_crash_message(&body).await?;

                    #[cfg(not(target_os = "macos"))]
                    {
                        #[cfg(windows)]
                        use futures_util::AsyncWriteExt;

                        let ack = MessageHeader {
                            kind: MessageKind::CrashAck,
                            len: 0,
                        };
                        #[cfg(not(windows))]
                        conn.socket.write_all(ack.as_bytes())?;
                        #[cfg(windows)]
                        {
                            conn.socket.write_all(ack.as_bytes()).await?;
                            conn.socket.flush().await?;
                        }
                    }

                    return Ok(());
                }
                // #[allow(unreachable_patterns)]
                // match kind {
                //     MessageKind::Crash => {
                //         self.handle_crash_message(&body)?;

                //         #[cfg(not(target_os = "macos"))]
                //         {
                //             let ack = MessageHeader {
                //                 kind: MessageKind::CrashAck,
                //                 len: 0,
                //             };
                //             conn.socket.write_all(ack.as_bytes())?;
                //         }

                //         return Ok(());
                //     }
                //     _ => {}
                // }
            }
        }

        Ok(())
    }

    async fn handle_crash_message(mut self, _body: &[u8]) -> crate::Result<()> {
        #[cfg(any(target_os = "linux", target_os = "android"))]
        let crash_context = {
            crash_context::CrashContext::from_bytes(_body).ok_or_else(|| {
                Error::from(std::io::Error::new(
                    std::io::ErrorKind::InvalidData,
                    "client sent an incorrectly sized buffer",
                ))
            })?
        };
        #[cfg(target_os = "macos")]
        let crash_context = {
            let Some(mut rcc) = self.port.try_recv_crash_context(None)? else {
                return Ok(());
            };

            if let Err(e) = rcc.acker.send_ack(1, Some(Duration::from_secs(2))) {
                eprintln!("failed to send ack: {e}");
            }

            rcc.crash_context
        };

        #[cfg(target_os = "windows")]
        let crash_context = {
            let dump_request = crate::os::DumpRequest::from_bytes(_body).unwrap();

            let exception_pointers =
                dump_request.exception_pointers as *const crash_context::EXCEPTION_POINTERS;

            crash_context::CrashContext {
                exception_pointers,
                process_id: dump_request.process_id,
                thread_id: dump_request.thread_id,
                exception_code: dump_request.exception_code,
            }
        };

        let mut writer =
            minidump_writer::minidump_writer::MinidumpWriter::with_crash_context(crash_context);

        let mut f = std::fs::File::create("./minidump").unwrap();
        let crashdump = Bytes::from(writer.dump(&mut f).unwrap());

        let mut watchers = self.watchers.lock().await;
        for watcher in watchers.drain(..) {
            watcher.send(crashdump.clone()).unwrap();
        }

        Ok(())
    }
}

impl Drop for Server {
    fn drop(&mut self) {
        // Note we don't check for the existence of the path since there
        // appears to be a bug on MacOS and Windows, or at least an oversight
        // in std, where checking the existence of the path always fails
        let _res = fs::remove_file(&self.socket_path);
    }
}

impl ClientConnection {
    pub async fn recv(&mut self) -> Option<(MessageKind, Vec<u8>)> {
        let mut hdr_buf = [0u8; std::mem::size_of::<MessageHeader>()];
        let bytes_read = self.socket.read(&mut hdr_buf).await.ok()?;

        println!("read bytes {bytes_read}");

        if bytes_read == 0 {
            return None;
        }

        let header = MessageHeader::from_bytes(&hdr_buf)?;

        println!("read header {header:?}");

        if header.len == 0 {
            Some((header.kind, Vec::new()))
        } else {
            let mut buf = vec![0; header.len];

            self.socket.read_exact(&mut buf).await.ok()?;

            Some((header.kind, buf))
        }
    }
}

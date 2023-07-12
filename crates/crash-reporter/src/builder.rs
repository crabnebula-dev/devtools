use crate::{client::Client, grpc::GRPCServer, server::Server, Error, Watchers};
use std::{
    env,
    net::{IpAddr, Ipv4Addr, SocketAddr},
    path::{Path, PathBuf},
    process,
    sync::{Arc, Mutex},
    thread,
    time::Duration,
};
use tokio::runtime;

const DEFAULT_SOCKET_NAME: &str = "/tmp/minidumper-disk-example";
const DEFAULT_GRPC_PORT: u16 = 6668;
const DEFAULT_CRASHDUMP_PATH: &str = "./minidump";
const OBSERVER_ENV_VAR: &str = "RUN_AS_OBSERVER";

static mut CRASH_HANDLER: Option<crash_handler::CrashHandler> = None;

pub struct Builder {
    socket_path: PathBuf,
    grpc_addr: SocketAddr,
    crashdump_path: PathBuf,
    #[cfg(target_os = "macos")]
    send_timeout: Option<Duration>,
    #[cfg(target_os = "macos")]
    receive_timeout: Option<Duration>,
}

impl Default for Builder {
    fn default() -> Self {
        let grpc_port = portpicker::is_free_tcp(DEFAULT_GRPC_PORT)
            .then_some(DEFAULT_GRPC_PORT)
            .or_else(|| portpicker::pick_unused_port())
            .expect("no free port available");

        Self {
            socket_path: PathBuf::from(DEFAULT_SOCKET_NAME),
            grpc_addr: SocketAddr::new(IpAddr::V4(Ipv4Addr::UNSPECIFIED), grpc_port),
            crashdump_path: PathBuf::from(DEFAULT_CRASHDUMP_PATH),
            send_timeout: Some(Duration::from_secs(2)),
            receive_timeout: Some(Duration::from_secs(5)),
        }
    }
}

impl Builder {
    pub fn get_socket_path(&self) -> &Path {
        &self.socket_path
    }

    pub fn set_socket_path(&mut self, socket_path: PathBuf) -> &mut Self {
        self.socket_path = socket_path;
        self
    }

    pub fn get_grpc_addr(&self) -> &SocketAddr {
        &self.grpc_addr
    }

    pub fn set_grpc_addr(&mut self, grpc_addr: SocketAddr) -> &mut Self {
        self.grpc_addr = grpc_addr;
        self
    }

    pub fn get_crashdump_path(&self) -> &Path {
        &self.crashdump_path
    }

    pub fn set_crashdump_path(&mut self, crashdump_path: PathBuf) -> &mut Self {
        self.crashdump_path = crashdump_path;
        self
    }

    pub fn init(self) {
        self.try_init().unwrap()
    }

    pub fn try_init(self) -> crate::Result<()> {
        if env::vars().any(|(k, v)| k == OBSERVER_ENV_VAR && v == "true") {
            let runtime = runtime::Builder::new_current_thread()
                .enable_all()
                .build()?;

            let _enter = runtime.enter();

            let watchers = Watchers::default();
            let server = Server::new(&self.socket_path, watchers.clone())?;
            let grpc_server = GRPCServer::new(watchers);

            runtime.block_on(async {
                let grpc = tokio::spawn(grpc_server.run(self.grpc_addr));
                server.run().await?;
                grpc.abort();
                Ok::<(), Error>(())
            })?;

            process::exit(0);
        } else {
            let exe = std::env::current_exe()?;

            process::Command::new(exe)
                .env(OBSERVER_ENV_VAR, "true")
                .spawn()?;

            let client = loop {
                if let Ok(client) = Client::connect(&self.socket_path) {
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

            unsafe {
                CRASH_HANDLER.replace(handler);
            }

            Ok(())
        }
    }
}

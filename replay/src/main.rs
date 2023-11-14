use clap::Parser;
use colored::Colorize;
use futures::stream::StreamExt;
use memmap2::{Mmap, MmapOptions};
use prost::Message;
use std::fs::File;
use std::io::{Cursor, Read};
use std::net::{IpAddr, Ipv4Addr, SocketAddr};
use std::path::{Path, PathBuf};
use std::sync::Arc;
use tauri_devtools_wire_format::instrument;
use tauri_devtools_wire_format::instrument::instrument_server::InstrumentServer;
use tauri_devtools_wire_format::instrument::{InstrumentRequest, Update};
use tonic::codegen::http::Method;
use tonic::codegen::BoxStream;
use tonic::{Request, Response, Status};
use tower_http::cors::{AllowHeaders, CorsLayer};

const DEFAULT_ADDRESS: SocketAddr = SocketAddr::new(IpAddr::V4(Ipv4Addr::LOCALHOST), 3000);
const DEVTOOL_URL: &str = "http://localhost:5173/dash/";

#[derive(Parser)]
#[command(about, author, version)]
struct Options {
    /// The path to a devtools session recording file
    path: PathBuf,
}

#[tokio::main]
async fn main() {
    let opts = Options::parse();

    let cors = CorsLayer::new()
        // allow `GET` and `POST` when accessing the resource
        .allow_methods([Method::GET, Method::POST])
        .allow_headers(AllowHeaders::any())
        // allow requests from any origin
        .allow_origin(tower_http::cors::Any);

    let instrument = Service::new(&opts.path);

    let (mut health_reporter, health) = tonic_health::server::health_reporter();

    health_reporter
        .set_serving::<InstrumentServer<Service>>()
        .await;

    let url = format!(
        "{DEVTOOL_URL}{}/{}",
        DEFAULT_ADDRESS.ip(),
        DEFAULT_ADDRESS.port()
    );
    println!(
        r#"
   {} {}{}
   {}   Local:   {}
"#,
        "Tauri Devtools REPLAY".bright_purple(),
        "v".purple(),
        env!("CARGO_PKG_VERSION").purple(),
        "→".bright_purple(),
        url.underline().blue()
    );

    tonic::transport::Server::builder()
        .accept_http1(true)
        .layer(cors)
        .add_service(tonic_web::enable(InstrumentServer::new(instrument)))
        .add_service(tonic_web::enable(health))
        .serve(DEFAULT_ADDRESS)
        .await
        .unwrap();
}

struct Service(Arc<Mmap>);

impl Service {
    pub fn new(path: &Path) -> Self {
        let mut file = File::open(path).unwrap();
        let mut version = vec![0u8];
        file.read_exact(&mut version).unwrap();
        assert_eq!(version[0], 1);

        let mmap = unsafe { MmapOptions::new().offset(1).map(&file).unwrap() };

        Self(Arc::new(mmap))
    }
}

#[tonic::async_trait]
impl instrument::instrument_server::Instrument for Service {
    type WatchUpdatesStream = BoxStream<Update>;

    async fn watch_updates(
        &self,
        req: Request<InstrumentRequest>,
    ) -> Result<Response<Self::WatchUpdatesStream>, Status> {
        if let Some(addr) = req.remote_addr() {
            println!("starting a new watch: {addr:?}");
        } else {
            println!("starting a new watch: <unknown>");
        }

        let stream = futures::stream::try_unfold((self.0.clone(), 0), |(mmap, pos)| async move {
            let mut cursor = Cursor::new(mmap.as_ref());
            cursor.set_position(pos);
            if let Ok(update) = Update::decode_length_delimited(&mut cursor) {
                let pos = cursor.position();
                Ok(Some((update, (mmap, pos))))
            } else {
                Ok(None)
            }
        });

        let stream = stream.chain(futures::stream::pending());

        Ok(Response::new(Box::pin(stream)))
    }
}

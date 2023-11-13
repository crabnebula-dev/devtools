use async_stream::__private::AsyncStream;
use async_stream::try_stream;
use clap::Parser;
use memmap2::{Mmap, MmapOptions};
use prost::bytes::Buf;
use prost::Message;
use std::fs::File;
use std::io::{Cursor, Read};
use std::path::Component::CurDir;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use tauri_devtools_wire_format::instrument;
use tauri_devtools_wire_format::instrument::InstrumentRequest;
use tauri_devtools_wire_format::logs::Update;
use tonic::codegen::BoxStream;
use tonic::{Request, Response, Status};

#[derive(Parser)]
struct Options {
    path: PathBuf,
}

fn main() {
    let opts = Options::parse();
}

struct Server(Mmap);

impl Server {
    pub fn new(path: &Path) -> Self {
        let mut file = File::open(path).unwrap();
        let mut version = vec![0u8];
        file.read_exact(&mut version).unwrap();
        assert_eq!(version[0], 1);

        let mmap = unsafe { MmapOptions::new().map(&file).unwrap() };

        Self(mmap)
    }
}

#[tonic::async_trait]
impl instrument::instrument_server::Instrument for Server {
    type WatchUpdatesStream = BoxStream<instrument::Update>;

    async fn watch_updates(
        &self,
        req: Request<InstrumentRequest>,
    ) -> Result<Response<Self::WatchUpdatesStream>, Status> {
        if let Some(addr) = req.remote_addr() {
            println!("starting a new watch: {addr:?}");
        } else {
            println!("starting a new watch: <unknown>");
        }

        let stream: AsyncStream<Result<Update, Status>, _> = try_stream! {
            let mut cursor = Cursor::new(&self.0);

            loop {
                if let Ok(update) = Update::decode_length_delimited(&mut cursor) {
                    yield update;
                } else {
                    if cursor.remaining() == 0 {
                        break;
                    } else {
                        Err(Status::internal("foo"))?;
                    }
                }
            }
        };

        Ok(Response::new(Box::pin(stream)))
    }
}

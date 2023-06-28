use futures::StreamExt;
use wire::instrument::{instrument_client::InstrumentClient, InstrumentRequest};

#[tokio::main]
async fn main() {
    let mut instrument_client = InstrumentClient::connect("http://localhost:6669")
        .await
        .unwrap();

    let mut stream = instrument_client
        .watch_updates(InstrumentRequest::new())
        .await
        .unwrap()
        .into_inner();

    while let Some(instrument_update) = stream.next().await {
        println!("received update {instrument_update:?}")
    }
}

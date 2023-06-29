use futures::StreamExt;
use wire::instrument::{instrument_client::InstrumentClient, InstrumentRequest};
use wire::crash::{crash_handler_client::CrashHandlerClient, WatchCrashRequest};

#[tokio::main]
async fn main() {
    let mut crash_handler_client = CrashHandlerClient::connect("http://localhost:6668")
        .await
        .unwrap();

    // let mut instrument_client = InstrumentClient::connect("http://localhost:6669")
    //     .await
    //     .unwrap();

    let res = crash_handler_client
        .watch_crash(WatchCrashRequest {})
        .await
        .unwrap();

    println!("{res:?}")
    // let mut stream = instrument_client
    //     .watch_updates(InstrumentRequest::new())
    //     .await
    //     .unwrap()
    //     .into_inner();

    // while let Some(instrument_update) = stream.next().await {
    //     println!("received update {instrument_update:?}")
    // }
}

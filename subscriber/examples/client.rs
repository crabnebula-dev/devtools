#[tokio::main]
async fn main() {
    let mut client =
        api::instrument::instrument_client::InstrumentClient::connect("http://localhost:6669")
            .await
            .unwrap();

    let mut stream = client
        .watch_updates(api::instrument::InstrumentRequest::new())
        .await
        .unwrap()
        .into_inner();

    println!("connected");

    while let Some(update) = stream.message().await.unwrap() {
        println!("{:?}", update.trace_update.map(|update| update.dropped_events));
    }

    println!("stream done");
}

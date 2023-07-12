use futures_util::StreamExt;
use mdns_sd::ServiceDaemon;
use wire::instrument::instrument_client;

#[tokio::main]
async fn main() {
    // Create a daemon
    let mdns = ServiceDaemon::new().expect("Failed to create daemon");

    // Browse for a service type.
    let service_type = "_CNDinstrument._udp.local.";
    let receiver = mdns.browse(service_type).expect("Failed to browse");
    let mut receiver_stream = receiver.into_stream();

    let info = loop {
        match receiver_stream.next().await {
            Some(mdns_sd::ServiceEvent::ServiceResolved(info)) => {
                break info;
            }
            Some(_) => {}
            None => {
                return;
            }
        }
    };

    let addr = format!(
        "http://{}:{}",
        info.get_addresses().into_iter().next().unwrap(),
        info.get_port()
    );

    println!("will connect to {}", addr);

    let mut client = instrument_client::InstrumentClient::connect(addr)
        .await
        .unwrap();

    let mut stream = client
        .watch_updates(wire::instrument::InstrumentRequest::new())
        .await
        .unwrap()
        .into_inner();

    while let Some(update) = stream.next().await {
        println!("update: {:?}", update);
    }
}

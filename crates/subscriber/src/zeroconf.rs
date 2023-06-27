use mdns_sd::{ServiceDaemon, ServiceInfo};
use std::net::IpAddr;

pub struct Zeroconf {
    hostname: String,
    grpc_port: u16,
    os: &'static str,
    arch: &'static str,
    package_info: tauri::PackageInfo,
}

impl Zeroconf {
    pub fn new_from_env(
        grpc_port: u16,
        package_info: tauri::PackageInfo,
    ) -> Result<Self, Box<dyn std::error::Error>> {
        let hostname = hostname::get()?;
        Ok(Self {
            grpc_port,
            hostname: hostname.to_string_lossy().to_string(),
            os: std::env::consts::OS,
            arch: std::env::consts::ARCH,
            package_info,
        })
    }

    pub async fn run(self) -> Result<(), Box<dyn std::error::Error + Send + Sync + 'static>> {
        // Create a daemon
        let mdns = ServiceDaemon::new()?;

        // Create a service info.
        let service_type = "_cn-devtools._udp.local.";
        let instance_name = &self.package_info.name;

        let host_ipv4 = if_addrs::get_if_addrs()?
            .iter()
            .filter_map(|if_addr| match if_addr.addr.ip() {
                IpAddr::V4(ipv4) => Some(ipv4.to_string()),
                IpAddr::V6(_) => None,
            })
            .collect::<Vec<_>>()
            .join(",");

        tracing::debug!("ip addresses if service {:?}", host_ipv4);

        let properties = [
            ("OS", self.os),
            ("ARCH", self.arch),
            ("VERSION", &self.package_info.version.to_string()),
            ("DESCRIPTION", self.package_info.description),
            ("AUTHORS", self.package_info.authors),
        ];

        let my_service = ServiceInfo::new(
            service_type,
            instance_name,
            &self.hostname,
            host_ipv4,
            self.grpc_port,
            &properties[..],
        )
        .unwrap();

        // Register with the daemon, which publishes the service.
        mdns.register(my_service)
            .expect("Failed to register our service");

        let receiver = mdns.monitor().unwrap();

        while let Ok(event) = receiver.recv_async().await {
            tracing::debug!("mdns deamon event {:?}", event);
        }

        Ok(())
    }
}

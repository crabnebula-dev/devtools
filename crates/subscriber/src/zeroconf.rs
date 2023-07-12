use mdns_sd::{ServiceDaemon, ServiceInfo};
use std::net::IpAddr;

pub struct Zeroconf {
    hostname: String,
    instrument_port: u16,
    crash_port: u16,
    os: &'static str,
    arch: &'static str,
    package_info: tauri::PackageInfo,
}

impl Zeroconf {
    pub fn new_from_env(
        instrument_port: u16,
        crash_port: u16,
        package_info: tauri::PackageInfo,
    ) -> crate::Result<Self> {
        let hostname = hostname::get()?;
        Ok(Self {
            instrument_port,
            crash_port,
            hostname: hostname.to_string_lossy().to_string(),
            os: std::env::consts::OS,
            arch: std::env::consts::ARCH,
            package_info,
        })
    }

    pub async fn run(self) -> crate::Result<()> {
        // Create a daemon
        let mdns = ServiceDaemon::new()?;

        // Create a service info.
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

        let instrument_service = ServiceInfo::new(
            "_CNDinstrument._udp.local.",
            instance_name,
            &self.hostname,
            host_ipv4.clone(),
            self.instrument_port,
            &properties[..],
        )
        .unwrap();

        let crash_service = ServiceInfo::new(
            "_CNDcrash._udp.local.",
            instance_name,
            &self.hostname,
            host_ipv4,
            self.crash_port,
            &properties[..],
        )
        .unwrap();

        // Register with the daemon, which publishes the services.
        mdns.register(instrument_service)
            .expect("Failed to register instrument service");
        mdns.register(crash_service)
            .expect("Failed to register instrument service");

        let receiver = mdns.monitor().unwrap();

        while let Ok(event) = receiver.recv_async().await {
            tracing::debug!("mdns deamon event {:?}", event);
        }

        Ok(())
    }
}

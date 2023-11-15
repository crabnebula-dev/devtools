use std::fs::File;
use std::io::Write;
use std::path::Path;
use tauri::{AppHandle, Runtime};
use tauri_devtools_wire_format::instrument;
use tauri_devtools_wire_format::meta::AppMetadata;
use tauri_devtools_wire_format::recording::RecordingHeader;
use tauri_devtools_wire_format::tauri::Versions;
use tokio::sync::mpsc;

pub(crate) struct Recorder {
    rx: mpsc::Receiver<instrument::Update>,
    fd: File,
    scratch: Vec<u8>,
}

impl Recorder {
    pub fn new<R: Runtime>(
        rx: mpsc::Receiver<instrument::Update>,
        path: &Path,
        app_handle: &AppHandle<R>,
    ) -> crate::Result<Self> {
        let fd = File::create(path)?;
        let info = app_handle.package_info();

        let header = RecordingHeader {
            version: 1,
            app_metadata: Some(AppMetadata {
                name: info.name.clone(),
                version: info.version.to_string(),
                authors: info.authors.to_string(),
                description: info.description.to_string(),
                os: std::env::consts::OS.to_string(),
                arch: std::env::consts::ARCH.to_string(),
                debug_assertions: cfg!(debug_assertions),
            }),
            tauri_versions: Some(Versions {
                tauri: tauri::VERSION.to_string(),
                webview: tauri::webview_version().ok(),
            }),
            tauri_config: None,
            // tauri_config: Some((&*app_handle.config()).into()),
        };

        let mut this = Self {
            rx,
            fd,
            scratch: Vec::new(),
        };

        this.record(&header)?;

        Ok(this)
    }

    pub async fn run(mut self) -> crate::Result<()> {
        while let Some(update) = self.rx.recv().await {
            self.record(&update)?;
        }
        Ok(())
    }

    pub fn record<T: prost::Message>(&mut self, data: &T) -> crate::Result<()> {
        data.encode_length_delimited(&mut self.scratch)?;
        self.fd.write_all(&self.scratch)?;
        self.fd.flush()?; // TODO is this necessary
        self.scratch.clear();
        Ok(())
    }
}

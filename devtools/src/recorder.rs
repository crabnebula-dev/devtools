use crate::aggregator::TimeAnchor;
use prost::Message;
use std::fs::File;
use std::io::Write;
use std::path::Path;
use tauri_devtools_wire_format::instrument;

pub(crate) struct Recorder {
    fd: File,
    base_time: TimeAnchor,
    scratch: Vec<u8>,
}

impl Recorder {
    pub fn new(path: &Path) -> crate::Result<Self> {
        let mut fd = File::create(path)?;

        fd.write_all(&1u8.to_le_bytes())?;

        Ok(Self {
            fd,
            base_time: TimeAnchor::new(),
            scratch: Vec::new(),
        })
    }

    pub fn record_update(&mut self, update: &instrument::Update) -> crate::Result<()> {
        update.encode_length_delimited(&mut self.scratch)?;
        self.fd.write_all(&self.scratch)?;
        self.fd.flush()?; // TODO is this necessary
        self.scratch.clear();
        Ok(())
    }
}

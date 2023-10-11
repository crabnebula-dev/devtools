pub use crate::generated::rs::devtools::tauri::*;

impl From<tauri::Asset> for Asset {
	fn from(value: tauri::Asset) -> Self {
		Self {
			bytes: value.bytes.into(),
			mime_type: value.mime_type,
			csp_header: value.csp_header,
		}
	}
}

// TODO improve this
impl<'a> From<&'a tauri::Config> for Config {
	fn from(value: &'a tauri::Config) -> Self {
		Self {
			raw: serde_json::to_string(&value).unwrap(),
		}
	}
}

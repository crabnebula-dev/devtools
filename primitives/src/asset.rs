use serde::{Deserialize, Serialize};

/// Represents an application asset.
///
/// An asset can be any form of data bundled with the application,
/// such as images, scripts, or stylesheets.
#[derive(Debug, Serialize, Clone)]
pub struct Asset {
	/// The asset bytes.
	pub bytes: Vec<u8>,
	/// The asset's mime type.
	pub mime_type: String,
	/// The `Content-Security-Policy` header value.
	pub csp_header: Option<String>,
}

impl Into<Asset> for tauri::Asset {
	fn into(self) -> Asset {
		Asset {
			bytes: self.bytes,
			mime_type: self.mime_type,
			csp_header: self.csp_header,
		}
	}
}

/// Parameters used to request a specific asset.
#[derive(Debug, Deserialize, Clone)]
pub struct AssetParams {
	/// The asset path.
	pub path: String,
}

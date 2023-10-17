pub use crate::generated::rs::devtools::tauri::*;

// TODO improve this
impl<'a> From<&'a tauri::Config> for Config {
	fn from(value: &'a tauri::Config) -> Self {
		Self {
			raw: serde_json::to_string(&value).unwrap(),
		}
	}
}

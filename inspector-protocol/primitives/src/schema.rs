use serde::{Deserialize, Serialize};
use std::{
	collections::HashMap,
	env,
	fs::OpenOptions,
	io::Read,
	path::{Path, PathBuf},
};

#[derive(Debug, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Schema {
	pub methods: HashMap<String, Method>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Method {
	pub doc: String,
	pub name: String,
	// typedef
	pub result: String,
	// typedef
	pub params: Option<String>,
	// if emitted by the server (subscription)
	pub subscription: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Subscription {
	pub doc: String,
	pub subscribe_params: Option<String>,
	pub subscribe_method_name: String,
	pub notif_method_name: String,
	// typedef eg: `LogEntry[]`
	pub notif_result: String,
	pub unsubscribe_method_name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TsType {
	pub doc: String,
	pub name: String,
	pub typescript: String,
	pub is_enum: bool,
}

pub fn metafile_path() -> String {
	match env::var("OUT_DIR") {
		Ok(out_dir) => Path::new(&out_dir)
			.join("inspector-protocol")
			.join("schemas")
			.join("devtools-api-spec.json")
			.into_os_string()
			.into_string()
			.unwrap(),
		Err(_e) => PathBuf::new()
			.join("inspector-protocol")
			.join("schemas")
			.join("devtools-api-spec.json")
			.into_os_string()
			.into_string()
			.unwrap(),
	}
}

pub fn get_schema() -> Schema {
	match OpenOptions::new().read(true).open(metafile_path().as_str()) {
		Ok(mut fd) => {
			let mut meta = String::new();
			fd.read_to_string(&mut meta).expect("Error reading meta file");
			serde_json::from_str(&meta).unwrap_or_default()
		}
		Err(_) => Schema::default(),
	}
}

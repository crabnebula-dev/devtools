use schemars::schema::RootSchema;
mod generated {
    #![allow(warnings)]
    include!("./generated/rs.devtools.tauri.rs");
}

pub use generated::*;

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

impl From<&RootSchema> for Schema {
    fn from(value: &RootSchema) -> Self {
        Self {
            raw: serde_json::to_string(&value).unwrap(),
        }
    }
}

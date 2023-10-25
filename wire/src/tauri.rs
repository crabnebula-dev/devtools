use schemars::schema::RootSchema;
mod generated {
    #![allow(warnings)]
    include!("./generated/rs.devtools.tauri.rs");
}

pub use generated::*;

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

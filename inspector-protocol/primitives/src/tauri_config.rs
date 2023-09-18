use std::sync::Arc;

use serde::{Deserialize, Serialize};
use typescript_type_def::TypeDef;

#[derive(Serialize, Deserialize, TypeDef)]
pub struct TauriConfig;

impl From<Arc<tauri::Config>> for TauriConfig {
	fn from(_config: Arc<tauri::Config>) -> Self {
		todo!()
	}
}

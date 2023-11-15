#[allow(clippy::derive_partial_eq_without_eq)]
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct RecordingHeader {
    #[prost(uint32, tag = "1")]
    pub version: u32,
    #[prost(message, optional, tag = "2")]
    pub app_metadata: ::core::option::Option<super::meta::AppMetadata>,
    #[prost(message, optional, tag = "3")]
    pub tauri_versions: ::core::option::Option<super::tauri::Versions>,
    #[prost(message, optional, tag = "4")]
    pub tauri_config: ::core::option::Option<super::tauri::Config>,
}

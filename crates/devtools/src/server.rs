use std::path::{Component, PathBuf};

use async_stream::try_stream;
use bytes::BytesMut;
use devtools_core::server::wire::{
    meta::{metadata_server, AppMetadata, AppMetadataRequest},
    sources::{sources_server::Sources, Chunk, Entry, EntryRequest, FileType},
    tauri::{
        tauri_server, Config, ConfigRequest, Metrics, MetricsRequest, Versions, VersionsRequest,
    },
};
use futures::{Stream, TryStreamExt};
use tauri::{AppHandle, Runtime};
use tonic::codegen::BoxStream;
use tonic::{Request, Response, Status};

pub struct TauriService<R: Runtime> {
    pub app_handle: AppHandle<R>,
}

pub struct SourcesService<R: Runtime> {
    pub app_handle: AppHandle<R>,
}

pub struct MetaService<R: Runtime> {
    pub app_handle: AppHandle<R>,
}

#[tonic::async_trait]
impl<R: Runtime> tauri_server::Tauri for TauriService<R> {
    async fn get_versions(
        &self,
        _req: Request<VersionsRequest>,
    ) -> Result<Response<Versions>, Status> {
        let versions = Versions {
            tauri: tauri::VERSION.to_string(),
            webview: tauri::webview_version().ok(),
        };

        Ok(Response::new(versions))
    }

    async fn get_config(&self, _req: Request<ConfigRequest>) -> Result<Response<Config>, Status> {
        let config: Config = Config {
            raw: serde_json::to_string(self.app_handle.config()).unwrap(),
        };

        Ok(Response::new(config))
    }

    async fn get_metrics(
        &self,
        _req: Request<MetricsRequest>,
    ) -> Result<Response<Metrics>, Status> {
        Ok(Response::new(Metrics::default()))
    }
}

#[tonic::async_trait]
impl<R: Runtime> Sources for SourcesService<R> {
    type ListEntriesStream = BoxStream<Entry>;

    async fn list_entries(
        &self,
        req: Request<EntryRequest>,
    ) -> Result<Response<Self::ListEntriesStream>, Status> {
        tracing::debug!("list entries");

        if self.app_handle.asset_resolver().iter().count() == 0 {
            #[cfg(any(target_os = "android", target_os = "ios"))]
            {
                return Err(Status::unavailable(
                    "listing entries on mobile is not supported on development",
                ));
            }
            #[cfg(not(any(target_os = "android", target_os = "ios")))]
            {
                let path = PathBuf::from(req.into_inner().path);

                // deny requests that contain special path components, like root dir, parent dir,
                // or weird windows ones. Only plain old regular, relative paths.
                if !path
                    .components()
                    .all(|c| matches!(c, Component::Normal(_) | Component::CurDir))
                {
                    return Err(Status::not_found("file with the specified path not found"));
                }

                let mut cwd = std::env::current_dir()?;
                cwd.push(path);

                let stream = self.list_entries_from_dir(cwd).or_else(|err| async move {
                    tracing::error!("List Entries failed with error {err:?}");
                    // TODO set the health service status to NotServing here
                    Err(Status::internal("boom"))
                });
                Ok(Response::new(Box::pin(stream)))
            }
        } else {
            let inner = req.into_inner();
            let path = inner.path.trim_end_matches('.');
            let stream = self
                .list_entries_from_assets(path)
                .or_else(|err| async move {
                    tracing::error!("List Entries failed with error {err:?}");
                    // TODO set the health service status to NotServing here
                    Err(Status::internal("boom"))
                });
            Ok(Response::new(Box::pin(stream)))
        }
    }

    type GetEntryBytesStream = BoxStream<Chunk>;

    async fn get_entry_bytes(
        &self,
        req: Request<EntryRequest>,
    ) -> Result<Response<Self::GetEntryBytesStream>, Status> {
        let entry_path = req.into_inner().path;
        let asset_path = entry_path.trim_start_matches('.');

        if let Some(asset) = self
            .app_handle
            .asset_resolver()
            .iter()
            .find(|(path, _bytes)| **path == asset_path)
            // decompress the asset
            .and_then(|(path, _bytes)| self.app_handle.asset_resolver().get((*path).to_string()))
        {
            let chunks = asset
                .bytes
                .chunks(512)
                .map(|b| {
                    Ok(Chunk {
                        bytes: bytes::Bytes::copy_from_slice(b),
                    })
                })
                .collect::<Vec<_>>();
            let stream = futures::stream::iter(chunks);
            Ok(Response::new(Box::pin(stream)))
        } else {
            let entry_path = PathBuf::from(entry_path);
            // deny requests that contain special path components, like root dir, parent dir,
            // or weird windows ones. Only plain old regular, relative paths.
            if !entry_path
                .components()
                .all(|c| matches!(c, Component::Normal(_) | Component::CurDir))
            {
                return Err(Status::not_found("file with the specified path not found"));
            }

            let mut path = std::env::current_dir()?;
            path.push(entry_path);

            let stream = try_stream! {
                use tokio::io::AsyncReadExt;
                let mut file = tokio::fs::File::open(path).await?;
                let mut buf = BytesMut::with_capacity(512);

                while let Ok(n) = file.read_buf(&mut buf).await {
                    if n == 0 {
                        break;
                    }
                    yield Chunk { bytes: buf.split().freeze() };
                }
            };

            Ok(Response::new(Box::pin(stream)))
        }
    }
}

impl<R: Runtime> SourcesService<R> {
    fn list_entries_from_assets(&self, root: &str) -> impl Stream<Item = crate::Result<Entry>> {
        let resolver = self.app_handle.asset_resolver();

        let mut entries: Vec<Entry> = Vec::new();
        for (asset_path, _bytes) in self.app_handle.asset_resolver().iter() {
            // strip `/` prefix
            let path: String = asset_path.chars().skip(1).collect();

            let mut entry_path = path;
            let mut entry_type = FileType::FILE;

            if root.is_empty() {
                if let Some((dir, _path)) = entry_path.split_once('/') {
                    entry_path = dir.to_string();
                    entry_type = FileType::DIR;
                }
            } else if let Some(p) = entry_path.strip_prefix(&format!("{root}/")) {
                if let Some((dir, _path)) = p.split_once('/') {
                    entry_path = dir.to_string();
                    entry_type = FileType::DIR;
                } else {
                    entry_path = p.to_string();
                }
            } else {
                // asset does not belong to root
                continue;
            }

            if !entries.iter().any(|e| e.path == entry_path) {
                entries.push(Entry {
                    path: entry_path,
                    // we use resolver.get since it increases the size sometimes (e.g. injecting CSP on HTML files)
                    size: resolver.get((*asset_path).to_string()).unwrap().bytes.len() as u64,
                    file_type: (FileType::ASSET | entry_type).bits(),
                });
            }
        }

        futures::stream::iter(entries.into_iter().map(Ok))
    }

    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    fn list_entries_from_dir(&self, root: PathBuf) -> impl Stream<Item = crate::Result<Entry>> {
        let app_handle = self.app_handle.clone();

        try_stream! {
            let mut entries = tokio::fs::read_dir(&root).await?;

            while let Some(entry) = entries.next_entry().await? {
                let raw_file_type = entry.file_type().await?;
                let mut file_type = FileType::empty();
                if raw_file_type.is_dir() {
                    file_type |= FileType::DIR;
                }
                if raw_file_type.is_file() {
                    file_type |= FileType::FILE;
                }
                if raw_file_type.is_symlink() {
                    file_type |= FileType::SYMLINK;
                }

                let path = entry.path();
                let path = path.strip_prefix(&root)?;

                let path = path.to_string_lossy().to_string();

                let is_asset = app_handle.asset_resolver().iter().any(|(p, _)| p.ends_with(&path));
                if is_asset {
                    file_type |= FileType::ASSET;
                }

                yield Entry {
                    path,
                    size: entry.metadata().await?.len(),
                    file_type: file_type.bits(),
                };
            }
        }
    }
}

#[tonic::async_trait]
impl<R: Runtime> metadata_server::Metadata for MetaService<R> {
    async fn get_app_metadata(
        &self,
        _req: Request<AppMetadataRequest>,
    ) -> Result<Response<AppMetadata>, Status> {
        let info = self.app_handle.package_info();

        let meta = AppMetadata {
            name: info.name.clone(),
            version: info.version.to_string(),
            authors: info.authors.to_string(),
            description: info.description.to_string(),
            os: std::env::consts::OS.to_string(),
            arch: std::env::consts::ARCH.to_string(),
            debug_assertions: cfg!(debug_assertions),
            has_embedded_assets: self.app_handle.asset_resolver().iter().count() > 0,
        };

        Ok(Response::new(meta))
    }
}

#[cfg(test)]
mod tests {
    use devtools_core::server::wire::tauri::tauri_server::Tauri;
    use futures::StreamExt;

    use super::*;

    #[tokio::test]
    async fn tauri_get_config() {
        let tauri = TauriService {
            app_handle: tauri::test::mock_app().handle().clone(),
        };

        let cfg = tauri
            .get_config(Request::new(ConfigRequest {}))
            .await
            .unwrap();

        assert_eq!(
            cfg.into_inner(),
            devtools_core::server::wire::tauri::Config {
                raw: serde_json::to_string(&*tauri.app_handle.config()).unwrap()
            }
        );
    }

    #[tokio::test]
    async fn sources_list_entries() {
        let app_handle = tauri::test::mock_app().handle().clone();
        let srv = SourcesService { app_handle };

        let stream = srv
            .list_entries(Request::new(EntryRequest {
                path: ".".to_string(),
            }))
            .await
            .unwrap();

        // this will list this crates directory, so should produce the `Cargo.toml`, `build.rs`, `.gitignore`, `ios` and `src` entry
        let entries: Vec<_> = stream.into_inner().collect().await;
        assert!(entries.len() > 0);
    }

    #[tokio::test]
    async fn sources_list_entries_root() {
        let app_handle = tauri::test::mock_app().handle().clone();
        let srv = SourcesService { app_handle };

        let res = srv
            .list_entries(Request::new(EntryRequest {
                path: "/".to_string(),
            }))
            .await;

        assert!(res.is_err(), "requesting the root path should fail");

        let res = srv
            .list_entries(Request::new(EntryRequest {
                path: "/foo/bar/this".to_string(),
            }))
            .await;

        assert!(res.is_err(), "requesting the root path should fail")
    }

    #[tokio::test]
    async fn sources_list_entries_parent() {
        let app_handle = tauri::test::mock_app().handle().clone();
        let srv = SourcesService { app_handle };

        let res = srv
            .list_entries(Request::new(EntryRequest {
                path: "../".to_string(),
            }))
            .await;

        assert!(res.is_err(), "requesting an absolute path should fail");

        let res = srv
            .list_entries(Request::new(EntryRequest {
                path: "foo/bar/../this".to_string(),
            }))
            .await;

        assert!(res.is_err(), "requesting an absolute path should fail");

        let res = srv
            .list_entries(Request::new(EntryRequest {
                path: "..".to_string(),
            }))
            .await;

        assert!(res.is_err(), "requesting an absolute path should fail")
    }

    #[tokio::test]
    async fn sources_get_bytes() {
        let app_handle = tauri::test::mock_app().handle().clone();
        let srv = SourcesService { app_handle };

        let stream = srv
            .get_entry_bytes(Request::new(EntryRequest {
                path: "./Cargo.toml".to_string(),
            }))
            .await
            .unwrap();

        // this will list this crates directory, so should produce a `Cargo.toml` and `src` entry
        let chunks: Vec<_> = stream.into_inner().collect().await;

        let mut buf = Vec::new();

        for chunk in chunks {
            buf.extend_from_slice(&chunk.unwrap().bytes);
        }

        // we don't want to hard code the exact size of Cargo.toml, that would be flaky
        // but it should definitely be larger than zero
        assert!(buf.len() > 0);
    }

    #[tokio::test]
    async fn sources_get_bytes_root() {
        let app_handle = tauri::test::mock_app().handle().clone();
        let srv = SourcesService { app_handle };

        let res = srv
            .get_entry_bytes(Request::new(EntryRequest {
                path: "/".to_string(),
            }))
            .await;

        assert!(res.is_err(), "requesting the root path should fail");

        let res = srv
            .get_entry_bytes(Request::new(EntryRequest {
                path: "/foo/bar/this".to_string(),
            }))
            .await;

        assert!(res.is_err(), "requesting the root path should fail")
    }

    #[tokio::test]
    async fn sources_get_bytes_parent() {
        let app_handle = tauri::test::mock_app().handle().clone();
        let srv = SourcesService { app_handle };

        let res = srv
            .get_entry_bytes(Request::new(EntryRequest {
                path: "../".to_string(),
            }))
            .await;

        assert!(res.is_err(), "requesting an absolute path should fail");

        let res = srv
            .get_entry_bytes(Request::new(EntryRequest {
                path: "foo/bar/../this".to_string(),
            }))
            .await;

        assert!(res.is_err(), "requesting an absolute path should fail");

        let res = srv
            .get_entry_bytes(Request::new(EntryRequest {
                path: "..".to_string(),
            }))
            .await;

        assert!(res.is_err(), "requesting an absolute path should fail")
    }
}

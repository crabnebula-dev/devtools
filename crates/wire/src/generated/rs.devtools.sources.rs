#[allow(clippy::derive_partial_eq_without_eq)]
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct EntryRequest {
    /// The path of the directory to list
    /// This is relative to the workspace root
    #[prost(string, tag = "1")]
    pub path: ::prost::alloc::string::String,
}
#[allow(clippy::derive_partial_eq_without_eq)]
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct Entry {
    /// The path of the entry relative to the workspace root
    #[prost(string, tag = "1")]
    pub path: ::prost::alloc::string::String,
    /// The size of the entry in bytes
    #[prost(uint64, tag = "2")]
    pub size: u64,
    /// A set of bitflags representing the type of the entry.
    /// The following entries are defined:
    /// 1 - Directory
    /// 2 - File
    /// 4 - Symbolic Link
    /// 8 - Asset
    /// 16 - Resource
    #[prost(uint32, tag = "3")]
    pub file_type: u32,
}
/// A chunk of bytes that make up a file
#[allow(clippy::derive_partial_eq_without_eq)]
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct Chunk {
    #[prost(bytes = "bytes", tag = "1")]
    pub bytes: ::prost::bytes::Bytes,
}
/// Generated server implementations.
#[allow(clippy::all)]
pub mod sources_server {
    #![allow(unused_variables, dead_code, missing_docs, clippy::let_unit_value)]
    use tonic::codegen::*;
    /// Generated trait containing gRPC methods that should be implemented for use with SourcesServer.
    #[async_trait]
    pub trait Sources: Send + Sync + 'static {
        /// Server streaming response type for the ListEntries method.
        type ListEntriesStream: tonic::codegen::tokio_stream::Stream<
                Item = std::result::Result<super::Entry, tonic::Status>,
            >
            + Send
            + 'static;
        /// Returns the entries of a directory in a streaming way. The idea is that this helps time-to-first-paint especially when the
        /// folder is large. The client can start rendering the entries as they come in.
        ///
        /// Notes:
        /// - All paths are relative to the workspace root. The idea is that clients do not need to know the absolute position of a workspace and with workspace-relative paths we can reduce the amount of PII sent.
        /// - This API DOES NOT recursively list workspace entries. The idea is that the client renders a tree-view with all sub-folder collapsed by default and issue a new list_entries call for a sub-folder when a tree node is expanded.
        /// - File type is a set of bitflags that represent the various properties of the entry. See the `Entry` message for more details.
        async fn list_entries(
            &self,
            request: tonic::Request<super::EntryRequest>,
        ) -> std::result::Result<
            tonic::Response<Self::ListEntriesStream>,
            tonic::Status,
        >;
        /// Server streaming response type for the GetEntryBytes method.
        type GetEntryBytesStream: tonic::codegen::tokio_stream::Stream<
                Item = std::result::Result<super::Chunk, tonic::Status>,
            >
            + Send
            + 'static;
        /// Returns the bytes of a file in a streaming way. The idea is that this helps time-to-first-paint especially when the file is large.
        /// This is done, again, to optimize the time to first paint for assets that are streaming compatible such as images.
        async fn get_entry_bytes(
            &self,
            request: tonic::Request<super::EntryRequest>,
        ) -> std::result::Result<
            tonic::Response<Self::GetEntryBytesStream>,
            tonic::Status,
        >;
    }
    #[derive(Debug)]
    pub struct SourcesServer<T: Sources> {
        inner: _Inner<T>,
        accept_compression_encodings: EnabledCompressionEncodings,
        send_compression_encodings: EnabledCompressionEncodings,
        max_decoding_message_size: Option<usize>,
        max_encoding_message_size: Option<usize>,
    }
    struct _Inner<T>(Arc<T>);
    impl<T: Sources> SourcesServer<T> {
        pub fn new(inner: T) -> Self {
            Self::from_arc(Arc::new(inner))
        }
        pub fn from_arc(inner: Arc<T>) -> Self {
            let inner = _Inner(inner);
            Self {
                inner,
                accept_compression_encodings: Default::default(),
                send_compression_encodings: Default::default(),
                max_decoding_message_size: None,
                max_encoding_message_size: None,
            }
        }
        pub fn with_interceptor<F>(
            inner: T,
            interceptor: F,
        ) -> InterceptedService<Self, F>
        where
            F: tonic::service::Interceptor,
        {
            InterceptedService::new(Self::new(inner), interceptor)
        }
        /// Enable decompressing requests with the given encoding.
        #[must_use]
        pub fn accept_compressed(mut self, encoding: CompressionEncoding) -> Self {
            self.accept_compression_encodings.enable(encoding);
            self
        }
        /// Compress responses with the given encoding, if the client supports it.
        #[must_use]
        pub fn send_compressed(mut self, encoding: CompressionEncoding) -> Self {
            self.send_compression_encodings.enable(encoding);
            self
        }
        /// Limits the maximum size of a decoded message.
        ///
        /// Default: `4MB`
        #[must_use]
        pub fn max_decoding_message_size(mut self, limit: usize) -> Self {
            self.max_decoding_message_size = Some(limit);
            self
        }
        /// Limits the maximum size of an encoded message.
        ///
        /// Default: `usize::MAX`
        #[must_use]
        pub fn max_encoding_message_size(mut self, limit: usize) -> Self {
            self.max_encoding_message_size = Some(limit);
            self
        }
    }
    impl<T, B> tonic::codegen::Service<http::Request<B>> for SourcesServer<T>
    where
        T: Sources,
        B: Body + Send + 'static,
        B::Error: Into<StdError> + Send + 'static,
    {
        type Response = http::Response<tonic::body::BoxBody>;
        type Error = std::convert::Infallible;
        type Future = BoxFuture<Self::Response, Self::Error>;
        fn poll_ready(
            &mut self,
            _cx: &mut Context<'_>,
        ) -> Poll<std::result::Result<(), Self::Error>> {
            Poll::Ready(Ok(()))
        }
        fn call(&mut self, req: http::Request<B>) -> Self::Future {
            let inner = self.inner.clone();
            match req.uri().path() {
                "/rs.devtools.sources.Sources/ListEntries" => {
                    #[allow(non_camel_case_types)]
                    struct ListEntriesSvc<T: Sources>(pub Arc<T>);
                    impl<
                        T: Sources,
                    > tonic::server::ServerStreamingService<super::EntryRequest>
                    for ListEntriesSvc<T> {
                        type Response = super::Entry;
                        type ResponseStream = T::ListEntriesStream;
                        type Future = BoxFuture<
                            tonic::Response<Self::ResponseStream>,
                            tonic::Status,
                        >;
                        fn call(
                            &mut self,
                            request: tonic::Request<super::EntryRequest>,
                        ) -> Self::Future {
                            let inner = Arc::clone(&self.0);
                            let fut = async move {
                                <T as Sources>::list_entries(&inner, request).await
                            };
                            Box::pin(fut)
                        }
                    }
                    let accept_compression_encodings = self.accept_compression_encodings;
                    let send_compression_encodings = self.send_compression_encodings;
                    let max_decoding_message_size = self.max_decoding_message_size;
                    let max_encoding_message_size = self.max_encoding_message_size;
                    let inner = self.inner.clone();
                    let fut = async move {
                        let inner = inner.0;
                        let method = ListEntriesSvc(inner);
                        let codec = tonic::codec::ProstCodec::default();
                        let mut grpc = tonic::server::Grpc::new(codec)
                            .apply_compression_config(
                                accept_compression_encodings,
                                send_compression_encodings,
                            )
                            .apply_max_message_size_config(
                                max_decoding_message_size,
                                max_encoding_message_size,
                            );
                        let res = grpc.server_streaming(method, req).await;
                        Ok(res)
                    };
                    Box::pin(fut)
                }
                "/rs.devtools.sources.Sources/GetEntryBytes" => {
                    #[allow(non_camel_case_types)]
                    struct GetEntryBytesSvc<T: Sources>(pub Arc<T>);
                    impl<
                        T: Sources,
                    > tonic::server::ServerStreamingService<super::EntryRequest>
                    for GetEntryBytesSvc<T> {
                        type Response = super::Chunk;
                        type ResponseStream = T::GetEntryBytesStream;
                        type Future = BoxFuture<
                            tonic::Response<Self::ResponseStream>,
                            tonic::Status,
                        >;
                        fn call(
                            &mut self,
                            request: tonic::Request<super::EntryRequest>,
                        ) -> Self::Future {
                            let inner = Arc::clone(&self.0);
                            let fut = async move {
                                <T as Sources>::get_entry_bytes(&inner, request).await
                            };
                            Box::pin(fut)
                        }
                    }
                    let accept_compression_encodings = self.accept_compression_encodings;
                    let send_compression_encodings = self.send_compression_encodings;
                    let max_decoding_message_size = self.max_decoding_message_size;
                    let max_encoding_message_size = self.max_encoding_message_size;
                    let inner = self.inner.clone();
                    let fut = async move {
                        let inner = inner.0;
                        let method = GetEntryBytesSvc(inner);
                        let codec = tonic::codec::ProstCodec::default();
                        let mut grpc = tonic::server::Grpc::new(codec)
                            .apply_compression_config(
                                accept_compression_encodings,
                                send_compression_encodings,
                            )
                            .apply_max_message_size_config(
                                max_decoding_message_size,
                                max_encoding_message_size,
                            );
                        let res = grpc.server_streaming(method, req).await;
                        Ok(res)
                    };
                    Box::pin(fut)
                }
                _ => {
                    Box::pin(async move {
                        Ok(
                            http::Response::builder()
                                .status(200)
                                .header("grpc-status", "12")
                                .header("content-type", "application/grpc")
                                .body(empty_body())
                                .unwrap(),
                        )
                    })
                }
            }
        }
    }
    impl<T: Sources> Clone for SourcesServer<T> {
        fn clone(&self) -> Self {
            let inner = self.inner.clone();
            Self {
                inner,
                accept_compression_encodings: self.accept_compression_encodings,
                send_compression_encodings: self.send_compression_encodings,
                max_decoding_message_size: self.max_decoding_message_size,
                max_encoding_message_size: self.max_encoding_message_size,
            }
        }
    }
    impl<T: Sources> Clone for _Inner<T> {
        fn clone(&self) -> Self {
            Self(Arc::clone(&self.0))
        }
    }
    impl<T: std::fmt::Debug> std::fmt::Debug for _Inner<T> {
        fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
            write!(f, "{:?}", self.0)
        }
    }
    impl<T: Sources> tonic::server::NamedService for SourcesServer<T> {
        const NAME: &'static str = "rs.devtools.sources.Sources";
    }
}

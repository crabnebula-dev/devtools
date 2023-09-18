use darling::ast::NestedMeta;
use darling::FromMeta;
use proc_macro::TokenStream;
use rpc_macro::RpcDescription;

mod rpc_macro;
#[cfg(feature = "schema-gen")]
mod utils;

#[derive(Debug, FromMeta)]
struct RpcArgs {
	#[darling(default)]
	namespace: Option<String>,
}

/// Annotate your struct implementations with `#[rpc]` to specify that it contains RPC methods.
/// Each method inside can be further annotated with either `#[method]` for typical RPC methods or
/// `#[subscription]` for methods that act as subscriptions.
///
/// ```rust,ignore
/// pub struct LogsApi;
///
/// #[rpc(namespace = "logs")]
/// impl LogsApi {
///     /// Subscribe to log events
///     #[subscription(subscribe = "watch", notif = "added", unsubscribe = "unwatch")]
///     fn logs<R: Runtime>(
///         inspector: Arc<Inspector<'static, R>>,
///     ) -> Result<BroadcastStream<Vec<LogEntry<'_>>>, ErrorCode> {
///         Ok(BroadcastStream::new(inspector.logs()))
///     }
/// }
/// ```
///
/// For standard RPC methods:
///
/// ```rust,ignore
/// #[rpc(namespace = "tauri")]
/// impl TauriApi {
///     /// Get Tauri config
///     #[method(name = "getConfig")]
///     fn get_config<'a, R: Runtime>(inspector: &'a Inspector<'_, R>) -> Result<TauriConfig, ErrorCode> {
///         Ok(inspector.app_handle().config().into())
///     }
/// }
/// ```
/// ## Arguments
/// - `namespace`: Specifies the namespace for the methods inside. This means if you specify a namespace of `logs`,
///   all methods inside that implementation will have their RPC names prefixed with `logs_`.
///   For example, a method named `fetch` will be exposed as `logs_fetch`.
///
/// ```rust,ignore
/// #[rpc(namespace = "logs")]
/// impl LogsApi {
///     ...
/// }
/// ```
///
/// ## `subscription`
///
/// The `subscription` attribute is used to define a method that supports WebSocket-based subscriptions.
///
/// ### Parameters:
///
/// - `subscribe`: Designates the method to be used to subscribe a client to a tokio broadcast channel.
/// - `notif`: Specifies the method that the server will call to emit notifications to subscribers when
///   there are new events on the channel.
/// - `unsubscribe`: Allows clients to unsubscribe and stop receiving events on the channel.
///
/// Together, these parameters allow you to have a method like `logs`, and it will generate three different methods:
/// `namespace_watch`, `namespace_added`, and `namespace_unwatch`.
///
/// ```rust,ignore
/// #[subscription(subscribe = "watch", notif = "added", unsubscribe = "unwatch")]
/// fn logs<R: Runtime>(
///     inspector: Arc<Inspector<'static, R>>,
/// ) -> Result<BroadcastStream<Vec<LogEntry<'_>>>, ErrorCode> {
///     ...
/// }
/// ```
///
/// ### `method`
///
/// The `method` attribute is used to specify that a particular function should be exposed as an RPC method.
///
/// #### Parameters:
///
/// - `name`: Specifies the RPC name for the function. If the `namespace` is set to `tauri` and the `name`
///   for the method is `getConfig`, the generated method will be `tauri_getConfig`.
///
/// ```rust,ignore
/// #[method(name = "getConfig")]
/// fn get_config<'a, R: Runtime>(inspector: &'a Inspector<'_, R>) -> Result<TauriConfig, ErrorCode> {
///     ...
/// }
/// ```
#[proc_macro_attribute]
pub fn rpc(attr: TokenStream, item: TokenStream) -> TokenStream {
	match rpc_impl(attr, item) {
		Ok(tokens) => tokens,
		Err(err) => err.to_compile_error(),
	}
	.into()
}

fn rpc_impl(attr: TokenStream, item: TokenStream) -> Result<proc_macro2::TokenStream, syn::Error> {
	let attr_args = NestedMeta::parse_meta_list(attr.into())?;
	let rpc_args = RpcArgs::from_list(&attr_args)?;
	let rpc_item = syn::parse(item)?;

	RpcDescription::try_from_item(rpc_args, rpc_item)?.render()
}

#[cfg(feature = "schema-gen")]
use crate::utils;
use crate::RpcArgs;
use darling::FromAttributes;
use inspector_protocol_primitives::schema;
use proc_macro2::TokenStream as TokenStream2;
use quote::{format_ident, quote, quote_spanned};
use syn::punctuated::Punctuated;
use syn::spanned::Spanned;
use syn::{Attribute, PathArguments, PathSegment, ReturnType};

/// Represents a RPC namespace. (eg.: `logs_*`) implementation.
///
/// This include at least one method or subscription.
#[derive(Debug)]
pub struct RpcDescription {
	pub(crate) namespace: Option<String>,
	pub(crate) impl_def: syn::ItemImpl,
	pub(crate) methods: Vec<RpcMethod>,
	pub(crate) subscriptions: Vec<RpcSubscription>,
}

/// Attributes for RPC methods.
#[derive(Debug, FromAttributes)]
#[darling(attributes(method))]
pub struct RpcMethodAttr {
	pub name: String,
}

/// Attributes for RPC subscriptions.
#[derive(Debug, FromAttributes)]
#[darling(attributes(subscription))]
pub struct RpcSubscriptionAttr {
	pub subscribe: String,
	pub notif: String,
	pub unsubscribe: String,
}

/// Represents an individual RPC method.
#[derive(Clone, Debug)]
pub struct RpcMethod {
	pub name: String,
	pub inner: syn::ImplItemFn,
	pub output_ident: syn::Path,
	pub param_ident: Option<syn::Ident>,
}

impl TryFrom<&syn::ImplItemFn> for RpcMethod {
	type Error = syn::Error;

	fn try_from(method: &syn::ImplItemFn) -> Result<Self, Self::Error> {
		let method_data = RpcMethodAttr::from_attributes(&method.attrs)?;

		let output_ident = if let ReturnType::Type(_, b) = &method.sig.output {
			extract_ident_from_result(b.as_ref())?
		} else {
			return Err(syn::Error::new_spanned(
				&method.sig.output,
				"Invalid type, expected `Result`",
			));
		};

		Ok(RpcMethod {
			name: method_data.name,
			inner: method.clone(),
			param_ident: extract_maybe_params_ident(&method.sig.inputs)?,
			output_ident,
		})
	}
}

/// Represents an individual RPC subscription.
#[derive(Clone, Debug)]
pub struct RpcSubscription {
	pub subscribe: String,
	pub notif: String,
	pub unsubscribe: String,
	pub inner: syn::ImplItemFn,
	pub output_ident: syn::Path,
	pub param_ident: Option<syn::Ident>,
}

impl TryFrom<&syn::ImplItemFn> for RpcSubscription {
	type Error = syn::Error;

	fn try_from(method: &syn::ImplItemFn) -> Result<Self, Self::Error> {
		let method_data = RpcSubscriptionAttr::from_attributes(&method.attrs)?;

		let output_ident = if let ReturnType::Type(_, b) = &method.sig.output {
			extract_ident_from_result(b.as_ref())?
		} else {
			return Err(syn::Error::new_spanned(
				&method.sig.output,
				"Invalid type, expected `Result`",
			));
		};

		Ok(RpcSubscription {
			subscribe: method_data.subscribe,
			notif: method_data.notif,
			unsubscribe: method_data.unsubscribe,
			inner: method.clone(),
			param_ident: extract_maybe_params_ident(&method.sig.inputs)?,
			output_ident,
		})
	}
}

impl RpcDescription {
	/// Try to constructs a new `RpcDescription` from the given implementation item.
	/// It analyzes the item to extract methods and subscriptions, validates them,
	/// and returns an `RpcDescription`.
	pub(crate) fn try_from_item(args: RpcArgs, mut item: syn::ItemImpl) -> syn::Result<Self> {
		item.attrs.clear(); // Remove RPC attributes.

		let mut methods = Vec::new();
		let mut subscriptions = Vec::new();

		// Go through all the methods in the impl and collect methods and
		// subscriptions.
		for entry in item.items.iter() {
			if let syn::ImplItem::Fn(method) = entry {
				let mut is_method = false;
				let mut is_sub = false;

				// #[method]
				if find_attr(&method.attrs, "method").is_some() {
					is_method = true;
					methods.push(RpcMethod::try_from(method)?);
				}

				// #[subscription]
				if find_attr(&method.attrs, "subscription").is_some() {
					is_sub = true;
					if is_method {
						return Err(syn::Error::new_spanned(
							method,
							"Element cannot be both subscription and method at the same time",
						));
					}

					subscriptions.push(RpcSubscription::try_from(method)?);
				}

				if !is_method && !is_sub {
					return Err(syn::Error::new_spanned(
						entry,
						"Methods must have either 'method' or 'subscription' attribute",
					));
				}
			} else {
				return Err(syn::Error::new_spanned(entry, "Only methods allowed in RPC impls"));
			}
		}

		if methods.is_empty() && subscriptions.is_empty() {
			return Err(syn::Error::new_spanned(&item, "RPC cannot be empty"));
		}

		Ok(Self {
			impl_def: item,
			methods,
			namespace: args.namespace,
			subscriptions,
		})
	}

	/// Generates the code that represents the current `RpcDescription`.
	pub fn render(self) -> syn::Result<TokenStream2> {
		#[cfg(feature = "schema-gen")]
		let mut schema = schema::get_schema();
		#[cfg(not(feature = "schema-gen"))]
		let mut schema = schema::Schema::default();

		let method_impls = self.render_methods(&mut schema)?;
		let subscription_impls = self.render_subscriptions(&mut schema)?;
		let typedef_test_impls = self.render_typedef_test()?;
		#[cfg(feature = "schema-gen")]
		let self_impl_ref = &self.impl_def.clone();

		let impl_ident = if let syn::Type::Path(path) = *self.impl_def.self_ty {
			path.path.require_ident().cloned()?
		} else {
			return Err(syn::Error::new_spanned(self.impl_def, "Invalid implementation"));
		};

		let tests_namespace = format_ident!(
			"__tests_{}",
			self.namespace.unwrap_or("inspector_protocol_server".into())
		);

		let trait_impl = quote! {
			impl #impl_ident {
				pub(crate) fn register<R: Runtime>(module: &mut ::jsonrpsee::RpcModule<Inspector<'static, R>>) -> crate::Result<()> {
					#method_impls
					#subscription_impls

					Ok(())
				}
			}

			#[cfg(test)]
			mod #tests_namespace {
				use super::*;
				use ::inspector_protocol_primitives::TypeDef as _;
				#typedef_test_impls
			}
		};

		#[cfg(feature = "schema-gen")]
		{
			use std::io::Write;
			let mut metafile = utils::metafile();
			metafile
				.write_all(&serde_json::to_vec_pretty(&schema).unwrap())
				.map_err(|e| syn::Error::new_spanned(self_impl_ref, e.to_string()))?;
		}

		Ok(trait_impl)
	}

	/// Generates Rust functions that test `TypeDef` impl for each method and subscription (params and results).
	/// These functions are meant to ensure that the defined types can be used as expected.
	fn render_typedef_test(&self) -> Result<TokenStream2, syn::Error> {
		let method_tests = self.methods.clone().into_iter().map(|method| {
			let output = &method.output_ident;
			let output_test_ident = format_ident!("__typedef_test_{}", method.name);
			let maybe_params = if let Some(param) = method.param_ident {
				let param_test_ident = format_ident!("__typedef_test_{}", param.to_string().to_lowercase());
				quote! {
					fn #param_test_ident() {
						let _ = #param::INFO;
					}
				}
			} else {
				quote! {}
			};

			quote! {
				fn #output_test_ident() {
					let _ = #output::INFO;
				}
				#maybe_params
			}
		});

		let subscription_tests = self.subscriptions.iter().map(|method| {
			let mut maybe_errors = Vec::new();
			let output = extract_ident_from_result_broadcast_stream(&method.output_ident.segments).unwrap_or_else(|_| {
				maybe_errors.push(quote_spanned!(method.output_ident.segments.span() => compile_error!("Invalid type, expected `BroadcastStream<Vec<T>>`");));
				// return undefined ident (we throw a compile error as well)
				format_ident!("___undefined")
			});

			let output_test_ident = format_ident!("__typedef_test_{}", method.subscribe);
			let maybe_params = if let Some(param) = &method.param_ident {
				let param_test_ident = format_ident!("__typedef_test_{}", param.to_string().to_lowercase());
				quote! {
					fn #param_test_ident() {
						let _ = #param::INFO;
					}
				}
			} else {
				quote! {}
			};

			quote! {
				fn #output_test_ident() {
					let _ = #output::INFO;
				}
				#maybe_params
				#(#maybe_errors)*
			}
		});

		Ok(quote! {
			#(#method_tests)*
			#(#subscription_tests)*
		})
	}

	/// Generates Rust code to register each RPC subscription, including necessary transformations
	/// to adhere to the expected function signatures and potential schema generation.
	fn render_subscriptions(&self, _schema: &mut schema::Schema) -> Result<TokenStream2, syn::Error> {
		let methods = self.subscriptions.clone().into_iter().map(|mut method| {
			let original_method_ident = method.inner.sig.ident.clone();
			let method_ident = format_ident!("__internal_{}", &original_method_ident);

			method.inner.sig.ident = method_ident.clone();

			let method_sig = &method.inner.sig;
			let method_block = &method.inner.block;

			let subscribe_method_name = if let Some(namespace) = &self.namespace {
				format!("{namespace}_{}", method.subscribe)
			} else {
				method.subscribe
			};

			let notif_method_name = if let Some(namespace) = &self.namespace {
				format!("{namespace}_{}", method.notif)
			} else {
				method.notif
			};

			let unsubscribe_method_name = if let Some(namespace) = &self.namespace {
				format!("{namespace}_{}", method.unsubscribe)
			} else {
				method.unsubscribe
			};

			let with_params = method_sig.inputs.len() == 2;

			let function_caller = if with_params {
				let param_ident = &method.param_ident;
				quote! {
					#method_ident(inspector, _maybe_params
						.parse::<#param_ident>()
						.map_err(|_| ErrorCode::InvalidParams)?
					)
				}
			} else {
				quote! {
					#method_ident(inspector)
				}
			};

			#[cfg(feature = "schema-gen")]
			{
				let doc = utils::get_docs(&method.inner.attrs);
				let notif_result = if let Some(ident) = method.output_ident.get_ident() {
					ident.to_string()
				} else {
					extract_ident_from_result_broadcast_stream(&method.output_ident.segments)
						.expect("qed: Invalid type, expected `BroadcastStream<Vec<T>>`")
						.to_string()
				};

				// subscribe method
				_schema.methods.insert(
					subscribe_method_name.clone(),
					schema::Method {
						doc,
						name: subscribe_method_name.clone(),
						result: "string".to_string(),
						params: method.param_ident.map(|i| i.to_string()).clone(),
						subscription: None,
					},
				);

				// unsubscribe method
				_schema.methods.insert(
					unsubscribe_method_name.clone(),
					schema::Method {
						doc: "".to_string(),
						name: unsubscribe_method_name.clone(),
						result: "boolean".to_string(),
						params: Some("string[]".to_string()),
						subscription: None,
					},
				);

				// notif (server event)
				_schema.methods.insert(
					notif_method_name.clone(),
					schema::Method {
						doc: "".to_string(),
						name: notif_method_name.clone(),
						// always an array
						result: format!("{notif_result}[]"),
						params: None,
						subscription: Some(subscribe_method_name.clone()),
					},
				);
			}

			quote! {
				#method_sig #method_block
				module.register_subscription(
					#subscribe_method_name,
					#notif_method_name,
					#unsubscribe_method_name,
					|_maybe_params, pending, inspector| async move {
						let __stream = #function_caller?;
						super::pipe_from_stream_with_bounded_buffer(pending, __stream).await?;
						Ok(())
					},
				)?;
			}
		});

		Ok(quote! {
			#(#methods)*
		})
	}

	/// Generates Rust code to register each RPC method, including necessary transformations
	/// to adhere to the expected function signatures and potential schema generation.
	fn render_methods(&self, _schema: &mut schema::Schema) -> syn::Result<TokenStream2> {
		let methods = self.methods.clone().into_iter().map(|mut method| {
			let method_ident = format_ident!("__internal_{}", method.inner.sig.ident);
			method.inner.sig.ident = method_ident.clone();

			let method_sig = &method.inner.sig;
			let method_block = &method.inner.block;
			let method_name = if let Some(namespace) = &self.namespace {
				format!("{namespace}_{}", method.name)
			} else {
				method.name
			};

			let with_params = method_sig.inputs.len() == 2;

			let param_ident = method.param_ident;
			let function_caller = if with_params {
				quote! {
					#method_ident(inspector, _maybe_params
						.parse::<#param_ident>()
						.map_err(|_| ErrorCode::InvalidParams)?
					)
				}
			} else {
				quote! {
					#method_ident(inspector)
				}
			};

			#[cfg(feature = "schema-gen")]
			{
				let doc = utils::get_docs(&method.inner.attrs);
				_schema.methods.insert(
					method_name.clone(),
					schema::Method {
						doc,
						name: method_name.clone(),
						// safe to use `expect` as we pre-validate the output
						result: method.output_ident.require_ident().expect("valid ident").to_string(),
						params: param_ident.map(|i| i.to_string()).clone(),
						subscription: None,
					},
				);
			}

			quote! {
				#method_sig #method_block
				module.register_method(#method_name, |_maybe_params, inspector| {
					let __result = #function_caller?;
					::serde_json::to_value(__result).map_err(|_| ErrorCode::InternalError)
				})?;
			}
		});

		Ok(quote! {
			#(#methods)*
		})
	}
}

/// Searches for an attribute in the given attributes list that matches the specified ident.
fn find_attr<'a>(attrs: &'a [Attribute], ident: &str) -> Option<&'a Attribute> {
	attrs.iter().find(|a| a.path().is_ident(ident))
}

/// Extracts the Identifier from the provided type, which is expected to represent a `BroadcastStream`.
fn extract_ident_from_result_broadcast_stream(
	ty: &Punctuated<PathSegment, syn::token::PathSep>,
) -> syn::Result<syn::Ident> {
	//assert_eq!(ty.first().unwrap().ident, "BroadcastStream");

	ty.iter()
		.find_map(|s| {
			if let PathArguments::AngleBracketed(bracket) = &s.arguments {
				if let Some(syn::GenericArgument::Type(syn::Type::Path(syn_path))) = bracket.args.first() {
					let first_segment = syn_path.path.segments.first().unwrap();
					if let PathArguments::AngleBracketed(a) = &first_segment.arguments {
						let vec_container = a.args.first().unwrap();
						if let syn::GenericArgument::Type(syn::Type::Path(syn_path)) = vec_container {
							return Some(syn_path.path.segments.first().unwrap().ident.clone());
						}
					}
				}
			}

			None
		})
		.ok_or(syn::Error::new_spanned(
			ty,
			"Invalid type, expected `BroadcastStream<Vec<T>>`",
		))
}

/// Extracts the path from the given type, assuming it's a `Result` type.
fn extract_ident_from_result(ty: &syn::Type) -> syn::Result<syn::Path> {
	fn path_is_result(path: &syn::Path) -> bool {
		path.leading_colon.is_none()
			&& path.segments.len() == 1
			&& path.segments.iter().next().unwrap().ident == "Result"
	}

	match ty {
		syn::Type::Path(typepath) if typepath.qself.is_none() && path_is_result(&typepath.path) => {
			extract_ident(typepath)
		}
		_ => Err(syn::Error::new_spanned(ty, "Invalid type, expected `Result`")),
	}
}

/// Extracts the path from the provided `TypePath`.
fn extract_ident(typepath: &syn::TypePath) -> syn::Result<syn::Path> {
	let type_params = typepath.path.segments.first().map(|segment| segment.arguments.clone());

	if let Some(PathArguments::AngleBracketed(params)) = type_params {
		if let Some(syn::GenericArgument::Type(ty)) = params.args.first() {
			match ty {
				// direct path
				syn::Type::Path(path) => return Ok(path.path.clone()),
				// support reference as well
				syn::Type::Reference(path_ref) => {
					if let syn::Type::Path(path) = path_ref.elem.as_ref() {
						return extract_ident(path);
					}
				}
				_ => {}
			}
		}
	} else if let Some(PathArguments::None) = type_params {
		return Ok(typepath.path.clone());
	}

	Err(syn::Error::new_spanned(typepath, "Unable to extract ident"))
}

/// Extract params for methods and subscriptions
/// We expect the `inspector` to be the first params and the second params (optional)
/// is the method parameter (sent from the client).
fn extract_maybe_params_ident(inputs: &Punctuated<syn::FnArg, syn::token::Comma>) -> syn::Result<Option<syn::Ident>> {
	let result = if inputs.len() == 2 {
		if let syn::FnArg::Typed(typed) = &inputs[1] {
			match typed.ty.as_ref() {
				syn::Type::Path(path) => Some(path.path.require_ident()?),
				_ => None,
			}
		} else {
			None
		}
		.cloned()
	} else {
		None
	};

	Ok(result)
}

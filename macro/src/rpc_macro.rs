#[cfg(feature = "schema-gen")]
use crate::utils;
use crate::RpcArgs;
use darling::FromAttributes;
use inspector_protocol_primitives::schema;
use proc_macro2::TokenStream as TokenStream2;
use quote::{format_ident, quote};
use syn::punctuated::Punctuated;
use syn::{Attribute, PathArguments, PathSegment, ReturnType};

#[derive(Debug)]
pub struct RpcDescription {
	pub(crate) namespace: Option<String>,
	pub(crate) impl_def: syn::ItemImpl,
	pub(crate) methods: Vec<RpcMethod>,
	pub(crate) subscriptions: Vec<RpcSubscription>,
}

#[derive(Debug, FromAttributes)]
#[darling(attributes(method))]
pub struct RpcMethodAttr {
	pub name: String,
}

#[derive(Debug, FromAttributes)]
#[darling(attributes(subscription))]
pub struct RpcSubscriptionAttr {
	pub subscribe: String,
	pub notif: String,
	pub unsubscribe: String,
}

#[derive(Clone, Debug)]
pub struct RpcMethod {
	pub name: String,
	pub inner: syn::ImplItemFn,
	pub output_ident: syn::Path,
	pub param_ident: Option<syn::Ident>,
}

#[derive(Clone, Debug)]
pub struct RpcSubscription {
	pub subscribe: String,
	pub notif: String,
	pub unsubscribe: String,
	pub inner: syn::ImplItemFn,
	pub output_ident: syn::Path,
	pub param_ident: Option<syn::Ident>,
}

impl RpcDescription {
	pub(crate) fn from_item(args: RpcArgs, mut item: syn::ItemImpl) -> syn::Result<Self> {
		item.attrs.clear(); // Remove RPC attributes.

		let mut methods = Vec::new();
		let mut subscriptions = Vec::new();

		// Go through all the methods in the trait and collect methods and
		// subscriptions.
		for entry in item.items.iter() {
			if let syn::ImplItem::Fn(method) = entry {
				let mut is_method = false;
				let mut is_sub = false;

				if let Some(attr) = find_attr(&method.attrs, "method") {
					is_method = true;

					let method_data = RpcMethodAttr::from_attributes(&[attr.clone()])?;

					let output_ident = if let ReturnType::Type(_, b) = &method.sig.output {
						extract_ident_from_result(b.as_ref())
					} else {
						unimplemented!()
					};

					let param_ident = if method.sig.inputs.len() == 2 {
						if let syn::FnArg::Typed(typed) = &method.sig.inputs[1] {
							match typed.ty.as_ref() {
								syn::Type::Path(path) => Some(path.path.get_ident().expect("valid ident")),
								_ => None,
							}
						} else {
							None
						}
						.cloned()
					} else {
						None
					};

					methods.push(RpcMethod {
						name: method_data.name,
						inner: method.clone(),
						param_ident,
						output_ident,
					});
				}

				if let Some(attr) = find_attr(&method.attrs, "subscription") {
					is_sub = true;
					if is_method {
						return Err(syn::Error::new_spanned(
							method,
							"Element cannot be both subscription and method at the same time",
						));
					}

					let method_data = RpcSubscriptionAttr::from_attributes(&[attr.clone()])?;

					let output_ident = if let ReturnType::Type(_, b) = &method.sig.output {
						extract_ident_from_result(b.as_ref())
					} else {
						unimplemented!()
					};

					let param_ident = if method.sig.inputs.len() == 2 {
						if let syn::FnArg::Typed(typed) = &method.sig.inputs[1] {
							match typed.ty.as_ref() {
								syn::Type::Path(path) => Some(path.path.get_ident().expect("valid ident")),
								_ => None,
							}
						} else {
							None
						}
						.cloned()
					} else {
						None
					};

					subscriptions.push(RpcSubscription {
						subscribe: method_data.subscribe,
						notif: method_data.notif,
						unsubscribe: method_data.unsubscribe,
						inner: method.clone(),
						param_ident,
						output_ident,
					});
				}

				if !is_method && !is_sub {
					return Err(syn::Error::new_spanned(
						method,
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

	pub fn render(self) -> Result<TokenStream2, syn::Error> {
		#[cfg(feature = "schema-gen")]
		let mut schema = schema::get_schema();
		#[cfg(not(feature = "schema-gen"))]
		let mut schema = schema::Schema::default();

		let method_impls = self.render_methods(&mut schema)?;
		let subscription_impls = self.render_subscriptions(&mut schema)?;
		let typedef_test_impls = self.render_typedef_test()?;

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
				.unwrap();
		}

		Ok(trait_impl)
	}

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

		let subscription_tests = self.subscriptions.clone().into_iter().map(|method| {
			let output = extract_ident_from_result_broadcast_stream(&method.output_ident.segments);
			let output_test_ident = format_ident!("__typedef_test_{}", method.subscribe);
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

		Ok(quote! {
			#(#method_tests)*
			#(#subscription_tests)*
		})
	}

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
					extract_ident_from_result_broadcast_stream(&method.output_ident.segments).to_string()
				};

				// subscribe method
				_schema.methods.insert(
					subscribe_method_name.clone(),
					schema::Method {
						doc,
						name: subscribe_method_name.clone(),
						result: "string".to_string(),
						params: method.param_ident.map(|i| i.to_string()).clone(),
						server_event: false,
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
						server_event: false,
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
						server_event: true,
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

	fn render_methods(&self, _schema: &mut schema::Schema) -> Result<TokenStream2, syn::Error> {
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
						result: method.output_ident.get_ident().unwrap().to_string(),
						params: param_ident.map(|i| i.to_string()).clone(),
						server_event: false,
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

fn find_attr<'a>(attrs: &'a [Attribute], ident: &str) -> Option<&'a Attribute> {
	attrs.iter().find(|a| a.path().is_ident(ident))
}

fn extract_ident_from_result_broadcast_stream(ty: &Punctuated<PathSegment, syn::token::PathSep>) -> syn::Ident {
	assert_eq!(ty.first().unwrap().ident, "BroadcastStream");

	ty.iter()
		.find_map(|s| match &s.arguments {
			PathArguments::AngleBracketed(a) => {
				let expected_vec = a.args.first().expect("vec");
				match expected_vec {
					syn::GenericArgument::Type(syn_type) => match syn_type {
						syn::Type::Path(syn_path) => {
							let first_segment = syn_path.path.segments.first().unwrap();
							assert_eq!(first_segment.ident, "Vec");
							match &first_segment.arguments {
								PathArguments::AngleBracketed(a) => {
									let vec_container = a.args.first().unwrap();
									match vec_container {
										syn::GenericArgument::Type(syn_type) => match syn_type {
											syn::Type::Path(syn_path) => {
												return Some(syn_path.path.segments.first().unwrap().ident.clone());
											}
											_ => unimplemented!(),
										},
										_ => unimplemented!(),
									}
								}
								_ => unimplemented!(),
							}
						}
						_ => unimplemented!(),
					},
					_ => unimplemented!(),
				}
			}
			_ => unimplemented!(),
		})
		.unwrap()
}

fn extract_ident_from_result(ty: &syn::Type) -> syn::Path {
	fn path_is_result(path: &syn::Path) -> bool {
		path.leading_colon.is_none()
			&& path.segments.len() == 1
			&& path.segments.iter().next().unwrap().ident == "Result"
	}

	match ty {
		syn::Type::Path(typepath) if typepath.qself.is_none() && path_is_result(&typepath.path) => {
			extract_ident(typepath)
		}
		_ => unimplemented!("{ty:?}"),
	}
}

fn extract_ident(typepath: &syn::TypePath) -> syn::Path {
	let type_params = typepath.path.segments.first().unwrap().arguments.clone();
	match type_params {
		PathArguments::AngleBracketed(params) => match params.args.first().unwrap().clone() {
			syn::GenericArgument::Type(ty) => match ty {
				syn::Type::Path(path) => path.path.clone(),
				syn::Type::Reference(path_ref) => match path_ref.elem.as_ref() {
					syn::Type::Path(path) => extract_ident(path),
					_ => unimplemented!(),
				},
				_ => unimplemented!(),
			},
			_ => unimplemented!(),
		},
		PathArguments::None => typepath.path.clone(),
		_ => unimplemented!(),
	}
}

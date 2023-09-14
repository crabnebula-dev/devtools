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

	let trait_data: syn::ItemImpl = syn::parse(item.clone())?;
	let rpc = RpcDescription::from_item(rpc_args, trait_data)?;
	rpc.render()
}

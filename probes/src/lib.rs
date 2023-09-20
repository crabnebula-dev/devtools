mod args;

use proc_macro::TokenStream;
use quote::quote;
use args::Args;

// This just makes printing the `tracing::span` declaration less verbose
macro_rules! print_span {
	($lvl:expr, $name:expr) => {
		proc_macro::TokenStream::from(quote! {
			 tracing::span!($lvl, $name);
		})
	};
	($lvl:expr, $name:expr, $($id:ident),+) => {
		proc_macro::TokenStream::from(quote! {
			 tracing::span!($lvl, $name, $($id = #$id),*)
		})
	}
}

#[proc_macro]
pub fn ipc_request(input: TokenStream) -> TokenStream {
	let args = syn::parse_macro_input!(input as Args);

	let id = args.expect_integer("id");
	let cmd = args.expect_str("cmd");
	let kind = args.expect_str("kind");
	let line = args.expect_integer("line");
	let col = args.expect_integer("col");

	print_span!(tracing::Level::DEBUG, "ipc::request", id, cmd, kind, line, col)
}
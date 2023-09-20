//! The shared argument type for all macros
//!
//! Just a fancy parsing wrapper around `{ ident: expr }`

use syn::{Expr, FieldValue, Lit, LitInt, LitStr, Member, token};
use syn::punctuated::Punctuated;
use syn::ExprLit;
use std::collections::HashMap;
use syn::parse::{Parse, ParseStream};

pub struct Args(HashMap<String, Expr>);

impl Args {
    /// Returns the argument with the given `name`, asserting it to be an integer
    pub fn expect_integer(&self, name: &str) -> &LitInt {
        let Some(expr) = self.0.get(name) else {
            panic!("missing required field {}", name)
        };

        let Expr::Lit(ExprLit { lit: Lit::Int(val), .. }) = expr else {
            panic!("{} is not an integer", name);
        };

        val
    }

    /// Returns the argument with the given `name`, asserting it to be a string
    pub fn expect_str(&self, name: &str) -> &LitStr {
        let Some(expr) = self.0.get(name) else {
            panic!("missing required field {}", name)
        };

        let Expr::Lit(ExprLit { lit: Lit::Str(val), .. }) = expr else {
            panic!("{} is not a string", name);
        };

        val
    }
}

impl Parse for Args {
    fn parse(input: ParseStream) -> syn::Result<Self> {
        let content;
        syn::braced!(content in input);


        let args = Punctuated::<FieldValue, token::Comma>::parse_terminated(&content)?;
        let args = args.into_pairs().map(|p| {
            let value = p.into_value();

            let ident = match value.member {
                Member::Named(ident) => ident.to_string(),
                _ => panic!()
            };

            (ident, value.expr)
        });

        Ok(Self(HashMap::from_iter(args)))
    }
}
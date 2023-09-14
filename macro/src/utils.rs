use inspector_protocol_primitives::schema::metafile_path;
use std::fs::{self, OpenOptions};
use syn::{Attribute, Meta};

pub fn metafile() -> fs::File {
	OpenOptions::new()
		.write(true)
		.truncate(true)
		.create(true)
		.open(metafile_path().as_str())
		.expect("Error opening meta file")
}

pub fn get_docs(attrs: &Vec<Attribute>) -> String {
	let mut doc: Vec<String> = vec![];
	for attr in attrs {
		if let Meta::NameValue(meta) = &attr.meta {
			if !meta.path.is_ident("doc") {
				continue;
			}
			if let syn::Expr::Lit(lit) = &meta.value {
				if let syn::Lit::Str(raw_doc) = &lit.lit {
					doc.push(raw_doc.value());
				}
			}
		}
	}

	if !doc.is_empty() {
		format!("/**\n  *{}\n  **/\n", doc.join("\n  *"))
	} else {
		String::new()
	}
}

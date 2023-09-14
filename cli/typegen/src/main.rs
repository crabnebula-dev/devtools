use inspector_protocol_primitives::TypeScriptDef;
use std::path::PathBuf;
use typescript_type_def::{write_definition_file, DefinitionFileOptions};

fn main() {
	let path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
		.parent()
		.unwrap()
		.parent()
		.unwrap()
		.join("schemas")
		.join("devtools.d.ts");

	let mut file = std::fs::File::create(&path).unwrap();

	// FIXME: We are exposing them manually, but at long term,
	// it could be simplified by loading it from the schema.json
	let stats = write_definition_file::<_, TypeScriptDef<'static>>(
		&mut file,
		DefinitionFileOptions {
			header: "/* crabnebula header */".into(),
			root_namespace: None,
		},
	)
	.unwrap();

	println!(
		"Wrote {} type definitions to {}",
		stats.type_definitions,
		path.into_os_string().into_string().unwrap()
	);
}

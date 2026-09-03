use std::{fs, path::PathBuf, process::Command};

fn main() {
    gen_proto(false);
}

#[test]
fn test_proto_is_clean() {
    gen_proto(true);
}

fn gen_proto(check: bool) {
    let wire_build_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let wire_dir = wire_build_dir
        .join("..")
        .join("wire")
        .canonicalize()
        .expect("wire should be a sibling crate");
    let proto_dir = wire_dir.join("proto");
    let proto_ext = std::ffi::OsStr::new("proto");
    let proto_files = fs::read_dir(&proto_dir).and_then(|dir| {
        dir.filter_map(|entry| {
            (|| {
                let entry = entry?;
                if entry.file_type()?.is_dir() {
                    return Ok(None);
                }

                let path = entry.path();
                if path.extension() != Some(proto_ext) {
                    return Ok(None);
                }

                Ok(Some(path))
            })()
            .transpose()
        })
        .collect::<Result<Vec<_>, _>>()
    });
    let proto_files = match proto_files {
        Ok(files) => files,
        Err(error) => panic!("failed to list proto files: {error}"),
    };

    let out_dir = wire_dir.join("src").join("generated");

    tonic_prost_build::configure()
        .build_server(true)
        .build_client(false)
        .protoc_arg("--experimental_allow_proto3_optional")
        .enum_attribute("rs.tauri.devtools.common.Field.name", "#[derive(Hash, Eq)]")
        .server_mod_attribute(".", "#[allow(clippy::all)]")
        .out_dir(&out_dir)
        .compile_protos(&proto_files, &[proto_dir])
        .unwrap();

    if check {
        // a neat trick from tokio-console: fail if the generated files are not committed.
        // Especially useful in CI
        let status = Command::new("git")
            .arg("diff")
            .arg("--exit-code")
            .arg("--")
            .arg(out_dir)
            .status();

        match status {
            Ok(status) if !status.success() => panic!("You should commit the protobuf files"),
            Err(error) => panic!("failed to run `git diff`: {error}"),
            Ok(_) => {}
        }
    }
}

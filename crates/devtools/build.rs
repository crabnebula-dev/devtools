use std::fs::remove_dir_all;

const COMMANDS: &[&str] = &[];

fn main() {
    tauri_plugin::Builder::new(COMMANDS).ios_path("ios").build();
    // delete the permissions folder since we're not using defining any commands
    // this should be done by Tauri instead
    remove_dir_all("./permissions/").expect("failed to delete permissions folder");
}

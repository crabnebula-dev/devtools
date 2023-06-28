use minidumper_child::MinidumperChild;
use std::path::Path;

fn main() {
    // Everything before here runs in both app and crash reporter processes
    let _guard = MinidumperChild::new()
        .on_minidump(|buffer: Vec<u8>, path: &Path| {
            println!("received crashdump");
            std::fs::copy(path, "./crashdump").unwrap();
            // std::fs::write("./dump", buffer).unwrap();
        })
        .spawn()
        .unwrap();

    #[allow(deref_nullptr)]
    unsafe {
        *std::ptr::null_mut() = true;
    }
    // unsafe {
    //     sadness_generator::raise_segfault();
    // }
}

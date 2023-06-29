use std::time::Duration;

fn main() {
    crash_recovery::init();

    std::thread::sleep(Duration::from_secs(10));

    unsafe { sadness_generator::raise_segfault() }
}

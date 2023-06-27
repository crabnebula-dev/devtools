fn main() {
    let handler = crash_recovery::init();

    cfg_if::cfg_if! {
        if #[cfg(any(target_os = "linux", target_os = "android"))] {
            handler.simulate_signal(crash_handler::Signal::Segv);
        } else if #[cfg(windows)] {
            handler.simulate_exception(None);
        } else if #[cfg(target_os = "macos")] {
            handler.simulate_exception(None);
        }
    }
}

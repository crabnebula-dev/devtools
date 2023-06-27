fn main() {
    let runtime = tokio::runtime::Builder::new_multi_thread()
        .enable_io()
        .enable_time()
        .build()
        .unwrap();
    let _enter = runtime.enter();

    crash_recovery::init(|handler| {
        cfg_if::cfg_if! {
            if #[cfg(any(target_os = "linux", target_os = "android"))] {
                handler.simulate_signal(crash_handler::Signal::Segv);
            } else if #[cfg(windows)] {
                handler.simulate_exception(None);
            } else if #[cfg(target_os = "macos")] {
                handler.simulate_exception(None);
            }
        }
    });
}

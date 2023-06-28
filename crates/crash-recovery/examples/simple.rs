fn main() {
    crash_recovery::init();

    unsafe { sadness_generator::raise_segfault() }
}

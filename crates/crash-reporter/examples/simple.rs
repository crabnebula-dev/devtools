fn main() {
    crash_reporter::init();

    unsafe { sadness_generator::raise_segfault() }
}

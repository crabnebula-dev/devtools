

## Features

| Feature             | Description                                                                                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `nightly-thread-id` | Opt-in to use [`std::thread::ThreadId`](https://doc.rust-lang.org/std/thread/struct.ThreadId.html) that is currently nightly-only instead of the polyfill provided by this crate. The only consequence is that reported thread IDs might look different |
// Dev note; I used the following command to normalize and wrap comments:
// `rustfmt +nightly --config wrap_comments=true,comment_width=100,normalize_comments=true
// inspector-protocol/src/book/**` It messed up comments in code blocks though, so be prepared to go
// and fix those.

//! # The Inspector Protocol Guide
//!
//! Designed as a Tauri plugin, its seamless integration requires just a single line of code to
//! supercharge your Tauri application. Central to this is the protocol server that employs
//! WebSockets, enhancing two-way communication and subscription capabilities. As clients subscribe
//! to specific channels, the Tauri app broadcasts events in real-time, creating a dynamic
//! environment for debugging and development.
//!
//! 1. [Features](#features)
//! 2. [Limitations](#limitations)
//! 3. [Quick start](#quick-start)
//! 4. [Usage](#usage)
//!
//! ## Features
//!
//! Inspector Protocol's toolkit is rich and varied. Here's a snapshot of what's on offer:
//!
//! - Leveraging the power and simplicity of WebSockets ensures cross-compatibility with the web,
//!   making client creation straightforward.
//!
//! - Enables both request-response and subscription-based interactions. This dynamic communication
//!   model means that the client and server can push data to one another in real-time.
//!
//! - Built with performance in mind, ensuring that real-time data exchange happens with minimal
//!   latency.
//!
//! - Direct access to Tauri's runtime, windows, and configuration. This means developers can peek
//!   and poke into the very heart of their application's runtime environment.
//!
//! - Get a real-time view of the EventLoop, making it easier to understand asynchronous events and
//!   tasks.
//!
//! - Designed to be lightweight, ensuring that it doesn't burden the main application's
//!   performance.
//!
//! - Whether you're running on MacOS, Windows, or Linux, the Inspector Protocol has got you
//!   covered.
//!
//! ## Limitations
//!
//! While the Inspector Protocol is a powerful tool, it's worth noting a few limitations:
//!
//! - While the plugin provides a plethora of insights, it might not access the intricate details a
//!   core integration would offer, particularly those related to network or IPC requests.
//! - The current version lacks support for spans/callsites tracking.
//!
//! ## Quick start
//!
//! Here's a concise example showcasing the use of the Inspector Protocol in a Tauri [Tauri](https://tauri.app) application:
//!
//! ```rust,ignore
#![doc = include_str!("../../../examples/tauri/main.rs")]
//! ```
//!
//! ## Usage
//!
//! Once your plugin is in place, it's time to launch your application. When initiated, the console will reveal the details of the WebSocket's random port. Here's what to do:
//! ```bash
//! cargo run -- --inspect
//! ```
//!
//! Upon execution, you should receive:
//! ```
//! --------- Tauri Inspector Protocol ---------
//!
//! Listening at:
//!   ws://127.0.0.1:64269
//!
//! Inspect in browser:
//!   https://crabnebula.dev/debug/#127.0.0.1:64269
//!
//! --------- Tauri Inspector Protocol ---------
//! ```

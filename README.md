# Inspector Protocol Plugin

Inspect, monitor, and understand your [Tauri](https://tauri.app) application with ease.

The Inspector Protocol Plugin offers a seamless integration to Tauri applications, giving developers an intuitive and efficient way to understand internal tracing events and extract valuable insights about their applications.

## Features
- **Easy Integration:** With just a line of code, enable detailed event logging and metadata extraction for your application.
- **Rich Insights:** Transform internal tracing events for further processing or storage.
- **Extensible:** Built with flexibility in mind, allowing developers to customize and extend its capabilities.

## Installation

Ensure you have [Tauri](https://tauri.app) set up correctly. Then, add the following to your `Cargo.toml`:

```toml
[dependencies]
inspector_protocol = "0.1.0" # use the latest version
```

## Usage

Integrating the Inspector Protocol Plugin into your Tauri application is as simple as adding a plugin to the Tauri builder:

```rust
fn main() {
   let inspector = inspector_protocol::Builder::new();
   tauri::Builder::default()
      .plugin(inspector.build())
      .run(tauri::generate_context!("./tauri.conf.json"))
      .expect("error while running tauri application");
}
```

Take a look in the [examples](./examples) folder for more details.

## Documentation

Detailed comments have been embedded into the source code to provide insights about the different components and how they work. For more intricate details about specific functionalities, please refer to the codebase.

```
cargo doc --open
```

## Future Enhancements

We are continually working on improving and expanding the capabilities of the Inspector Protocol Plugin. Any feedback or contributions are welcome!

## License

<sup>

The Instrumentation (i.e. the folders `/plugin`, `/primitives`, `/server` and `/subscriber`) is licensed under either
of [Apache License, Version 2.0](./LICENSES/Apache-2.0.md) or [MIT license](./LICENSES/MIT.md)  at your option.

All other code is licensed under the [PolyForm Noncommercial License 1.0.0](./LICENSES/Polyform-Noncommercial.md).

</sup>

<br>

<sub>
Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in this project by you, shall be licensed as above, without any 
additional terms or conditions.
</sub>


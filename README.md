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
   tauri::Builder::default()
      .plugin(inspector_protocol::Builder::new().build())
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

__Need to be defined__

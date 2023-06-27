<p align="center">
  <img src="./icon.png" width="120">
</p>
<h3 align="center"><code>CN devtools</code></h3>
<p align="center">
<strong>Inspect and Debug your Tauri applications in style 💃</strong>
<br />
<strong><i>Work In Progress</i></strong>
<br/>

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

</p>

> **Note**: This project is under active development, features might have big, be only partially implemented or outright missing.
> Almost everything about this project is work in progress even the name! If you're interested in improving the Tauri debug experience:
>
> Contributions are very welcome, get in touch!

## Using CN devtools

This project consists of two parts: The instrumentation library and the visualization client. You will need both in order to debug Rust programs.

### Adding the instrumentation library

The instrumentation library can be used like any regular Rust `log` or `tracing` frontend. Add it to your crate's dependencies:

```toml
subscriber = { git = "https://github.com/crabnebula-dev/devtools" }
```

And initialize it in your main function. It is important that you initialize it **as early as possible**

```rust
fn main() {
  let context = tauri::generate_context!();

  subscriber::init(&context);

  tauri::Builder::default()
      .run(context)
      .expect("error while running tauri application");
}
```

### Installing the client

The client gathers the data collected by the instrumentation library and presents it in a human readable and interactive way. There are currently no pre-compiled builds so you will have to build it from source (make sure you have all the [prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites) to build tauri apps!)

```shell
# clone the git repo
git clone https://github.com/crabnebula-dev/devtools

# build the app
cargo tauri build
```

Now you can run the app! Active instrumented apps on your local network will appear in the "Live Sessions" section

![Screenshot of the session selector](Screenshot.png)

## Features

- [ ] Command Performance Profiling
- [ ] Events Console

## Contributing

TODO

#### License

<sup>
Licensed under the <a href="http://www.apache.org/licenses/LICENSE-2.0">Apache License, Version 2.0</a>.
</sup>

<br>

<sub>
Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in this app by you, as defined in the Apache-2.0 license, shall be licensed as above, without any additional terms or conditions.
</sub>

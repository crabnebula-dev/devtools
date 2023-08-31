# Inspector Protocol Plugin Examples

Welcome to the `examples` folder for the Inspector Protocol Plugin.

## `tauri`

This is a minimalistic Tauri application pre-configured to utilize the Inspector Protocol Plugin.

To run the Tauri application with the Inspector Protocol enabled:

1. Navigate to the [`tauri`](./tauri/) folder.
2. Execute the following command:

```bash
cargo run -- --inspect
```

Upon running the command, you should see an output resembling:

```
--------- Tauri Inspector Protocol ---------

Listening at:
  ws://127.0.0.1:56609

Inspect in browser:
  https://crabnebula.dev/debug/#127.0.0.1:56609

--------- Tauri Inspector Protocol ---------
```

This indicates that the Tauri application is live and waiting for incoming connections. Utilize the provided link to inspect in a browser, connecting directly to the plugin.


## `client`

This is a simplistic HTML client that serves the purpose of making RPC queries to the API. To use:

- Locate the `index.html` file inside the [`client`](./client/) folder.
- Open the `index.html` file in your preferred browser.
- Append the WebSocket port to the address. For example, if your WebSocket port is `56609`, the URL in the address bar would look something like:

```
file:///path_to_the_file/client/index.html#127.0.0.1:56609
```

Replace `path_to_the_file` with the actual path to your `index.html`.

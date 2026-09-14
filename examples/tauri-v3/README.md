# Tauri v3 Example

Tauri v3 does not bundle a webview runtime: the app picks one by depending on its crate
and passing it to `tauri::Builder::runtime`. This example supports both, selected by a cargo feature:

| feature         | runtime                                                 |
| --------------- | ------------------------------------------------------- |
| `wry` (default) | the system webview (WebKitGTK, WebView2, WKWebView)     |
| `cef`           | the Chromium Embedded Framework, shipped with the app   |

The window shows which runtime is active.

## wry

To execute run the following: `cargo run`.

## CEF

CEF must be run through the Tauri CLI: it ships the CEF binary distribution next to the
executable and, on macOS, runs the app from inside an `.app` bundle (CEF launches its helper
processes by path from inside the bundle, so it cannot run as a bare executable there).

```sh
pnpm i
pnpm tauri dev --features cef
```

The first build downloads the CEF binary distribution (about 1 GB) into the user cache
directory (`~/Library/Caches/tauri-cef` on macOS), or into `$CEF_PATH` when that is set.

## Android

```sh
pnpm tauri android init
pnpm tauri android dev
```

## iOS

```sh
pnpm tauri ios init
pnpm tauri ios dev
```

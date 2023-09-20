# Devtools Web Client

This is the Web-Client for the devtools app. It communicates with Rust instrumentation layer via WebSockets. It is a SolidJS Single-Page Application (SPA).

## Running Locally 💻

Change directory into `web-client` and install dependencies.

```sh
cd web-client && pnpm install
```

Now you're ready to run and access it from [localhost]()

```sh
pnpm dev
```

The client itself does very little without an app to receive data from, so at another terminal session, change directory into `./examples/tauri`

```sh
cd examples/tauri
```

And run the app with the `--inspect` flag:

```sh
cargo run -- --inspect
```

Watch out for the terminal, the app will let you know the Web Sockets URL to listen to.

## Stack 📦

Here is a list of the tools used to build the core functionality and links to each of their documentation pages.

### SolidJS

JSX based reactivity library for building user interfaces.

- [Getting Started](https://www.solidjs.com/guides/getting-started)
- [SolidJS and TypeScript](https://www.solidjs.com/guides/typescript)
- [SolidJS Primitives: Useful Helper Packages](https://github.com/solidjs-community/solid-primitives/tree/main)

#### Routing

We follow the flat File-System Architecture, route definitions currently live inside `src/entry.tsx`.

[Solid Router Docs](https://docs.solidjs.com/guides/how-to-guides/routing-in-solid/solid-router)

#### Web Sockets

Communication with the Rust instrumentation is done via Web Sockets and uses the SolidJS Web Sockets primitive, with SolidJS EventListeners primitive to convert DOM Events into signals.

- [@solid-primitives/websocket](https://github.com/solidjs-community/solid-primitives/tree/main/packages/websocket)
- [@solid-primitives/event-listener](https://github.com/solidjs-community/solid-primitives/blob/main/packages/event-listener/README.md)

### Kobalte

Kobalte provides a set of low-level UI styleless components that adhere to a11y standards.

[Kobalte Docs](https://kobalte.dev/)

### TailwindCSS

> A utility-first CSS framework packed with classes like flex, pt-4, text-center and rotate-90 that can be composed to build any design, directly in your markup.

[Tailwind Docs](https://tailwindcss.com/)

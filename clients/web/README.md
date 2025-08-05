![banner](/docs/gh-banner.webp)

# DevTools

This is the Web-Client for the devtools app. It receives instrumentation data from the [devtools](https://docs.rs/devtools/latest/devtools) crate.

The Web-Client is a solid Single-Page Application (SPA).

Check it live: [devtools.crabnebula.dev](https://devtools.crabnebula.dev)

## Running Locally 💻

After cloning the repository, change directory into `web-client` and install dependencies.

```sh
cd web-client && pnpm install
```

Now you're ready to run and access it from [localhost](http://localhost:5173/)

```sh
pnpm dev
```

The client itself does very little without an app to receive data from, so at another terminal session, change directory into `./examples/tauri`

```sh
cd examples/tauri
```

## Setup your Tauri App 🦀

```rs
fn main() {
    let devtools_plugin = devtools::init();

    tauri::Builder::default()
        .plugin(devtools_plugin)
        .setup(|_| {
            // It is compatible with the `tracing` ecosystem!
            tracing::info!("Hello World!");

            Ok(())
        })
         // ... the rest of the tauri setup code
}
```

With the plugin added, you can start serving your app. The instrumentation server is exposed in `127.0.0.1:3030` by default.

## Stack 📦

Here is a list of the tools used to build the core functionality and links to each of their documentation pages.

### SolidJS

JSX based reactivity library for building user interfaces.

- [Getting Started](https://www.solidjs.com/guides/getting-started)
- [SolidJS and TypeScript](https://www.solidjs.com/guides/typescript)

#### Routing

We follow the flat File-System Architecture, route definitions currently live inside `src/entry.tsx`.

[Solid Router Docs](https://docs.solidjs.com/guides/how-to-guides/routing-in-solid/solid-router)

#### Data

Instrumentation data comes in the app through 5 different stream clients.

- Instrumentation
- Tauri
- Health
- Sources
- Meta

### Kobalte

Kobalte provides a set of low-level UI styleless components that adhere to a11y standards.

[Kobalte Docs](https://kobalte.dev/)

### TailwindCSS

> A utility-first CSS framework packed with classes like flex, pt-4, text-center and rotate-90 that can be composed to build any design, directly in your markup.

[Tailwind Docs](https://tailwindcss.com/)

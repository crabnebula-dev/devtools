# Architecture

The core observation behind DevTools is that Tauri apps are *interactive* and *long-running* processes, 
and being able to gather, aggregate and visualize data *in realtime* is therefore very important.  
I believe this is the only paradigm applicable to the highly interactive and playful nature of web development used for Tauri apps.

To archive realtime data collection with minimal overhead, DevTools consists of two main components: 
The app instrumentation and user-facing UI.

## Core paradigms

Below are a few core paradigms that have influenced the design decisions taken so far and should be respected by all new code:

### Client initiated streams

All data transfers are initiated by the *Client* and should include the possibility for the *Client* to specify a filter. 
This further helps to reduce the network traffic by only sending information that the *Client* truly cares about.

## Overview

```mermaid
flowchart LR
    subgraph InstrumentedApp[Instrumented App]
    A[App Code]

    subgraph Instrumentation
    L[tracing_subscriber Layer]
    Ag[Aggregator]
    S[Server]
    end
    end

    subgraph Devtools
    C[Client]
    P[State]
    U[UI]
    end

    A -->|tracing Event| L
    L -->|Event| Ag
    S -->|Command| Ag
    Ag
    Ag -->|"
        Update
    "| S
    S <-->|gRPC| C
    H <-->|gRPC| C

    C -->|mutation| P
    P -->|render| U
    U -->|command| C
```

### App Instrumentation

The App Instrumentation is available as a Rust crate and has to be included in the users Tauri app. 
The crate exposes a simple interface: `init` and `try_init` which initialize the collection and aggregation systems, 
and return a Tauri plugin which has to be added to the app for further integration with Tauri.

The instrumentation collects data from the `tracing`ecosystem, through a `tracing_subscriber` `Layer` and 
forwards all events to an `Aggregator` task. This task keeps all the state necessary to run the instrumentation layer 
and will ingest events, apply them to its internal state and then periodically send batches of events to all 
connected clients through the gRPC `Server`.

It's important to note that both the `Aggregator` and `Server` run in their own OS thread, using their own tokio runtime 
and the `Layer` implementation is kept as lightweight as possible as to not distort the measurements and provide a 
layer of isolation from the rest of the app.
This also means that a crash in the instrumentation will not bring down the app with it.

The above is exposed through the [`Instrumentation`](./wire/proto/instrument.proto) gRPC service, but there are a couple more:

#### `Metadata`

This exposes metadata about the Tauri such as the apps name, version, description, but also information
about the Operating System such as Architecture.
For details see the [`Metadata` service definition](./wire/proto/meta.proto).

#### `Sources`

This service lets the UI display a tree-view of the working directory by enumerating files recursively and 
querying bytes of a file.
For details see the [`Sources` service definition](./wire/proto/sources.proto).

#### `Tauri`

This service lets the UI access the tauri configuration, tauri and webview versions and tauri-specific performance 
metrics that are not yet exposed through the `Instrumentation`.
For details see the [`Tauri` service definition](./wire/proto/tauri.proto).

#### `Health`

This is a standard gRPC service that lets clients query the operational status of the systems services.

# Architecture

This document offers a detailed overview of the plugin's structural design, its components, and how they interrelate.

## Overview

The Inspector Protocol is fundamentally a Tauri plugin designed for real-time data interaction. Utilizing WebSocket technology, it establishes a JSON-RPC server with subscription capabilities, allowing for dynamic two-way communication. 

Furthermore, with its subscriber component, the protocol can seamlessly integrate with the [`tracing`](https://crates.io/crates/tracing) ecosystem to collate events and spans reported by various third-party crates.

## Components

### **Tauri Plugin**
The heart of the Inspector Protocol, it integrates seamlessly with Tauri applications, allowing developers to supercharge their debugging and monitoring capabilities with minimal effort.

### **Real-time Data Exchange**
Our system prioritizes instantaneous interaction, ensuring data exchange occurs in real-time, without latency.

### **WebSocket (JSON-RPC Server)**
A robust WebSocket layer underpins the protocol, acting as the JSON-RPC server. This ensures:
   - Streamlined two-way communication.
   - Subscription support for more dynamic interactions.

### Subscriber
The subscriber component is adept at tapping into the [`tracing`](https://crates.io/crates/tracing) ecosystem. By doing so, it's able to gather valuable insights, collecting events and spans as reported by third-party crates.

## Repository

Understanding our repository is essential to grasping the Inspector Protocol. Here’s a breakdown of the primary folders:

- **`inspector-protocol`**: This is the main library. Notably, it's the sole crate destined for publication.

- **`primitives`**: This folder houses the fundamental shared types necessary for the Inspector Protocol to function optimally.

- **`server`**: Our dedicated JSON-RPC Server resides here. It features a WebSocket transport layer, which supports connection upgrade, facilitating interactions.

- **`subscriber`**: This component plays a pivotal role as the `tracing` subscriber, continuously monitoring and collecting vital data from the ecosystem.

## Data Flow

```mermaid
flowchart LR
    A[Tauri App]
    Pl[Inspector Protocol Plugin]
    subgraph Subscriber
    L[inspector-protocol-subscriber]
    Ag[Channels]
    end
    subgraph Server
    S[JSON-RPC Server]
    end
    subgraph Devtools
    C[Client]
    end

    A -->|load| Pl
    Pl -->|register| L
    L <--> Ag
    Pl -->|spawn| S
    A -->|"
        TraceEvent
        tao::platform_impl::platform
    "| L
    S <--> Ag
    S <-->|WebSocket| C
```
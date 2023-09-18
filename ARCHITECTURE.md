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

- **`plugins/tauri`**: This is the main library. Notably, it's the sole crate destined for publication.

- **`inspector-protocol/primitives`**: This folder houses the fundamental shared types necessary for the Inspector Protocol to function optimally.

- **`inspector-protocol/server`**: Our dedicated JSON-RPC Server resides here. It features a WebSocket transport layer, which supports connection upgrade, facilitating interactions.

- **`inspector-protocol/subscriber`**: This component plays a pivotal role as the `tracing` subscriber, continuously monitoring and collecting vital data from the ecosystem.

## WebSocket

In the design, channels serve as the backbone for efficient and immediate data transfer particularly when it comes to real-time broadcasting over WebSockets. Rather than broadcasting events to subscribers as they arrive, we employs a queuing mechanism. This ensures that events are batched together and then dispatched in more manageable chunks to the subscribers, optimizing performance without sacrificing real-time capabilities.

Events are dispatched to the channel **only if there's an active subscription**. This means there's no unnecessary buildup or accumulation of data in the channel if there are no listeners. This dynamic setup helps in keeping the data flow lean and efficient. When events are sent to the channel, they're immediately broadcasted to all subscribers via the WebSocket. This rapid dispatch mechanism ensures that data transfer is nearly instantaneous, maintaining the real-time nature of the protocol.

By leveraging the Broadcaster in our design, we've achieved a balance between instantaneous data broadcast and system efficiency. Ongoing and future benchmarking will be crucial to fine-tuning this mechanism and ensuring it meets the performance requirements.

## Data Flow

```mermaid
flowchart LR
    A[Tauri App]
    Pl[Inspector Protocol Plugin]
    subgraph Subscriber
    L[inspector-protocol-subscriber]
    B[Broadcaster]
    end
    subgraph Server
    S[JSON-RPC Server]
    end
    subgraph Devtools
    C[Client]
    end

    A -->|load| Pl
    Pl -->|register| L
    L -->|pre-filtered| B
    Pl -->|spawn| S
    A -->|"
        Trace events
        Spans tracing
    "| L
    B -->|"
        logs_out
        spans_out
    "| S
    S <-->|WebSocket| C
```
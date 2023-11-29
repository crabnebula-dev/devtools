# Security

## Vulnerability Disclosure 

**Do not report security vulnerabilities through public GitHub issues.**

**Please use the [Private Vulnerability Disclosure](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability#privately-reporting-a-security-vulnerability) feature of GitHub.**

Alternatively, you can also send them by email to security@crabnebula.com.
You can encrypt your mail using GnuPG if you want. 

See the [security.txt](https://crabnebula.dev/.well-known/security.txt) from CrabNebula

```
Contact: mailto:security@crabnebula.dev
Expires: 2025-01-30T06:30:00.000Z
Encryption: https://crabnebula.dev/.well-known/pgp.txt
Preferred-Languages: en,de,fr
Canonical: https://crabnebula.dev/.well-known/security.txt
```

Include as much of the following information:

- Type of issue (e.g. buffer overflow, privilege escalation, information leak etc.)
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- The distribution affected or used for reproduction.
- Step-by-step instructions to reproduce the issue, ideally a reproduction repository
- Impact of the issue, including how an attacker might exploit the issue
- Preferred Languages

We prefer to receive reports in English. If necessary, we also understand French and German.

## Threat Model

The application is considered for developers to be used locally to test, inspect and debug their Tauri application via adding a plugin.
It is not meant to be remotely (where the web client is used on another system as the client) inspected or debugged as of now.

### Considered Threats

#### Filesystem Exposure

The client exposes a set of gRPC APIs which allow to preview sources from the local
filesystem of the system to be inspected. The APIs only allow access to the files in
the application source code project directory. It has no access outside of this directory.

#### Resource Exhaustion

Generating traces creates additional resource consumption but the amount of additional
resources allocated on the client system are negligible.
The inspection view could allocate significant resources if events are spammed and could
in worst case lead to blocking usage in the inspection client but it is considered more of
an UX issue than a security impact issue.

#### Information Leaks

The application will display and handle tracing data, which can contain sensitive information like PII or credentials.
These data is not visible remotely and only shown and processed client side and handled in the local browser memory.

#### Trace Hiding

The tracing system collects events in a size bound FIFO queue, which is sent on regular intervals.
It is theoretically possible that events are dropped. A potential attacker would need to be able
to generate a _massive_ amount of traces. With this, events could be dropped but the event log
sent to the server component contains the number of dropped events, so it is possible to detect such behavior.

#### Man in the Middle

The connection between the devtools instrumented local application and the web client collecting the information is currently not protected against local man-in-the-middle attacks.
This implicates that any software on the system and visited websites can potentially access the collected traces and system information.

We currently reduce impact by setting CORS header checks to only allow requests from [devtools.crabnebula.dev](https://devtools.crabnebula.dev).
This can be bypassed in scenarios where a man-in-the-middle adversary with either a trusted root CA in the system, or the ability
to manually spoof the origin header when sending a request from another application on the client system.

We plan to implement mTLS for proper authentication to mitigate this type of attacks in a later stage.
The current likelihood of the above mentioned adversaries is considered low and the endpoints are only exposed on localhost.

### Out of Scope

- Attacks on scenarios where the client is remotely exposed
- Information Leaks via the traces sent over insecure remote channels
- Exploits in the browser/webview
- Versions which are no longer actively supported, currently we only support the latest version
# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0](https://github.com/crabnebula-dev/devtools/compare/devtools-v0.1.0...devtools-v0.2.0) - 2023-12-04

### Added
- *(spans-waterfall)* add event spans ([#90](https://github.com/crabnebula-dev/devtools/pull/90))
- add instrumentation builder
- buffering of events
- instrumentation health
- Testing from [#39](https://github.com/crabnebula-dev/devtools/pull/39)

### Fixed
- *(devtools)* reenable cors
- use consistent naming for crates
- correct devtools url for published version
- prevent directory traversal ([#96](https://github.com/crabnebula-dev/devtools/pull/96))
- decompress the asset
- clippy pedantic
- missing metadata
- actually set initializedAt ([#61](https://github.com/crabnebula-dev/devtools/pull/61))
- use tracing_subscriber::fmt for instrumentation thread
- bring back filtering to log events

### Other
- Update Cargo.toml
- add crate descriptions
- use released upstream tauri version
- update doc tests
- Update builder.rs
- update doc comments
- Update server.rs
- temp disable cors check
- *(example)* use a dev server
- Merge pull request [#88](https://github.com/crabnebula-dev/devtools/pull/88) from crabnebula-dev/feat/built-app-assets
- Update lib.rs
- Merge branch 'main' into jonas/flush
- Merge pull request [#94](https://github.com/crabnebula-dev/devtools/pull/94) from crabnebula-dev/jonas/fix/client-auth
- Merge pull request [#62](https://github.com/crabnebula-dev/devtools/pull/62) from crabnebula-dev/feat/workspace-ui
- Update server.rs
- Merge branch 'main' into jonas/feat-workspace
- run fmt
- Merge remote-tracking branch 'origin/main' into jonas/feat/app-metadata
- Merge branch 'main' into feat/simplify-proto-solid
- Merge pull request [#69](https://github.com/crabnebula-dev/devtools/pull/69) from crabnebula-dev/jonas/fix-metadata
- Update aggregator.rs
- ignore doctests
- add doc comments
- revert interests
- revert rename
- Merge branch 'main' into cleanup
- revert renaming
- cleanup
- update & fix test
- ignore tests
- Update layer.rs
- add layer testing (broken)
- Update tauri_plugin.rs
- remove shutdown signal
- cleanup deps
- cleanup
- fmt & clippy
- cleanup
- unti testing
- fmt
- try grpc for comparison
- cleanup
- fmt
- clippy & fmt
- cleanup

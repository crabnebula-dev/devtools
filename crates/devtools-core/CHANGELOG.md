# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.5](https://github.com/crabnebula-dev/devtools/compare/devtools-core-v0.3.4...devtools-core-v0.3.5) - 2024-09-05

### Other
- update dependencies

## [0.3.4](https://github.com/crabnebula-dev/devtools/compare/devtools-core-v0.3.3...devtools-core-v0.3.4) - 2024-07-25

### Added
- compatibility with tauri-plugin-log, closes [#150](https://github.com/crabnebula-dev/devtools/pull/150)

### Other
- #[must_use]

## [0.3.3](https://github.com/crabnebula-dev/devtools/compare/devtools-core-v0.3.2...devtools-core-v0.3.3) - 2024-05-29

### Fixed
- fix cors
- cors on dev mode
- cors issue on Windows

## [0.3.2](https://github.com/crabnebula-dev/devtools/compare/devtools-core-v0.3.1...devtools-core-v0.3.2) - 2024-05-27

### Added
- allow tauri app to connect

## [0.3.1](https://github.com/crabnebula-dev/devtools/compare/devtools-core-v0.3.0...devtools-core-v0.3.1) - 2024-05-13

### Fixed
- fix release

### Other
- Feat/calls virtualization ([#240](https://github.com/crabnebula-dev/devtools/pull/240))
- update deps
- update deps

## [0.3.0](https://github.com/crabnebula-dev/devtools/compare/devtools-v0.2.5...devtools-v0.3.0) - 2023-12-20

### Fixed
- pick free port

### Other
- Update error.rs
- Merge pull request [#165](https://github.com/crabnebula-dev/devtools/pull/165) from crabnebula-dev/jonas/fix/pick-free-port
- fmt
- Update devtools/src/builder.rs
- clippy & fmt

## [0.2.5](https://github.com/crabnebula-dev/devtools/compare/devtools-v0.2.4...devtools-v0.2.5) - 2023-12-11

### Other
- Merge pull request [#156](https://github.com/crabnebula-dev/devtools/pull/156) from crabnebula-dev/jonas/refactor/metrics
- Merge pull request [#138](https://github.com/crabnebula-dev/devtools/pull/138) from crabnebula-dev/jonas/clippy
- Merge pull request [#139](https://github.com/crabnebula-dev/devtools/pull/139) from crabnebula-dev/jonas/fix/updater-span-crash

## [0.2.4](https://github.com/crabnebula-dev/devtools/compare/devtools-v0.2.3...devtools-v0.2.4) - 2023-12-05

### Fixed
- *(devtools)* correct url

### Other
- Merge branch 'main' of https://github.com/crabnebula-dev/devtools

## [0.2.3](https://github.com/crabnebula-dev/devtools/compare/devtools-v0.2.2...devtools-v0.2.3) - 2023-12-05

### Fixed
- *(devtools)* point tro correct url

## [0.2.2](https://github.com/crabnebula-dev/devtools/compare/devtools-v0.2.1...devtools-v0.2.2) - 2023-12-04

### Fixed
- *(devtools)* point to correct URL

### Other
- Update server.rs

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

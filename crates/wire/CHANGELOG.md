# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.6.0](https://github.com/crabnebula-dev/devtools/compare/devtools-wire-format-v0.5.3...devtools-wire-format-v0.6.0) - 2026-09-11

### Changed

- BREAKING: several types now implement Copy. May cause closures to capture it by reference instead of moving it.
- BREAKING: some `encode` and `merge` methods changed their number of generic types.
- Raise MSRV to 1.85. Added MSRV policy ([#414](https://github.com/crabnebula-dev/devtools/pull/414))
- Upgrade to tonic/prost 0.14 and http 1. ([#407](https://github.com/crabnebula-dev/devtools/pull/407))
- Moved protobuf codegen to dedicated (not published) crate. ([#407](https://github.com/crabnebula-dev/devtools/pull/407))
- Remove the unused `tonic-build` / `prost-build` dev-dependency. ([#413](https://github.com/crabnebula-dev/devtools/pull/413))

### Other

- General dependency updates
- General CI maintenance

## [0.5.3](https://github.com/crabnebula-dev/devtools/compare/devtools-wire-format-v0.5.2...devtools-wire-format-v0.5.3) - 2025-08-05

### Fixed

- fix lint

### Other

- 3033

## [0.5.2](https://github.com/crabnebula-dev/devtools/compare/devtools-wire-format-v0.5.1...devtools-wire-format-v0.5.2) - 2024-09-05

### Other
- update dependencies

## [0.5.1](https://github.com/crabnebula-dev/devtools/compare/devtools-wire-format-v0.5.0...devtools-wire-format-v0.5.1) - 2024-05-13

### Other
- update protobuf generated files

## [0.2.5](https://github.com/crabnebula-dev/devtools/compare/devtools-wire-format-v0.2.4...devtools-wire-format-v0.2.5) - 2023-12-11

### Other
- remove specialized Metrics struct

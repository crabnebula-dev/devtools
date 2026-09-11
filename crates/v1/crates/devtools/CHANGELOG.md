# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.5](https://github.com/crabnebula-dev/devtools/compare/v0.3.4...v0.3.5) - 2026-09-11

### Changed

- MSRV bump to 1.88, general dependency upgrades, ci chores ([#381](https://github.com/crabnebula-dev/devtools/pull/381))
- Added MSRV policy ([#414](https://github.com/crabnebula-dev/devtools/pull/414))
- Update to devtools-core 0.4.0 ([#418](https://github.com/crabnebula-dev/devtools/pull/418))
- Upgrade to tonic/prost 0.14 and http 1 ([#407](https://github.com/crabnebula-dev/devtools/pull/407))
- Simplified CORS handling to mirror the allowed request origin in `Access-Control-Allow-Origin`, including in local development mode, instead of returning an origin list or `*`. ([#407](https://github.com/crabnebula-dev/devtools/pull/407))

### Fixed

- Increase span buffer size to avoid dropped spans and UX issues. ([#227](https://github.com/crabnebula-dev/devtools/pull/227))
- Fix v1 release note duplication

### Other

- Address clippy errors ([#401](https://github.com/crabnebula-dev/devtools/pull/401))
- General dependency updates
- General CI maintenance

## [0.3.4](https://github.com/crabnebula-dev/devtools/compare/v0.3.3...v0.3.4) - 2025-08-05

### Other

- change default port to 3030 ([#373](https://github.com/crabnebula-dev/devtools/pull/373))
- bump msrv

## [0.3.3](https://github.com/crabnebula-dev/devtools/compare/v0.3.2...v0.3.3) - 2024-07-25

### Fixed

- use correct rust syntax for cfg on expressions ([#314](https://github.com/crabnebula-dev/devtools/pull/314))

## [0.3.2](https://github.com/crabnebula-dev/devtools/compare/v0.3.1...v0.3.2) - 2024-05-29

### Fixed

- Fixed CORS issues

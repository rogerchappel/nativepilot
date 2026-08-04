# Changelog

All notable changes to this project will be documented in this file.

This project follows the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
format and uses semantic versioning when versioned releases are published.

## [Unreleased]

### Added

- Initial project setup.

### Fixed

- Let `nativepilot doctor` recognize the authoritative manifest state written by
  `clean-demo`, while continuing to report accidentally missing demo screens.
- Keep generated Expo SDK 57 apps on its exact compatible Reanimated and
  Worklets versions so a new npm lockfile can be installed cleanly with
  `npm ci`.

## Release Links

- Unreleased:
  `https://github.com/rogerchappel/nativepilot/compare/...HEAD`
- Latest release:
  `https://github.com/rogerchappel/nativepilot/releases/latest`

Replace placeholder links once the first release tag exists.

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2026-05-27

### Added
- Added UDI generation (FCS-82) ([1d4430a](https://github.com/fibricheck/react-native-camera-sdk/commit/1d4430a5a3a41c747e5639f2824bc01d601384a9))
- Preview added ([9423cd7](https://github.com/fibricheck/react-native-camera-sdk/commit/9423cd70989da65bbc9d18d13d9eb68209687487))
- Sequence tester ([492b4d1](https://github.com/fibricheck/react-native-camera-sdk/commit/492b4d146aa0d4eb5689197d47a8a64734581dd4))

### Changed
- Configs ([27ea06d](https://github.com/fibricheck/react-native-camera-sdk/commit/27ea06d90d5adf0ede3a74a860017192f22ebc82))
- Renamed ios example app ([c39899b](https://github.com/fibricheck/react-native-camera-sdk/commit/c39899bfdd1dce8162eb59d73cae136b6885925b))
- Add LICENSE file ([abe2ad8](https://github.com/fibricheck/react-native-camera-sdk/commit/abe2ad8cc8f82c824c065c2d84a0a4aea0716ed6))
- Prepare v1.4.0 ([2817573](https://github.com/fibricheck/react-native-camera-sdk/commit/2817573a1ce6b9821400b64180daaa9880ea8380))
- Update release process ([74b5bf1](https://github.com/fibricheck/react-native-camera-sdk/commit/74b5bf1d4d50c98f22b2c3423f017da30b045770))
- Remove unused scripts ([9e2bb72](https://github.com/fibricheck/react-native-camera-sdk/commit/9e2bb7241f1dc8c5753bc2d5286b796acad1252e))
- Final changes after testing ([4980a59](https://github.com/fibricheck/react-native-camera-sdk/commit/4980a5961177bfebe0d0e6f23de17477c41b327e))

### Fixed
- Cliff changelog ([ade15fe](https://github.com/fibricheck/react-native-camera-sdk/commit/ade15fec54f6aa634ae2c39cfe214d95d672dd3d))

## [1.3.4] - 2024-12-17

### Changed

- Upgraded React Native
- Updated iOS Camera SDK to 1.0.2
- Updated Android Camera SDK to 1.0.2
- Security updates and CI improvements

## [1.3.3] - 2024-09-02

### Changed

- Updated Android Camera SDK to 1.0.1

## [1.3.2] - 2023-12-07

### Added

- `pulseDetectionExpiryTime` is now correctly taken into account

### Changed

- Extracted the native Camera SDKs into separate repositories
- Removed React as a peer dependency

## [1.3.1] - 2023-03-30

### Fixed

- Fixed a crash when clearing resources after a measurement

## [1.3.0] - 2022-09-21

### Added

- Updated finger detection algorithm to support Ultra Wide Angle cameras
- `onFingerRemoved` event now delivers the removal data

## [1.2.0] - 2022-08-18

### Added

- `onMeasurementError` callback for handling measurement errors
- Exported `MeasurementError` enum

## [1.1.2] - 2022-04-28

### Fixed

- Added grace period to finger detection to reduce false removals

## [1.1.1] - 2022-04-26

### Added

- Improved TypeScript type definitions

### Fixed

- Fixed finger detection issue

## [1.1.0] - 2022-03-25

### Added

- Added movement detection data to measurement output
- Added resolution data to measurement output
- Added extra measurement fields (FRS-4)
- Added regulatory compliance fields

## [1.0.6] - 2022-03-03

### Fixed

- Fixed iOS camera quality issue (FCRN-112)
- Fixed accelerometer data (FIBSDK-10)

## [1.0.5] - 2021-11-18

### Fixed

- Fixed background color rendering

## [1.0.4] - 2021-11-18

### Changed

- Removed AAR artifact from package

## [1.0.3] - 2021-11-18

### Fixed

- Fixed optional and default view styles
- Fixed iOS minimum version in podspec
- Cleaned up license file

## [1.0.0] - 2021-11-17

Initial release.

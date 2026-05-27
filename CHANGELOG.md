# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

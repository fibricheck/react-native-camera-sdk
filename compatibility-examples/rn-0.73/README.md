# React Native 0.73 compatibility app

This minimal app exercises `@fibricheck/react-native-camera-sdk` on React Native 0.73.11 using the
legacy Paper architecture. The SDK requires Android API 24+, so this fixture raises the template's
default Android minimum accordingly.

The SDK is injected from the repository root with Yalc. See the parent compatibility README for
the refresh and build commands. Always run `pod install` after `yarn install`; RN 0.73 must
regenerate its third-party Fabric provider files before the Xcode workspace is opened.

Use `yarn start`, `yarn android`, or `yarn ios` to run the app.

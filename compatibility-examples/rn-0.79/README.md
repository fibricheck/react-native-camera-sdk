# React Native 0.79 compatibility app

This minimal app exercises `@fibricheck/react-native-camera-sdk` on React Native 0.79.7. It can
run with Paper or the New Architecture by changing `newArchEnabled` in `android/gradle.properties`
and `RCT_NEW_ARCH_ENABLED` during CocoaPods installation.

The SDK is injected from the repository root with Yalc. See the parent compatibility README for
the refresh and build commands.

On Xcode 26, RN 0.79's `fmt` pod must compile as C++17. This fixture applies that compatibility
setting in its Podfile automatically; run `pod install` after cloning or refreshing dependencies.

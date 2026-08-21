# React Native compatibility examples

These minimal consumer apps install the local Camera SDK through `yalc` and exercise the same API:
measurement mounting and automatic startup, imperative commands, events, color props, and the
standalone camera preview.

| Fixture | Architecture coverage | TypeScript | Android | iOS |
| --- | --- | --- | --- | --- |
| `rn-0.73` (0.73.11) | Paper | Pass | Build + runtime smoke test pass | Pods/codegen + runtime smoke test pass |
| `rn-0.79` (0.79.7) | Paper + Fabric | Pass | Build + runtime smoke test pass | Pods/codegen + runtime smoke test pass |
| `rn-latest` (0.87.0) | Fabric | Pass | Build + runtime smoke test pass | Pods/codegen + runtime smoke test pass |

The supported range is RN 0.73 and newer. RN 0.87 is the newest explicitly tested version, not a
maximum: the peer dependency remains open-ended so later RN releases can be installed and tested.

The SDK requires iOS 13.4+ and Android API 24+. The RN 0.73 Android template therefore overrides
its default minSdk 21 to 24.

To refresh the fixture dependencies after changing the SDK:

```sh
yalc publish
cd compatibility-examples/<fixture>
yalc update @fibricheck/react-native-camera-sdk
yarn install
cd ios && pod install
```

Keep that order for iOS, especially with RN 0.73: Yarn can replace React Native's generated files,
so CocoaPods must run afterward to regenerate `RCTThirdPartyFabricComponentsProvider.mm` before
opening the workspace in Xcode.

Build Android with `cd android && ./gradlew :app:assembleDebug`. For RN 0.79 Paper, append
`-PnewArchEnabled=false`. For iOS, open the generated `.xcworkspace` and build the app scheme in
Xcode.

The RN 0.79 Podfile pins its transitive `fmt` pod to C++17 because RN 0.79's bundled version fails
with `consteval` errors under Xcode 26 when compiled as C++20.

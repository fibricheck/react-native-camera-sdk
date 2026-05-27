---
description: >-
  The camera SDK is a PPG recording module that you can use in combination with
  the FibriCheck Javascript SDK. This page help you to get started with this
  module.
---

# Getting Started

## Intro

A FibriCheck measurement consists of PPG data. To gather this PPG data, the Camera SDK will natively communicate with the underlying iOS/Android camera layer, process this data, and return an object that is ready to be submitted to our backend for analysis. Multiple [properties](properties.md) and [listeners](listeners.md) can be adjusted/attached for improving the visualization/customization of the process.

A FibriCheck Measurement consists of multiple phases:

1. Finger detection
   * Checks for the presence of a finger on the camera. A [timeout](properties.md#fingerdetectionexpirytime) can be set to 0 to skip this phase. By default this is `-1` which means that it will keep checking until a finger has been detected.
2. Pulse detection&#x20;
   * Checks if a pulse is present. When no pulse has been detected for 10 seconds, the calibration phase will start.
3. Calibration
   * When performing a measurement, a baseline needs to be calculated. When this baseline has been calculated, the calibration is ready and recording can commence.
4. Recording
   * The real deal. The recording calculates the PPG data by communicating with the native camera layers. The default length of the recording is 60 seconds, but can be changed by updating the [sampleTime](properties.md#sampletime).
5. Processing&#x20;
   * When the recording is finished, some additional processing needs to be done on the measurement. When done, a measurement object is presented via the [onMeasurementProcessed](listeners.md#onmeasurementprocessed) event.&#x20;

## Installation

To install the Camera SDK, you will need to have access to the [Camera SDK git repository](https://github.com/fibricheck/react-native-camera-sdk).

In your project, if you are using yarn or npm you need to create a file called `.npmrc` at the root level of your project and add these lines. Replace ${AUTH\_TOKEN} with your personal access token. You can get a new one [here](https://github.com/settings/tokens/new.). Make sure you enable the `read:packages` scope.

```
@fibricheck:registry=https://npm.pkg.github.com
@extrahorizon:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${AUTH_TOKEN}
```

Alternatively, this file can be added/edited in your home directory and it will be applied to all projects.

Explanation from GitHub on how to add your token can be found [here](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-to-github-packages).

using npm:

```
npm install @fibricheck/react-native-camera-sdk
```

using yarn:

```
yarn add @fibricheck/react-native-camera-sdk
```

## Making your first recording

### Permissions

The recording makes use of the device's camera. So to begin, you need to provide camera permissions. You can use this snippet to accomplish that:

```
import {request, PERMISSIONS} from 'react-native-permissions';  

const [camera, setCamera] = useState(false);

useEffect(() => {
    if (Platform.OS === 'ios') {
      request(PERMISSIONS.IOS.CAMERA).then(result => {
        setCamera(result === 'granted');
      });
    } else {
      request(PERMISSIONS.ANDROID.CAMERA).then(result => {
        setCamera(result === 'granted');
      });
    }
  }, []);
  
```

**Also, don't forget the define these permissions:**

#### Android

Add&#x20;

```
<uses-permission android:name="android.permission.CAMERA" />
```

To the `AndroidManifest.xml` file

For more information regarding Android permissions, check the [official Android documentation](https://developer.android.com/training/permissions/declaring).

#### iOS

Add&#x20;

```
<key>NSCameraUsageDescription</key>
<string>Your own description of the purpose</string>
```

To the `Info.plist` file

For more information regarding these iOS permissions, check the [official iOS documentation](https://developer.apple.com/documentation/avfoundation/cameras\_and\_media\_capture/requesting\_authorization\_for\_media\_capture\_on\_ios?language=objc).

### Component

When the permissions are all set up, you can implement the FibriCheck component like this:

```
<RNFibriCheckView
    style={styles.container}
    graphBackgroundColor={'#0073ff'}
    flashEnabled={true}
    onFingerDetected={() => console.log('finger detected')}
    onFingerRemoved={() => console.log('finger removed')}
    onCalibrationReady={() => console.log('calibration ready')}
    onMeasurementFinished={() => console.log('measurement finished')}
    onMeasurementStart={() => console.log('measurement recording started')}
    onFingerDetectionTimeExpired={() =>
        console.log('finger detection time expired')
    }
    onPulseDetected={() => console.log('pulse detected')}
    onPulseDetectionTimeExpired={() =>
        console.log('pulse detection time is expired')
    }
    onMovementDetected={() => console.log('movement detected')}
    onHeartBeat={(heartRate) => console.log(`current heart rate: ${heartRate}`)}
    onTimeRemaining={(seconds) => console.log(`time remaining: ${seconds}`)}
    onMeasurementProcessed={(data) =>
        console.log('measurement processed and ready to send!');
    }
/>
```

## Camera Preview

The SDK exposes an `RNCameraPreviewView` component that renders a live camera viewfinder without requiring a full measurement flow. It operates in two modes that are selected automatically based on whether `RNFibriCheckView` is mounted at the same time — no extra configuration is needed.

### Standalone mode

Use this when you want to display a camera feed on its own, without running a FibriCheck measurement. `RNCameraPreviewView` creates and owns its own FibriChecker instance internally.

```tsx
import { RNCameraPreviewView } from '@fibricheck/react-native-camera-sdk';

<RNCameraPreviewView style={StyleSheet.absoluteFill} />
```

The camera starts when the component mounts and stops when it unmounts. No measurement data is collected.

### Shared mode (alongside a measurement)

When `RNFibriCheckView` is already mounted, `RNCameraPreviewView` detects this and borrows the active camera session instead of opening a second one. This is useful when you want to show a viewfinder overlay while a measurement is in progress.

```tsx
import { RNFibriCheckView, RNCameraPreviewView } from '@fibricheck/react-native-camera-sdk';

{/* RNFibriCheckView drives the measurement; it can be visually hidden */}
<RNFibriCheckView style={{ width: 0, height: 0 }} ... />

{/* RNCameraPreviewView renders the live feed from the shared session */}
<RNCameraPreviewView style={styles.preview} />
```

The mode is determined at mount time: if `RNFibriCheckView` is present, shared mode is used; if not, standalone mode is used.

### How it works internally

**iOS:** In standalone mode the component calls `startPreview` on a dedicated `FibriChecker` instance, which opens the camera without collecting PPG data. In shared mode it attaches to the `AVCaptureSession` that `RNFibriCheckView` already holds.

**Android:** `RNFibriCheckView` keeps its `TextureView` container in the view hierarchy at all times (behind its graph overlay) so that the camera surface remains valid. When `RNCameraPreviewView` mounts in shared mode, it takes ownership of that container and displays it. When `RNCameraPreviewView` unmounts, the container is returned to `RNFibriCheckView` so the measurement can continue uninterrupted.

> **Important:** Do not mount `RNCameraPreviewView` in standalone mode and `RNFibriCheckView` simultaneously. Both would attempt to open the camera independently. The SDK logs an error if this conflict is detected.

# Update Dependencies
The React Native SDK depends on the FibriCheck native SDKs for [Android](https://github.com/fibricheck/android-camera-sdk) and [iOS](https://github.com/fibricheck/ios-camera-sdk). 

To update the iOS SDK dependency, change the following line in `react-native-camera-sdk.podspec`:
```
  s.dependency 'FibriCheckCameraSDK'
```

To update the Android SDK dependency, change the following line in `android/build.gradle`:
```
    implementation 'com.github.fibricheck:android-camera-sdk:v1.1.0'
```

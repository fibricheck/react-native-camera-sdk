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

```properties
@fibricheck:registry=https://npm.pkg.github.com
@extrahorizon:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${AUTH_TOKEN}
```

Alternatively, this file can be added/edited in your home directory and it will be applied to all projects.

Explanation from GitHub on how to add your token can be found [here](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-to-github-packages).

using npm:

```properties
npm install @fibricheck/react-native-camera-sdk
```

using yarn:

```properties
yarn add @fibricheck/react-native-camera-sdk
```

## Making your first recording

### Permissions

The recording makes use of the device's camera. So to begin, you need to provide camera permissions. You can use this snippet to accomplish that:

```typescript
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

Add this to the `AndroidManifest.xml` file:

```xml
<uses-permission android:name="android.permission.CAMERA" />
```

For more information regarding Android permissions, check the [official Android documentation](https://developer.android.com/training/permissions/declaring).

#### iOS

Add this to the `Info.plist` file:

```xml
<key>NSCameraUsageDescription</key>
<string>Your own description of the purpose</string>
```

For more information regarding these iOS permissions, check the [official iOS documentation](https://developer.apple.com/documentation/avfoundation/cameras\_and\_media\_capture/requesting\_authorization\_for\_media\_capture\_on\_ios?language=objc).

#### Third-party library

As you can see in the snippet, we make use of the `react-native-permissions` library. In order to use this library, make sure to add these values to your `Podfile`:

```
target 'MyAppName' do

  # react-native-permissions permission handlers
  permissions_path = '../node_modules/react-native-permissions/ios'
  
  pod 'Permission-Camera', :path => "#{permissions_path}/Camera.podspec"

end
```

**Make sure you execute `pod install` and restart the metro bundler after applying these changes!**

More information can be found in [the readme of their repository](https://github.com/zoontek/react-native-permissions#ios).

### Component

When the permissions are all set up, you can implement the FibriCheck component like this:

```tsx
<RNFibriCheckView
    style={{ flex: 1, backgroundColor: '#ffffff' }}
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

## Pitfalls

### Drawing on the JS Thread

When benchmarking the SDK, we noticed that drawing on the JS Thread while taking a measurement caused severe spikes in the processing power. This will results in a bad quality measurement. So when creating a visualisation, for example counting down the seconds that are left in a measurement, make sure you are not drawing on the JS Thread.  Either make use of [Native Driver](https://reactnative.dev/blog/2017/02/14/using-native-driver-for-animated) or use [React Reanimated](https://github.com/software-mansion/react-native-reanimated). When using third party libraries for creating animations, make sure they also offload the drawing from the JS Thread.&#x20;

### Using the correct camera lens

Placing your finger on the wrong camera can also result in a bad quality measurement. The Camera SDK makes use of `wide-angle-camera` of your phone. To make sure the correct lens is used, you can create a 'peephole' for this lens. This way, the user can check wich is the correct lens to use. At the moment for writing, there is one library that is able to select the correct lens: [react-native-vision-camera](https://github.com/mrousavy/react-native-vision-camera). We make use of this snippet:&#x20;

```tsx
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import styled from 'styled-components/native';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

const radiusBasis = Number(
  Math.round(SCREEN_HEIGHT / (SCREEN_HEIGHT <= 800 ? 6 : 8)),
);

const CameraContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  max-height: ${radiusBasis}px;
`;

const CameraContent = styled.View`
  overflow: hidden;
  border-radius: 100px;
`;

const devices = useCameraDevices('wide-angle-camera');
const device = devices.back;

export const FindYourLens = () => {
  return (
    <CameraContainer>
      <CameraContent>
        <Camera
            style={...}
            device={device}
            preset={'vga-640x480'}
        />
      </CameraContent>
    </CameraContainer>
  );
};
```

Asking the camera permissions is of course also necessary, but out of scope for this snippet

### Not using Hermes

When benchmarking the SDK, we noticed that [Hermes](https://reactnative.dev/docs/hermes) also had a big impact in the performance of low end devices. So we advice you to enable it if possible. Instructions can be found in [their documentation](https://reactnative.dev/docs/hermes#android).

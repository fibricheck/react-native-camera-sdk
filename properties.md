---
description: >-
  When you want to override the default settings (not recommended) you can
  adjust some of the module's default parameters. The code samples indicate
  their default values.
---

# Properties

## Styling

Add custom styling to the component. As a default, `{ flex: 1, backgroundColor: '#ffffff' }` is used.

**When customizing this, make sure to always add a **_**backgroundColor**_**!**

```tsx
<RNFibriCheckView
    ...
    style = {{ flex: 1, backgroundColor: '#ffffff' }}
    ...
/>
```

## Measurement Settings

### sampleTime

The duration of the measurement in seconds. Default is set to 1 minute.

```tsx
<RNFibriCheckView
    ...
    sampleTime={60};
    ...
/>
```

### flashEnabled

When enabled and supported by the device the SDK will turn on the camera flashlight while measuring.

```tsx
<RNFibriCheckView
    ...
    flashEnabled={true};
    ...
/>
```

### gravEnabled

When enabled and supported by the device, the measurement result will hold gravitational data.

```tsx
<RNFibriCheckView
    ...
    gravEnabled={false};
    ...
/>
```

### gyroEnabled

When enabled and supported by the device, the measurement result will hold gyroscope data.

```tsx
<RNFibriCheckView
    ...
    gyroEnabled={false};
    ...
/>
```

### accEnabled

When enabled and supported by the device, the measurement result will hold accelerometer data.

```tsx
<RNFibriCheckView
    ...
    accEnabled={true};
    ...
/>
```

_In some cases it might be useful to disable the accelerometer by setting `accEnabled={false}`. This prevents movement detection from happening and is what we call `debug mode`._

### rotationEnabled

When enabled and supported by the device, the measurement result will hold rotational data.

```tsx
<RNFibriCheckView
    ...
    rotationEnabled={true};
    ...
/>
```

### movementDetectionEnabled

When enabled the `onMovementDetected()` event will be thrown when movement is detected.

The detection will trigger when the movement vector is lower than 6 or higher than 14.

```tsx
<RNFibriCheckView
    ...
    movementDetectionEnabled={true};
    ...
/>
```

### fingerDetectionExpiryTime

The time until the finger detection will trigger the `onFingerDetectionTimeExpired`() event.

By Default this value is `-1`, which indicates that it will keep waiting until a finger is detected

```tsx
<RNFibriCheckView
    ...
    fingerDetectionExpiryTime={-1};
    ...
/>
```

### waitForStartRecordingSignal

Normally, when the calibration is ready, the measurement will start recording. When this flag is enabled, the measurement will wait untill the `startRecording()` command has been given.

```tsx
<RNFibriCheckView
    ...
    waitForStartRecordingSignal={false};
    ...
/>
```

## Graph Settings

### graphBackgroundColor

Determines the color of the area under the graph. By default, this color is omitted. The backgroundColor is thus displayed under the graph.

```tsx
<RNFibriCheckView
    ...
    //graphBackgroundColor={''};
    ...
/>
```

### drawGraph

When enabled the component draws a graph of the recorded PPG signal.

```tsx
<RNFibriCheckView
    ...
    drawGraph={true};
    ...
/>
```

### lineColor

Determines the color of the graph line.

```tsx
<RNFibriCheckView
    ...
    lineColor={'#63b3a6'};
    ...
/>
```

### lineThickness

Determines the thickness of the graph line.

```tsx
<RNFibriCheckView
    ...
    lineThickness={8}
    ...
/>
```

### drawBackground

When enabled, the component will draw a background for the graph

```tsx
<RNFibriCheckView
    ...
    drawBackground={true}
    ...
/>
```

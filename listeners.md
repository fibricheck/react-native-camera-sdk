---
description: >-
  The Camera SDK consists of multiple event listeners. The details of these
  listeners and the events that they will throw will be discussed in more detail
  here.
---

# Listeners

## During the whole lifecycle

These events can be thrown in any stage of the measurement

### onFingerDetected

This event will fire when the presence of a finger is detected.

```tsx
<RNFibriCheckView
    ...
    onFingerDetected={() => ...your code here...}
    ...
/>
```

### onFingerRemoved

This event will fire when the presence of a finger is no longer detected.

```tsx
<RNFibriCheckView
    ...
    onFingerRemoved={() => ...your code here...}
    ...
/>
```

## Pre-recording

These events will only be thrown when not recording

### onFingerDetectionTimeExpired

This event will fire when the `fingerDetectionExpiryTime` has been exceeded. Note that the default time is set to `-1`, meaning that this event won't fire.

```tsx
<RNFibriCheckView
    ...
    onFingerDetectionTimeExpired={() => ...your code here...}
    ...
/>
```

### onPulseDetected

This event will fire when a pulse has been detected. The pulse detection is only active after the finger detection has been completed.

```tsx
<RNFibriCheckView
    ...
    onPulseDetected={() => ...your code here...}
    ...
/>
```

### onPulseDetectionTimeExpired

This event will fire when no pulse has been detected after 10 seconds.

```tsx
<RNFibriCheckView
    ...
    onPulseDetectionTimeExpired={() => ...your code here...}
    ...
/>
```

### onCalibrationReady

When performing a measurement, a baseline needs to be calculated. When this baseline has been calculated, the calibration is ready and the sdk will throw this event.

```tsx
<RNFibriCheckView
    ...
    onCalibrationReady={() => ...your code here...}
    ...
/>
```

### onMeasurementStart

This event will fire when the recording of the measurement has been initiated.

```tsx
<RNFibriCheckView
    ...
    onMeasurementStart={() => ...your code here...}
    ...
/>
```

## While recording

these events can be thrown while the measurement is recording

### onHeartBeat

This event will fire when a heartbeat has been detected. It will return the heart rate as a number.

```tsx
<RNFibriCheckView
    ...
    onHeartBeat={(heartRate: number) => ...your code here...}
    ...
/>
```

### onSampleReady

This event will fire when a new sample is ready. It can be used the draw a graph or analyze data. _**For now, it's best to leave this event as is, because the JS bridge is not fast enough to handle this amount of data.**_

```tsx
<RNFibriCheckView
    ...
    onSampleReady={(data) => ...your code here...}
    ...
/>
```

### onMovementDetected

This event will fire when movement has been detected. Note that this event will only fire when the `movementDetectionEnabled` property is enabled. This value is `true` by default.&#x20;

```tsx
<RNFibriCheckView
    ...
    onMovementDetected={() => ...your code here...}
    ...
/>
```

### onTimeRemaining

This event will fire every second while recording. It returns the time in seconds that are left for completing the measurement. This is to make sure that no external timers are used, as they can become out of sync with the internal measurement timer.

```tsx
<RNFibriCheckView
    ...
    onTimeRemaining={(seconds: number) => ...your code here...}
    ...
/>
```

### onMeasurementFinished

This event will fire when the recording is complete. The [Post Processing](listeners.md#post-recording) will begin now.

```tsx
<RNFibriCheckView
    ...
    onMeasurementFinished={() => ...your code here...}
    ...
/>
```

## After the recording

these events can be thrown when the recording phase has ended.&#x20;

### onMeasurementProcessed

This event will fire when the measurement has been processed and is converted to a JSON String.

```tsx
<RNFibriCheckView
    ...
    onMeasurementProcessed={(data) => ...your code here...}
    ...
/>
```

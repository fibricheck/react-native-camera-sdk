# Camera SDK

## Intro

## Installation

## Starting a

## Other settings

#### graphBackgroundColor

Determines the graphBackground color. The default color is&#x20;

```javascript
sdk.graphBackgroundColor = "#123abc";
```

#### drawGraph

When enabled the react native component draws a graph of the recorded PPG signal.

```javascript
sdk.drawGraph = true;
```

#### lineColor

Determines

```javascript
sdk.lineColor = true;
```

#### lineThickness

When enabled and supported by the device, the measurement object result will hold accelerometer data.

```javascript
sdk.accEnabled = true;
```

#### drawBackground

When enabled and supported by the device, the measurement object result will hold accelerometer data.

```javascript
sdk.accEnabled = true;
```

#### sampleTime

When enabled and supported by the device, the measurement object result will hold accelerometer data.

```javascript
sdk.accEnabled = true;
```

#### flashEnabled

When enabled and supported by the device, the measurement object result will hold accelerometer data.

```javascript
sdk.accEnabled = true;
```

#### gravEnabled

When enabled and supported by the device, the measurement object result will hold accelerometer data.

```javascript
sdk.accEnabled = true;
```

#### gyroEnabled

When enabled and supported by the device, the measurement object result will hold accelerometer data.

```javascript
sdk.accEnabled = true;
```

#### accEnabled

When enabled and supported by the device, the measurement object result will hold accelerometer data.

```javascript
sdk.accEnabled = true;
```

#### rotationEnabled

When enabled the measurement object result will hold rotation data when available on the phone.

```javascript
sdk.rotationEnabled = true;
```

#### movementDetectionEnabled

When enabled the measurement process will start over again ..

```javascript
sdk.movementDetectionEnabled = true;
```

#### fingerDetectionExpiryTime

The time until the&#x20;

```
sdk.fingerDetectionExpiryTime = 3000;
```

#### waitForStartRecordingSignal

??

```javascript
sdk.waitForStartRecordingSignal = true;
```

####

##



```
interface cameraSDK {
    graphBackgroundColor?: string;
    drawGraph?: boolean;
    lineColor?: string;
    lineThickness?: number;
    drawBackground?: boolean;
    sampleTime?: number;
    flashEnabled?: boolean;
    gravEnabled?: boolean;
    gyroEnabled?: boolean;
    accEnabled?: boolean;
    rotationEnabled?: boolean;
    movementDetectionEnabled?: boolean;
    fingerDetectionExpiryTime?: number;
    waitForStartRecordingSignal?: boolean;
    startMeasurement: () => void;
    onFingerDetected?: () => void;
    onFingerRemoved?: () => void;
    onFingerDetectionTimeExpired?: () => void;
    onCalibrationReady?: () => void;
    onHeartBeat?: (event: { nativeEvent: { heartRate: number } }) => void;
    onMeasurementFinished?: () => void;
    onMeasurementStart?: () => void;
    onTimeRemaining?: (event: { nativeEvent: { seconds: number } }) => void;
    onSampleReady?: (event: {  nativeEvent: { ppg: number; raw: number };}) => void;
    onPulseDetected?: () => void;
    onPulseDetectionTimeExpired?: () => void;
    onMovementDetected?: () => void;
    onMeasurementProcessed?: (event: {  nativeEvent: { measurement: string };}) => void;
}
```

```
sdk.startMeasurement()
```



```
<RNFibriCheckView
    style={styles.container}
    graphBackgroundColor={'#0073ff'}
    flashEnabled={true}
    onFingerDetected={() => setFingerPresent(true)}
    onFingerRemoved={() => setFingerPresent(false)}
    onCalibrationReady={() => console.log('calibration ready')}
    onMeasurementFinished={() => console.log('measurement finished')}
    onMeasurementStart={() => setMeasurementStarted(true)}
    onFingerDetectionTimeExpired={() =>
    console.log('finger detection time expired')
    }
    onPulseDetected={() => setIsPulseDetected(true)}
    onPulseDetectionTimeExpired={() =>
    console.log('pulse detection time is expired')
    }
    onMovementDetected={() => console.log('movement detected')}
    onHeartBeat={(event) => setHeartRate(event.nativeEvent.heartRate)}
    onTimeRemaining={(event) => console.log(event.nativeEvent)}
    onMeasurementProcessed={(event) =>
    sendMeasurement(event.nativeEvent.measurement)
    }
    onSampleReady={(event) => onSampleReady(event.nativeEvent.ppg)}
/>
```

##

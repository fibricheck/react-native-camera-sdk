---
description: >-
  The camera SDK is a PPG recording module that you can use in combination with
  the FibriCheck Javascript SDK. This page help you to get started with this
  module.
---

# Getting Started

The Ca

##

## Installation

## Making your first recording

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

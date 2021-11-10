---
description: A more detailed description of the available listeners on the module.
---

# Listeners

## During the whole lifecycle

these events can be thrown in any stage of the measurement

### onFingerDetected

```java
<GraphView
    ...
    onFingerDetected={() => ...your code here...}
    ...
/>
```

### onFingerRemoved

```javascript
<GraphView
    ...
    onFingerRemoved={() => ...your code here...}
    ...
/>
```

## Pre recording

these events will only be thrown when not recording

### onFingerDetectionTimeExpired

```javascript
<GraphView
    ...
    onFingerDetectionTimeExpired={() => ...your code here...}
    ...
/>
```

### onPulseDetected

```javascript
<GraphView
    ...
    onPulseDetected={() => ...your code here...}
    ...
/>
```

### onPulseDetectionTimeExpired

```javascript
<GraphView
    ...
    onPulseDetectionTimeExpired={() => ...your code here...}
    ...
/>
```

### onCalibrationReady

```javascript
<GraphView
    ...
    onCalibrationReady={() => ...your code here...}
    ...
/>
```

### onMeasurementStart

```javascript
<GraphView
    ...
    onMeasurementStart={() => ...your code here...}
    ...
/>
```

## While recording

these events can be thrown while the measurement is recording

### onHeartBeat

```javascript
<GraphView
    ...
    onHeartBeat={(event) => ...your code here...}
    ...
/>
```

### onSampleReady

```javascript
<GraphView
    ...
    onSampleReady={(event) => ...your code here...}
    ...
/>
```

### onMovementDetected

```javascript
<GraphView
    ...
    onMovementDetected={() => ...your code here...}
    ...
/>
```

### onTimeRemaining

```javascript
<GraphView
    ...
    onTimeRemaining={(event) => ...your code here...}
    ...
/>
```

### onMeasurementFinished

```javascript
<GraphView
    ...
    onMeasurementFinished={() => ...your code here...}
    ...
/>
```

## Post recording

these events can be thrown when the recording phase has ended

### onMeasurementProcessed

the measurement has been processed and is converted to a JSON String

```javascript
<GraphView
    ...
    onMeasurementProcessed={(event) => ...your code here...}
    ...
/>
```

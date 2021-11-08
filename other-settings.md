# Other Settings

## Measurement Settings

### sampleTime

The duration of the measurement in seconds. Default is set to 1 minute.

```javascript
sdk.sampleTime = 60;
```

### flashEnabled

When enabled and supported by the device the SDK will turn on the camera flashlight while measuring.

```javascript
sdk.flashEnabled = true;
```

### gravEnabled

When enabled and supported by the device, the measurement result will hold gravitational data.

```javascript
sdk.gravEnabled = true;
```

### gyroEnabled

When enabled and supported by the device, the measurement result will hold gyroscope data.

```javascript
sdk.gyroEnabled = true;
```

### accEnabled

When enabled and supported by the device, the measurement result will hold accelerometer data.

```javascript
sdk.accEnabled = true;
```

### rotationEnabled

When enabled and supported by the device, the measurement result will hold rotational data.

```
sdk.rotationEnabled = true;
```

### movementDetectionEnabled

When enabled the measurement process will start over again ..

```javascript
sdk.movementDetectionEnabled = true;
```

### fingerDetectionExpiryTime

The time until the&#x20;

```
sdk.fingerDetectionExpiryTime = 3000;
```

### waitForStartRecordingSignal

??

```javascript
sdk.waitForStartRecordingSignal = true;
```

## Graph Settings

### graphBackgroundColor

Determines the graphBackground color. The default color is set to `#??????`

```javascript
sdk.graphBackgroundColor = "#123abc";
```

### drawGraph

When enabled the react native component draws a graph of the recorded PPG signal.

```javascript
sdk.drawGraph = true;
```

### lineColor

Determines the color of the graph line. The default color is set to `#??????`

```javascript
sdk.lineColor = "#123abc";
```

### lineThickness

Determines the thickness of the graph line. The default is set to 1 ?

```javascript
sdk.lineThickness = 1;
```

### drawBackground

When enabled the react component will draw a background for the graph

```javascript
sdk.drawBackground = true;
```


import * as React from 'react';
import {
  requireNativeComponent,
  UIManager,
  findNodeHandle,
} from 'react-native';

interface FibriCheckViewProps {
  style: any;
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
  onFingerDetected?: () => void;
  onFingerRemoved?: () => void;
  onFingerDetectionTimeExpired?: () => void;
  onCalibrationReady?: () => void;
  onHeartBeat?: (event: { nativeEvent: { heartRate: number } }) => void;
  onMeasurementFinished?: () => void;
  onMeasurementStart?: () => void;
  onTimeRemaining?: (event: { nativeEvent: { seconds: number } }) => void;
  onSampleReady?: (event: {
    nativeEvent: { ppg: number; raw: number };
  }) => void;
  onPulseDetected?: () => void;
  onPulseDetectionTimeExpired?: () => void;
  onMovementDetected?: () => void;
  onMeasurementProcessed?: (event: {
    nativeEvent: { measurement: string };
  }) => void;
}

const FibriCheckView = (props: FibriCheckViewProps) => {
  React.useEffect(() => {
    return function cleanup() {
      // @ts-ignore
      UIManager.dispatchViewManagerCommand(
        findNodeHandle(this),
        // @ts-ignore
        UIManager.FibriCheck.Commands.resetModule,
        []
      );
    };
  }, []);

  return <FibriCheck {...props} />;
};

FibriCheckView.defaultProps = {
  drawGraph: true,
  lineColor: '#0073ff',
  lineThickness: 8,
  drawBackground: true,
  sampleTime: 60,
  flashEnabled: true,
  gravEnabled: false,
  gyroEnabled: false,
  accEnabled: false,
  rotationEnabled: false,
  movementDetectionEnabled: true,
  fingerDetectionExpiryTime: 10,
  waitForStartRecordingSignal: false,
};

FibriCheckView.propTypes = {};

const FibriCheck = requireNativeComponent('FibriCheck', FibriCheckView);

export default FibriCheckView;

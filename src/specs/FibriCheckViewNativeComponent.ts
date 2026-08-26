import type { ColorValue, HostComponent, ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import type { DirectEventHandler, Double, Int32 } from 'react-native/Libraries/Types/CodegenTypes';

export interface SampleReadyEvent {
  ppg: Double;
  raw: Double;
}

export interface FingerRemovedEvent {
  y: Double;
  v: Double;
  stdDevY: Double;
}

export interface HeartBeatEvent {
  heartRate: Int32;
}

export interface TimeRemainingEvent {
  seconds: Int32;
}

export interface MeasurementProcessedEvent {
  // Raw JSON payload, parsed on the JS side into `CameraData`. Kept as a
  // string deliberately: the full measurement object graph (dynamic-keyed
  // records, nested arrays) doesn't fit Codegen's static event typing.
  measurement: string;
}

export interface MeasurementErrorEvent {
  message: string;
}

export interface NativeProps extends ViewProps {
  drawGraph: boolean;
  drawBackground: boolean;
  accEnabled: boolean;
  flashEnabled: boolean;
  gravEnabled: boolean;
  gyroEnabled: boolean;
  movementDetectionEnabled: boolean;
  rotationEnabled: boolean;
  waitForStartRecordingSignal: boolean;

  lineColor: ColorValue;
  lineThickness: Int32;

  graphBackgroundColor?: ColorValue;

  sampleTime: Int32;
  fingerDetectionExpiryTime: Int32;
  pulseDetectionExpiryTime: Int32;

  onSampleReady: DirectEventHandler<SampleReadyEvent>;
  onFingerDetected: DirectEventHandler<null>;
  onFingerRemoved: DirectEventHandler<FingerRemovedEvent>;
  onCalibrationReady: DirectEventHandler<null>;
  onHeartBeat: DirectEventHandler<HeartBeatEvent>;
  onTimeRemaining: DirectEventHandler<TimeRemainingEvent>;
  onMeasurementFinished: DirectEventHandler<null>;
  onMeasurementStart: DirectEventHandler<null>;
  onFingerDetectionTimeExpired: DirectEventHandler<null>;
  onPulseDetected: DirectEventHandler<null>;
  onPulseDetectionTimeExpired: DirectEventHandler<null>;
  onMovementDetected: DirectEventHandler<null>;
  onMeasurementProcessed: DirectEventHandler<MeasurementProcessedEvent>;
  onMeasurementError: DirectEventHandler<MeasurementErrorEvent>;
}

export interface NativeCommands {
  startMeasurement: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
  startRecording: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
  resetModule: (viewRef: React.ElementRef<HostComponent<NativeProps>>) => void;
}

export const Commands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['startMeasurement', 'startRecording', 'resetModule'],
});

export default codegenNativeComponent<NativeProps>('FibriCheck') as HostComponent<NativeProps>;

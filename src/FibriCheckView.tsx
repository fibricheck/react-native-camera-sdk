import { ElementRef, forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { NativeSyntheticEvent, ViewStyle } from 'react-native';
import packageVersion from '../package-version.json';
import { CameraData, MeasurementError } from './types';
import FibriCheck, { Commands } from './specs/FibriCheckViewNativeComponent';

export interface SampleReadyEventData { ppg: number; raw: number; }
export type SampleReadyEvent = NativeSyntheticEvent<SampleReadyEventData>

export interface MeasurementProcessedEventData { measurement: string; }
export type MeasurementProcessedEvent = NativeSyntheticEvent<MeasurementProcessedEventData>

export interface HeartBeatEventData { heartRate: number; }
export type HeartBeatEvent = NativeSyntheticEvent<HeartBeatEventData>

export interface FingerRemovedEventData { y: number; v: number; stdDevY: number; }
export type FingerRemovedEvent = NativeSyntheticEvent<FingerRemovedEventData>

export interface MeasurementErrorEventData { message: MeasurementError; }
export type MeasurementErrorEvent = NativeSyntheticEvent<MeasurementErrorEventData>

export interface TimeRemainingEventData { seconds: number; }
export type TimeRemainingEvent = NativeSyntheticEvent<TimeRemainingEventData>

export type EmptyEvent = NativeSyntheticEvent<void>

export interface FibriCheckViewHandle {
  startMeasurement: () => void
  startRecording: () => void
  resetModule: () => void
}

export interface FibriCheckViewProps {
  style?: ViewStyle;

  /** Start measuring after the native view mounts. Defaults to true. */
  autoStart?: boolean;

  drawGraph?: boolean;
  drawBackground?: boolean;
  accEnabled?: boolean;
  flashEnabled?: boolean;
  gravEnabled?: boolean;
  gyroEnabled?: boolean;
  movementDetectionEnabled?: boolean;
  rotationEnabled?: boolean;
  waitForStartRecordingSignal?: boolean;

  lineColor?: string;
  lineThickness?: number;

  graphBackgroundColor?: string;

  sampleTime?: number;
  fingerDetectionExpiryTime?: number;
  pulseDetectionExpiryTime?: number;

  onSampleReady?: (data: SampleReadyEventData) => void;
  onFingerDetected?: () => void;
  onFingerRemoved?: (data: FingerRemovedEventData) => void;
  onCalibrationReady?: () => void;
  onHeartBeat?: (heartRate: number) => void;
  onTimeRemaining?: (seconds: number) => void;
  onMeasurementFinished?: () => void;
  onMeasurementStart?: () => void;
  onFingerDetectionTimeExpired?: () => void;
  onPulseDetected?: () => void;
  onPulseDetectionTimeExpired?: () => void;
  onMovementDetected?: () => void;
  onMeasurementProcessed?: (data: CameraData) => void;
  onMeasurementError?: (message: MeasurementError) => void;
}

const FibriCheckView = Object.assign(
  forwardRef<FibriCheckViewHandle, FibriCheckViewProps>(({
  style = {
    flex: 1,
    backgroundColor: 'transparent',
  },

  autoStart = true,

  drawGraph = true,
  drawBackground = true,
  accEnabled = false,
  flashEnabled = true,
  gravEnabled = false,
  gyroEnabled = false,
  movementDetectionEnabled = true,
  rotationEnabled = false,
  waitForStartRecordingSignal = false,

  lineColor = '#63b3a6',
  lineThickness = 8,

  graphBackgroundColor,

  sampleTime = 60,
  fingerDetectionExpiryTime = -1,
  pulseDetectionExpiryTime = 10,

  onSampleReady,
  onFingerDetected = () => {},
  onFingerRemoved,
  onCalibrationReady = () => {},
  onHeartBeat,
  onTimeRemaining,
  onMeasurementFinished = () => {},
  onMeasurementStart = () => {},
  onFingerDetectionTimeExpired = () => {},
  onPulseDetected = () => {},
  onPulseDetectionTimeExpired = () => {},
  onMovementDetected = () => {},
  onMeasurementProcessed,
  onMeasurementError,
}: FibriCheckViewProps, ref) => {
  const nativeRef = useRef<ElementRef<typeof FibriCheck>>(null);

  useEffect(() => {
    if (!autoStart) {
      return;
    }

    // Wait until Fabric has attached the native component to its window before
    // dispatching the command. This also keeps legacy mount-to-start behaviour.
    const frame = requestAnimationFrame(() => {
      if (nativeRef.current) {
        Commands.startMeasurement(nativeRef.current);
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [autoStart]);

  const onSampleReadyCallback = (event: SampleReadyEvent) => {
    onSampleReady?.(event.nativeEvent);
  };

  const onMeasurementProcessedCallback = (event: MeasurementProcessedEvent) => {
    const parsed = JSON.parse(event.nativeEvent.measurement);
    onMeasurementProcessed?.({
      ...parsed,
      technicalDetails: parsed.technical_details,
    });
  };

  const onHeartBeatCallback = (event: HeartBeatEvent) => {
    onHeartBeat?.(event.nativeEvent.heartRate);
  };

  const onFingerRemovedCallback = (event: FingerRemovedEvent) => {
    onFingerRemoved?.(event.nativeEvent);
  };

  const onMeasurementErrorCallback = (event: MeasurementErrorEvent) => {
    onMeasurementError?.(event.nativeEvent.message);
  };

  const onTimeRemainingCallback = (event: TimeRemainingEvent) => {
    onTimeRemaining?.(event.nativeEvent.seconds);
  };

  useImperativeHandle(ref, () => ({
    startMeasurement: () => {
      if (nativeRef.current) {
        Commands.startMeasurement(nativeRef.current);
      }
    },
    startRecording: () => {
      if (nativeRef.current) {
        Commands.startRecording(nativeRef.current);
      }
    },
    resetModule: () => {
      if (nativeRef.current) {
        Commands.resetModule(nativeRef.current);
      }
    },
  }));

  return (
    <FibriCheck
      ref={nativeRef}

      style={style}
      drawGraph={drawGraph}
      drawBackground={drawBackground}
      accEnabled={accEnabled}
      flashEnabled={flashEnabled}
      gravEnabled={gravEnabled}
      gyroEnabled={gyroEnabled}
      movementDetectionEnabled={movementDetectionEnabled}
      rotationEnabled={rotationEnabled}
      waitForStartRecordingSignal={waitForStartRecordingSignal}

      lineColor={lineColor}
      lineThickness={lineThickness}

      graphBackgroundColor={graphBackgroundColor}

      sampleTime={sampleTime}
      fingerDetectionExpiryTime={fingerDetectionExpiryTime}
      pulseDetectionExpiryTime={pulseDetectionExpiryTime}

      onSampleReady={onSampleReadyCallback}
      onFingerDetected={onFingerDetected}
      onFingerRemoved={onFingerRemovedCallback}
      onCalibrationReady={onCalibrationReady}
      onHeartBeat={onHeartBeatCallback}
      onTimeRemaining={onTimeRemainingCallback}
      onMeasurementFinished={onMeasurementFinished}
      onMeasurementStart={onMeasurementStart}
      onFingerDetectionTimeExpired={onFingerDetectionTimeExpired}
      onPulseDetected={onPulseDetected}
      onPulseDetectionTimeExpired={onPulseDetectionTimeExpired}
      onMovementDetected={onMovementDetected}
      onMeasurementProcessed={onMeasurementProcessedCallback}
      onMeasurementError={onMeasurementErrorCallback}
    />
  );
  }), {
  /**
   * @deprecated Will be removed in favor of the new import RNFibriCheckVersion
   */
  versionNumber: packageVersion.version,
});

export const versionNumber = packageVersion.version;
export default FibriCheckView;

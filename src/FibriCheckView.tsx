import React, { Component, useCallback, useEffect, useRef } from 'react';
import {
  requireNativeComponent,
  UIManager,
  findNodeHandle,
  NativeSyntheticEvent,
  ViewStyle,
  ColorValue,
  NativeMethods,
} from 'react-native';
import packageVersion from '../package-version.json';
import { CameraData, MeasurementError } from './types';

export type SampleReadyEventData = { ppg: number; raw: number; }
export type SampleReadyEvent = NativeSyntheticEvent<SampleReadyEventData>

export type MeasurementProcessedEventData = { measurement: string }
export type MeasurementProcessedEvent = NativeSyntheticEvent<MeasurementProcessedEventData>

export type HeartBeatEventData = { heartRate: number }
export type HeartBeatEvent = NativeSyntheticEvent<HeartBeatEventData>

export type FingerRemovedEventData = { y: number; v: number; stdDevY: number; }
export type FingerRemovedEvent = NativeSyntheticEvent<FingerRemovedEventData>

export type MeasurementErrorEventData = { message: MeasurementError }
export type MeasurementErrorEvent = NativeSyntheticEvent<MeasurementErrorEventData>

export type TimeRemainingEventData = { seconds: number }
export type TimeRemainingEvent = NativeSyntheticEvent<TimeRemainingEventData>

export type EmptyEvent = NativeSyntheticEvent<void>
interface FibriCheckNative {
  style?: ViewStyle,

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
  lineThickness: number;

  graphBackgroundColor?: ColorValue;

  sampleTime: number;
  fingerDetectionExpiryTime: number;
  pulseDetectionExpiryTime: number;

  onSampleReady: (event: SampleReadyEvent) => void;
  onFingerDetected: (event: EmptyEvent) => void;
  onFingerRemoved: (event: FingerRemovedEvent) => void;
  onCalibrationReady: (event: EmptyEvent) => void;
  onHeartBeat: (event: HeartBeatEvent) => void;
  onTimeRemaining: (event: TimeRemainingEvent) => void;
  onMeasurementFinished: (event: EmptyEvent) => void;
  onMeasurementStart: (event: EmptyEvent) => void;
  onFingerDetectionTimeExpired: (event: EmptyEvent) => void;
  onPulseDetected: (event: EmptyEvent) => void;
  onPulseDetectionTimeExpired: (event: EmptyEvent) => void;
  onMovementDetected: (event: EmptyEvent) => void;
  onMeasurementProcessed: (event: MeasurementProcessedEvent) => void;
  onMeasurementError: (event: MeasurementErrorEvent) => void;
}

const FibriCheck = requireNativeComponent<FibriCheckNative>('FibriCheck');

type FibriCheckViewProps = {
  style?: ViewStyle;

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
};

const FibriCheckView = ({
  style = {
    flex: 1,
    backgroundColor: '#ffffff',
  },

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
  pulseDetectionExpiryTime= 10,
  
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
  onMeasurementError
}: FibriCheckViewProps) => {
  const nativeRef = useRef<Component<FibriCheckNative> & NativeMethods>(null);

  const onSampleReadyCallback = useCallback((event: SampleReadyEvent) => {
    onSampleReady?.(event.nativeEvent);
  }, [onSampleReady]);

  const onMeasurementProcessedCallback = useCallback((event: MeasurementProcessedEvent) => {
    onMeasurementProcessed?.({
      ...JSON.parse(event.nativeEvent.measurement),
      measurement_timestamp: Date.now(),
    });
  }, [onMeasurementProcessed]);

  const onHeartBeatCallback = useCallback((event: HeartBeatEvent) => {
    onHeartBeat?.(event.nativeEvent.heartRate);
  }, [onHeartBeat]);

  const onFingerRemovedCallback = useCallback((event: FingerRemovedEvent) => {
    onFingerRemoved?.(event.nativeEvent);
  }, [onFingerRemoved]);

  const onMeasurementErrorCallback = useCallback((event: MeasurementErrorEvent) => {
    onMeasurementError?.(event.nativeEvent.message);
  }, [onMeasurementError]);

  const onTimeRemainingCallback = useCallback((event: TimeRemainingEvent) => {
    onTimeRemaining?.(event.nativeEvent.seconds);
  }, [onTimeRemaining]);

  useEffect(() => {
    return () => {
      const handle = findNodeHandle(nativeRef.current);
      UIManager.dispatchViewManagerCommand(
        handle,
        UIManager.getViewManagerConfig('FibriCheck').Commands.resetModule,
        []
      );
    }
  }, []);

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
}

FibriCheckView.versionNumber = packageVersion.version;
export const versionNumber = packageVersion.version;

export default FibriCheckView;
import { Component, forwardRef, useImperativeHandle, useRef } from 'react';
import {
  requireNativeComponent,
  NativeSyntheticEvent,
  ViewStyle,
  ColorValue,
  NativeMethods,
  findNodeHandle,
  UIManager,
} from 'react-native';
import packageVersion from '../package-version.json';
import { CameraData, MeasurementError } from './types';

enum NativeCommand {
  StartMeasurement = "startMeasurement",
  StartRecording = "startRecording",
  ResetModule = "resetModule"
}

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

export interface RawDataEventData { image: string, cameraData: Record<string, string> }
export type RawDataEvent = NativeSyntheticEvent<RawDataEventData>

export type EmptyEvent = NativeSyntheticEvent<void>

export interface FibriCheckViewHandle {
  startMeasurement: () => void
  startRecording: () => void
  resetModule: () => void
}

interface FibriCheckNative {
  style?: ViewStyle;

  preview: boolean;
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

  cameraSettings?: CameraSettings;

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
  onRawData: (event: RawDataEvent) => void;
}

const FibriCheck = requireNativeComponent<FibriCheckNative>('FibriCheck');

interface FibriCheckViewProps {
  style?: ViewStyle;

  preview?: boolean;
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

  cameraSettings?: CameraSettings;

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
  onRawData?: (image: string, cameraData: Record<string, string>) => void;
}

type CameraSettingsMode = 'auto' | 'locked' | 'manual'
type WhiteBalanceMode = 'auto' | 'locked' | 'manual-rgb' | 'manual-kelvin'

interface CameraSettings {
  exposureMode?: CameraSettingsMode;
  focusMode?: CameraSettingsMode;
  whiteBalanceMode?: WhiteBalanceMode;

  iso?: number;
  exposureTime?: number;
  focus?: number;
  whiteBalanceRgb?: [number, number, number];
  whiteBalanceKelvin?: number;

  rawDataEnabled?: boolean;

  logExposure?: boolean;
  logFocus?: boolean;
  logWhiteBalance?: boolean;
}

const FibriCheckView = Object.assign(forwardRef<FibriCheckViewHandle, FibriCheckViewProps>(({
  style = {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  preview = false,
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

  cameraSettings,

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
  onRawData
}: FibriCheckViewProps, ref) => {
  const nativeRef = useRef<Component<FibriCheckNative> & NativeMethods>(null);
  const onSampleReadyCallback = (event: SampleReadyEvent) => {
    onSampleReady?.(event.nativeEvent);
  }

  const onMeasurementProcessedCallback =(event: MeasurementProcessedEvent) => {
    onMeasurementProcessed?.({
      ...JSON.parse(event.nativeEvent.measurement),
      measurement_timestamp: Date.now(),
    });
  };

  const onHeartBeatCallback = (event: HeartBeatEvent) => {
    onHeartBeat?.(event.nativeEvent.heartRate);
  }

  const onFingerRemovedCallback = (event: FingerRemovedEvent) => {
    onFingerRemoved?.(event.nativeEvent);
  }

  const onMeasurementErrorCallback = (event: MeasurementErrorEvent) => {
    onMeasurementError?.(event.nativeEvent.message);
  }

  const onTimeRemainingCallback = (event: TimeRemainingEvent) => {
    onTimeRemaining?.(event.nativeEvent.seconds);
  }

  const sendCommand = (command: NativeCommand) => {
    const handle = findNodeHandle(nativeRef.current);
    // @ts-ignore
    UIManager.dispatchViewManagerCommand(
      handle,
      // @ts-ignore
      command,
      []
    );
  }

  const onRawDataCallback = (event: RawDataEvent) => {
    onRawData?.(event.nativeEvent.image, event.nativeEvent.cameraData);
  }

  useImperativeHandle(ref, () => ({
    startMeasurement: () => { sendCommand(NativeCommand.StartMeasurement) },
    startRecording: () => { sendCommand(NativeCommand.StartRecording) },
    resetModule: () => { sendCommand(NativeCommand.ResetModule) }
  }))

  return (
    <FibriCheck
      ref={nativeRef}

      style={style}
      preview={preview}
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

      cameraSettings={cameraSettings}

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
      onRawData={onRawDataCallback}
    />
  );
}), {
  /**
   * @deprecated Will be removed in favor of the new import RNFibriCheckVersion
   */
  versionNumber: packageVersion.version
})

export const versionNumber = packageVersion.version;
export default FibriCheckView;

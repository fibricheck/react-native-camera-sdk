import { Component, forwardRef, useImperativeHandle, useRef } from 'react';
import {
  requireNativeComponent,
  NativeSyntheticEvent,
  ViewStyle,
  ColorValue,
  NativeMethods,
  findNodeHandle,
  UIManager,
  NativeModules,
} from 'react-native';
import packageVersion from '../package-version.json';
import { CameraData, MeasurementError } from './types';

enum NativeCommand {
  StartMeasurement = "startMeasurement",
  StartRecording = "startRecording",
  ResetModule = "resetModule",
  StartRawData = "startRawData",
  StopRawData = "stopRawData",
  GetCameraInfo = "getCameraInfo"
}

const ONE_SECOND_NANOS = 1_000_000_000

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

export interface CameraSettingsInfo {
  isoRange: [number, number];
  exposureTimeRange: [number, number];
  focusRange: [number, number];
  hardwareLevel: number;
  hasManualPostProcessing: boolean;
}

export type CameraSettingsInfoEvent = NativeSyntheticEvent<CameraSettingsInfo>
export interface RawDataEventData {
  image: string,
  cameraData: {
    [key: string]: string
  }
}
export type RawDataEvent = NativeSyntheticEvent<RawDataEventData>

export type EmptyEvent = NativeSyntheticEvent<void>

export enum WhiteBalanceMode {
  Auto = "auto",
  Temperature = "temperature",
  Gains = "gains"
}

export interface RNFibriCheckViewHandle {
  startMeasurement: () => void
  startRecording: () => void
  resetModule: () => void
  resetAutoFocus: () => void
  startRawData: () => void
  stopRawData: () => void
  getCameraInfo: () => void
}

interface FibriCheckNative {
  style?: ViewStyle;

  drawGraph: boolean;
  drawBackground: boolean;
  accEnabled: boolean;
  flashEnabled: boolean;
  gravEnabled: boolean;
  gyroEnabled: boolean;
  movementDetectionEnabled: boolean;
  rotationEnabled: boolean;
  waitForStartRecordingSignal: boolean;

  manualExposureEnabled: boolean;
  manualIso: number;
  manualExposureTime: number;

  manualFocusEnabled: boolean;
  manualFocus: number;

  whiteBalanceMode: WhiteBalanceMode;
  manualWhiteBalance: number;
  manualGains?: number[];

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
  onRawData: (event: RawDataEvent) => void;
  onCameraInfo: (event: CameraSettingsInfoEvent) => void;
}

const FibriCheck = requireNativeComponent<FibriCheckNative>('FibriCheck');

interface FibriCheckViewProps {
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

  manualExposureEnabled?: boolean;
  manualIso?: number;
  manualExposureTime?: number;

  manualFocusEnabled?: boolean;
  manualFocus?: number;

  whiteBalanceMode?: WhiteBalanceMode;
  manualWhiteBalance?: number;
  manualGains?: number[];

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
  onRawData?: (imageBase64: string, cameraData: { [key: string]: string } ) => void;
  onCameraInfo?: (cameraSettingsInfo: CameraSettingsInfo) => void;
}

export const RNFibriCheckView = Object.assign(forwardRef<RNFibriCheckViewHandle, FibriCheckViewProps>(({
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

  manualExposureEnabled = false,
  manualIso = 100,
  manualExposureTime = ONE_SECOND_NANOS / 150,

  manualFocusEnabled = false,
  manualFocus = 0,

  whiteBalanceMode = WhiteBalanceMode.Auto,
  manualWhiteBalance = 5000,
  manualGains,

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
  onCameraInfo,
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

  const onCameraInfoCallback = (event: CameraSettingsInfoEvent) => {
    onCameraInfo?.(event.nativeEvent);
  }

  const onRawDataCallback = (event: RawDataEvent) => {
    onRawData?.(event.nativeEvent.image, event.nativeEvent.cameraData);
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

  useImperativeHandle(ref, () => ({
    startMeasurement: () => { sendCommand(NativeCommand.StartMeasurement) },
    startRecording: () => { sendCommand(NativeCommand.StartRecording) },
    resetModule: () => { sendCommand(NativeCommand.ResetModule) },
    resetAutoFocus: () => { sendCommand(NativeCommand.ResetModule) },
    startRawData: () => { sendCommand(NativeCommand.StartRawData) },
    stopRawData: () => { sendCommand(NativeCommand.StopRawData) },
    getCameraInfo: () => { sendCommand(NativeCommand.GetCameraInfo ) }
  }))

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

      manualExposureEnabled={manualExposureEnabled}
      manualIso={manualIso}
      manualExposureTime={manualExposureTime}

      manualFocusEnabled={manualFocusEnabled}
      manualFocus={manualFocus}

      whiteBalanceMode={whiteBalanceMode}
      manualWhiteBalance={manualWhiteBalance}
      manualGains={manualGains}

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
      onCameraInfo={onCameraInfoCallback}
      onRawData={onRawDataCallback}
    />
  );
}), {
  /**
   * @deprecated Will be removed in favor of the new import RNFibriCheckVersion
   */
  versionNumber: packageVersion.version
})

const { FibriCheck: FibriCheckModule } = NativeModules

export function getCameraInfo(): Promise<CameraSettingsInfo> {
  return FibriCheckModule.getCameraInfo();
}

export const RNFibriCheckVersion = packageVersion.version;

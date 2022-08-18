/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import {
  requireNativeComponent,
  UIManager,
  findNodeHandle,
} from 'react-native';
import packageVersion from '../package-version.json';
import { CameraData } from './types';

type FibriCheckViewProps = typeof FibriCheckView.defaultProps & {
  style?: any;
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
  pulseDetectionExpiryTime?: number;
  waitForStartRecordingSignal?: boolean;
  onFingerDetected?: () => void;
  onFingerRemoved?: () => void;
  onFingerDetectionTimeExpired?: () => void;
  onCalibrationReady?: () => void;
  onHeartBeat?: (heartRate: number) => void;
  onMeasurementFinished?: () => void;
  onMeasurementStart?: () => void;
  onTimeRemaining?: (seconds: number) => void;
  onSampleReady?: (data: { ppg: number; raw: number; }) => void;
  onPulseDetected?: () => void;
  onPulseDetectionTimeExpired?: () => void;
  onMovementDetected?: () => void;
  onMeasurementProcessed?: (data: CameraData) => void;
  onMeasurementError?: (message: MeasurementError) => void;
};

export default class FibriCheckView extends React.Component<FibriCheckViewProps> {
  static propTypes = {};

  static defaultProps = {
    style: {
      flex: 1,
      backgroundColor: '#ffffff',
    },
    drawGraph: true,
    lineColor: '#63b3a6',
    lineThickness: 8,
    drawBackground: true,
    sampleTime: 60,
    flashEnabled: true,
    gravEnabled: false,
    gyroEnabled: false,
    accEnabled: false,
    rotationEnabled: false,
    movementDetectionEnabled: true,
    fingerDetectionExpiryTime: -1,
    pulseDetectionExpiryTime: 10,
    waitForStartRecordingSignal: false,
  };

  static versionNumber = packageVersion.version;

  constructor(props) {
    console.log('constructor', props);
    super(props);
  }

  componentWillUnmount() {
    const handle = findNodeHandle(this);
    // @ts-ignore
    UIManager.dispatchViewManagerCommand(
      handle,
      // @ts-ignore
      UIManager.FibriCheck.Commands.resetModule,
      []
    );
  }

  render() {
    const propsMapped = {
      ...(this.props.onSampleReady ? { onSampleReady: event => this.props.onSampleReady(event.nativeEvent) } : {}),
      ...(this.props.onMeasurementProcessed ? {
        onMeasurementProcessed:
          event => {
            this.props.onMeasurementProcessed({
              ...JSON.parse(event.nativeEvent.measurement),
              measurement_timestamp: Date.now(),
            });
          },
      } : {}),
      ...(this.props.onHeartBeat ? { onHeartBeat: event => this.props.onHeartBeat(event.nativeEvent.heartRate) } : {}),
      ...(this.props.onMeasurementError ? { onMeasurementError: event => this.props.onMeasurementError(event.nativeEvent.message) } : {}),
      ...(this.props.onTimeRemaining ? { onTimeRemaining: event => this.props.onTimeRemaining(event.nativeEvent.seconds) } : {}),
    };

    return (
      <FibriCheck
        {...this.props}
        {...propsMapped}
      />
    );
  }
}

const FibriCheck = requireNativeComponent('FibriCheck', FibriCheckView);

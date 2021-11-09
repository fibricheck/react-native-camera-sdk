/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import {
  requireNativeComponent,
  UIManager,
  findNodeHandle,
} from 'react-native';
import { CameraData } from './types';

type FibriCheckViewProps = typeof FibriCheckView.defaultProps & {
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
  onHeartBeat: (heartRate: number) => void;
  onMeasurementFinished?: () => void;
  onMeasurementStart?: () => void;
  onTimeRemaining: (seconds: number) => void;
  onSampleReady: (data: { ppg: number; raw: number; }) => void;
  onPulseDetected?: () => void;
  onPulseDetectionTimeExpired?: () => void;
  onMovementDetected?: () => void;
  onMeasurementProcessed: (data: CameraData) => void;
};

export default class FibriCheckView extends React.Component<FibriCheckViewProps> {
  static propTypes = {};

  static defaultProps = {
    drawGraph: true,
    lineColor: '#0073ff',
    lineThickness: 8,
    drawBackground: true,
    sampleTime: 60,
    flashEnabled: true,
    gravEnabled: true,
    gyroEnabled: true,
    accEnabled: true,
    rotationEnabled: true,
    movementDetectionEnabled: true,
    fingerDetectionExpiryTime: 10,
    waitForStartRecordingSignal: false,
  };

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
    return (
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      <FibriCheck
        {...this.props}
        // @ts-ignore
        onSampleReady={event => this.props.onSampleReady(event.nativeEvent)}
        onMeasurementProcessed={event => this.props.onMeasurementProcessed(JSON.parse(event.nativeEvent))}
        onHeartBeat={event => this.props.onHeartBeat(event.nativeEvent.heartRate)}
        onTimeRemaining={event => this.props.onTimeRemaining(event.nativeEvent.seconds)}
      />
    );
  }
}

const FibriCheck = requireNativeComponent('FibriCheck', FibriCheckView);

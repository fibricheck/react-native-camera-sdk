/* eslint-disable camelcase */
interface MotionData {
  x: number[];
  y: number[];
  z: number[];
}

interface Yuv {
  u: number[];
  v: number[];
  y: number[];
}

type Abnormalities =
  | 'inverted'
  | 'bad_signal_quality'
  | 'pulse_not_found'
  | 'saturated_rgb'
  | 'quality_flag' | 'finger_not_found';

export interface CameraData {
  acc?: MotionData;
  rotation?: MotionData;
  grav?: MotionData;
  gyro?: MotionData;
  heartrate: number;
  measurement_timestamp: number;
  quadrants: Yuv[][];
  technicalDetails: {
    camera_exposure_time: number;
    camera_hardware_level: string;
    camera_iso: number;
  };
  time: number[];
  yList: number[];
  abnormalities?: Abnormalities[];
  attempts?: number;
}

export enum MeasurementError {
  BrokenAccSensor = 'BROKEN_ACC_SENSOR'
}

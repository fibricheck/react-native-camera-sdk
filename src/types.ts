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
    [key: string]: unknown;
  };
  camera_settings?: Record<string, unknown>;
  time: number[];
  attempts?: number;
}

export enum MeasurementError {
  BrokenAccSensor = 'BROKEN_ACC_SENSOR'
}

export interface LabelInfo {
  componentName: string;
  udi: string;
  ceLabel: string;
  manufacturer: string;
  releaseDate: string;
  ifu: string;
}

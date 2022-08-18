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
  };
  time: number[];
  attempts?: number;
}

export enum MeasurementError {
  BrokenAccSensor = 'BROKEN_ACC_SENSOR'
}

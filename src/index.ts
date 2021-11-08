import RNFibriCheckView from './FibriCheckView';

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

interface CameraData {
  acc?: MotionData;
  rotation?: MotionData;
  grav?: MotionData;
  gyro?: MotionData;
  heartrate: number;
  measurementTimestamp: Date;
  quadrants: Yuv[][];
  technicalDetails: {
    camera_exposure_time: number;
    camera_hardware_level: string;
    camera_iso: number;
  }
  time: number[];
  yList: number[]
}

export { RNFibriCheckView, CameraData };

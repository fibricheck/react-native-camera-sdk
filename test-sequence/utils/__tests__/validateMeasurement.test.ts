import { Platform } from 'react-native';
import type { CameraData } from '@fibricheck/react-native-camera-sdk';
import { validateMeasurement, SensorConfig } from '../validateMeasurement';

const allSensors: SensorConfig = {
  accEnabled: true,
  gyroEnabled: true,
  gravEnabled: true,
  rotationEnabled: true,
};

const noSensors: SensorConfig = {
  accEnabled: false,
  gyroEnabled: false,
  gravEnabled: false,
  rotationEnabled: false,
};

const sensorArray = [1, 2, 3];

const measurementData: CameraData = {
  heartrate: 72,
  quadrants: [1, 2, 3, 4] as unknown as CameraData['quadrants'],
  time: [0, 1, 2] as unknown as CameraData['time'],
  measurement_timestamp: '2026-01-01T00:00:00Z',
  acc: { x: sensorArray, y: sensorArray, z: sensorArray },
  gyro: { x: sensorArray, y: sensorArray, z: sensorArray },
  grav: { x: sensorArray, y: sensorArray, z: sensorArray },
  rotation: { x: sensorArray, y: sensorArray, z: sensorArray },
  technicalDetails: {
    camera_hardware_level: 'camera2 - full',
    camera_resolution: '176x144',
  } as unknown as CameraData['technicalDetails'],
  camera_settings: {
    exposure_mode: 'auto',
    hdr_profile: 'none',
    hdr_mode: 'off',
  } as unknown as CameraData['camera_settings'],
} as unknown as CameraData;

const setPlatform = (os: 'ios' | 'android') => {
  Object.defineProperty(Platform, 'OS', { get: () => os });
};

describe('validateMeasurement', () => {
  beforeEach(() => setPlatform('ios'));

  describe('required fields', () => {
    it('returns null for valid measurement data on iOS', () => {
      expect(validateMeasurement(measurementData, allSensors)).toBeNull();
    });

    it('returns null for valid measurement data on Android (no camera_settings/camera_hdr reported by android-camera-sdk v1.0.2)', () => {
      setPlatform('android');
      const data = { ...measurementData, camera_settings: undefined };
      expect(validateMeasurement(data as unknown as CameraData, allSensors)).toBeNull();
    });

    it('returns an error when heartrate is missing', () => {
      const data = { ...measurementData, heartrate: 0 };
      expect(validateMeasurement(data as unknown as CameraData, noSensors)).toMatch(/heartrate/);
    });

    it('returns an error when quadrants is empty', () => {
      const data = { ...measurementData, quadrants: [] };
      expect(validateMeasurement(data as unknown as CameraData, noSensors)).toMatch(/quadrants/);
    });

    it('returns an error when time vector is empty', () => {
      const data = { ...measurementData, time: [] };
      expect(validateMeasurement(data as unknown as CameraData, noSensors)).toMatch(/time/);
    });

    it('returns an error when measurement_timestamp is missing', () => {
      const data = { ...measurementData, measurement_timestamp: undefined };
      expect(validateMeasurement(data as unknown as CameraData, noSensors)).toMatch(/measurement_timestamp/);
    });
  });

  describe('sensor data', () => {
    it('returns an error when accEnabled and acc data is missing', () => {
      const data = { ...measurementData, acc: undefined };
      expect(validateMeasurement(data as unknown as CameraData, { ...noSensors, accEnabled: true })).toMatch(/acc/);
    });

    it('returns an error when gyroEnabled and gyro data is missing', () => {
      const data = { ...measurementData, gyro: undefined };
      expect(validateMeasurement(data as unknown as CameraData, { ...noSensors, gyroEnabled: true })).toMatch(/gyro/);
    });

    it('returns an error when gravEnabled and grav data is missing', () => {
      const data = { ...measurementData, grav: undefined };
      expect(validateMeasurement(data as unknown as CameraData, { ...noSensors, gravEnabled: true })).toMatch(/grav/);
    });

    it('returns an error when rotationEnabled and rotation data is missing', () => {
      const data = { ...measurementData, rotation: undefined };
      expect(validateMeasurement(data as unknown as CameraData, { ...noSensors, rotationEnabled: true })).toMatch(
        /rotation/
      );
    });

    it('does not require sensor data when sensors are disabled', () => {
      const data = { ...measurementData, acc: undefined, gyro: undefined, grav: undefined, rotation: undefined };
      expect(validateMeasurement(data as unknown as CameraData, noSensors)).toBeNull();
    });
  });

  describe('technical details', () => {
    it('returns an error when technicalDetails is missing', () => {
      const data = { ...measurementData, technicalDetails: undefined };
      expect(validateMeasurement(data as unknown as CameraData, noSensors)).toMatch(/technicalDetails/);
    });

    it('does not require Android-specific fields on iOS', () => {
      setPlatform('ios');
      const data = {
        ...measurementData,
        technicalDetails: {} as unknown as CameraData['technicalDetails'],
      };
      expect(validateMeasurement(data as unknown as CameraData, noSensors)).toBeNull();
    });

    it('returns an error on Android when camera_hardware_level is missing', () => {
      setPlatform('android');
      const data = {
        ...measurementData,
        camera_settings: undefined,
        technicalDetails: { camera_resolution: '176x144' } as unknown as CameraData['technicalDetails'],
      };
      expect(validateMeasurement(data as unknown as CameraData, noSensors)).toMatch(/camera_hardware_level/);
    });

    it('returns an error on Android when camera_resolution is missing', () => {
      setPlatform('android');
      const data = {
        ...measurementData,
        camera_settings: undefined,
        technicalDetails: { camera_hardware_level: 'camera2 - full' } as unknown as CameraData['technicalDetails'],
      };
      expect(validateMeasurement(data as unknown as CameraData, noSensors)).toMatch(/camera_resolution/);
    });

    // android-camera-sdk is pinned to v1.0.2 (see android/build.gradle), which does not report
    // technicalDetails.camera_hdr or camera_settings at all, so nothing to validate there on Android.
    it('does not require camera_hdr or camera_settings on Android', () => {
      setPlatform('android');
      const data = {
        ...measurementData,
        camera_settings: undefined,
        technicalDetails: {
          camera_hardware_level: 'camera2 - full',
          camera_resolution: '176x144',
        } as unknown as CameraData['technicalDetails'],
      };
      expect(validateMeasurement(data as unknown as CameraData, noSensors)).toBeNull();
    });
  });

  describe('camera settings (iOS only)', () => {
    it('returns an error when camera_settings is missing', () => {
      const data = { ...measurementData, camera_settings: undefined };
      expect(validateMeasurement(data as unknown as CameraData, noSensors)).toMatch(/camera_settings/);
    });

    it('returns an error when exposure_mode is missing', () => {
      const data = { ...measurementData, camera_settings: { hdr_profile: 'none', hdr_mode: 'off' } };
      expect(validateMeasurement(data as unknown as CameraData, noSensors)).toMatch(/exposure_mode/);
    });

    it('returns an error when hdr_profile is missing', () => {
      const data = { ...measurementData, camera_settings: { exposure_mode: 'auto', hdr_mode: 'off' } };
      expect(validateMeasurement(data as unknown as CameraData, noSensors)).toMatch(/hdr_profile/);
    });

    it('returns an error when hdr_mode is missing', () => {
      const data = { ...measurementData, camera_settings: { exposure_mode: 'auto', hdr_profile: 'none' } };
      expect(validateMeasurement(data as unknown as CameraData, noSensors)).toMatch(/hdr_mode/);
    });
  });
});

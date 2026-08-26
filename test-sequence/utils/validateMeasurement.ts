import { Platform } from 'react-native';
import type { CameraData } from '@fibricheck/react-native-camera-sdk';

export interface SensorConfig {
  accEnabled: boolean;
  gyroEnabled: boolean;
  gravEnabled: boolean;
  rotationEnabled: boolean;
}

export function validateMeasurement(data: CameraData, config: SensorConfig): string | null {
  if (!data.heartrate) return 'heartrate is missing';
  if (!data.quadrants || data.quadrants.length === 0) return 'quadrants is missing or empty';
  if (!data.time || data.time.length === 0) return 'time is missing or empty';
  if (!data.measurement_timestamp) return 'measurement_timestamp is missing';

  if (config.accEnabled && (!data.acc || !data.acc.x || data.acc.x.length === 0))
    return 'acc data is missing or empty — accelerometer was enabled but produced no data';
  if (config.gyroEnabled && (!data.gyro || !data.gyro.x || data.gyro.x.length === 0))
    return 'gyro data is missing or empty — gyroscope was enabled but produced no data';
  if (config.gravEnabled && (!data.grav || !data.grav.x || data.grav.x.length === 0))
    return 'grav data is missing or empty — gravitation was enabled but produced no data';
  if (config.rotationEnabled && (!data.rotation || !data.rotation.x || data.rotation.x.length === 0))
    return 'rotation data is missing or empty — rotation was enabled but produced no data';

  if (!data.technicalDetails) return 'technicalDetails is missing';
  if (Platform.OS === 'android') {
    if (!data.technicalDetails.camera_hardware_level) return 'technicalDetails.camera_hardware_level is missing';
    if (!data.technicalDetails.camera_resolution) return 'technicalDetails.camera_resolution is missing';
  }

  // android-camera-sdk is pinned to v1.0.2 (see android/build.gradle) until upstream issues found
  // in v1.1.x are fixed. That version reports neither technicalDetails.camera_hdr nor camera_settings
  // (exposure_mode, hdr_profile, hdr_mode, focus_mode, focus, white_balance) at all, so none of it can
  // be validated on Android for now. iOS already has the full feature set.
  if (Platform.OS === 'ios') {
    const settings = data.camera_settings as Record<string, unknown> | undefined;
    if (!settings) return 'camera_settings is missing';
    if (!settings.exposure_mode) return 'camera_settings.exposure_mode is missing';
    if (!settings.hdr_profile) return 'camera_settings.hdr_profile is missing';
    if (!settings.hdr_mode) return 'camera_settings.hdr_mode is missing';
  }

  return null;
}

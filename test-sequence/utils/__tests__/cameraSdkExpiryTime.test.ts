import { cameraSdkExpiryTime } from '../cameraSdkExpiryTime';

describe('cameraSdkExpiryTime', () => {
  it('converts positive values to milliseconds for android-camera-sdk 1.0.2', () => {
    expect(cameraSdkExpiryTime(1, 'android')).toBe(1000);
    expect(cameraSdkExpiryTime(30, 'android')).toBe(30000);
  });

  it('preserves disabled Android expiry values', () => {
    expect(cameraSdkExpiryTime(-1, 'android')).toBe(-1);
    expect(cameraSdkExpiryTime(0, 'android')).toBe(0);
  });

  it('preserves values in seconds on iOS', () => {
    expect(cameraSdkExpiryTime(1, 'ios')).toBe(1);
    expect(cameraSdkExpiryTime(30, 'ios')).toBe(30);
    expect(cameraSdkExpiryTime(-1, 'ios')).toBe(-1);
  });
});

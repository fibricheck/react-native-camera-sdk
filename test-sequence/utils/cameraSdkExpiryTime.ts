export function cameraSdkExpiryTime(seconds: number, platform: string): number {
  // android-camera-sdk 1.0.2 expects milliseconds. The 1.1.x line and iOS expect seconds.
  // Remove this conversion when Android is upgraded from the temporarily pinned 1.0.2 SDK.
  return platform === 'android' && seconds > 0 ? seconds * 1000 : seconds;
}

#import "RNTFibriCheckView.h"
#import <React/RCTLog.h>

@implementation RNTFibriCheckView

- (void)setSampleTime:(NSInteger *)sampleTime {
    _sampleTime = sampleTime;
    [self.delegate fibriCheckViewDidSetSampleTime];
}

- (void)setFlashEnabled:(BOOL)flashEnabled {
    _flashEnabled = flashEnabled;
    [self.delegate fibriCheckViewDidSetFlash];
}

- (void)setGravEnabled:(BOOL)gravEnabled {
    _gravEnabled = gravEnabled;
    [self.delegate fibriCheckViewDidSetGrav];
}

- (void)setGyroEnabled:(BOOL)gyroEnabled {
    _gyroEnabled = gyroEnabled;
    [self.delegate fibriCheckViewDidSetGyro];
}

- (void)setAccEnabled:(BOOL)accEnabled {
    _accEnabled = accEnabled;
    [self.delegate fibriCheckViewDidSetAcc];
}

- (void)setRotationEnabled:(BOOL)rotationEnabled {
    _rotationEnabled = rotationEnabled;
    [self.delegate fibriCheckViewDidSetRotation];
}

- (void)setMovementDetectionEnabled:(BOOL)movementDetectionEnabled {
    _movementDetectionEnabled = movementDetectionEnabled;
    [self.delegate fibriCheckViewDidSetMovementDetection];
}

- (void)setFingerDetectionExpiryTime:(NSInteger *)fingerDetectionExpiryTime {
    _fingerDetectionExpiryTime = fingerDetectionExpiryTime;
    [self.delegate fibriCheckViewDidSetFingerDetectionExpiryTime];
}

- (void)setWaitForStartRecordingSignal:(NSInteger *)waitForStartRecordingSignal {
    _waitForStartRecordingSignal = waitForStartRecordingSignal;
    [self.delegate fibriCheckViewDidSetWaitForStartRecordingSignal];
}


@end

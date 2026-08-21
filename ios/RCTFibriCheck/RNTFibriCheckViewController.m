#import "RNTFibriCheckViewController.h"
#import "RNCameraPreviewViewManager.h"
#import <React/RCTLog.h>
#import "FibriCheckerComponent.h"

@interface RNTFibriCheckViewController ()
@property (nonatomic, strong) FibriChecker *fibrichecker;
@end

/**
 * RNFibriCheckView and RNCameraPreviewView are two separate React Native view managers with no
 * direct reference to each other. RNCameraPreviewView needs the AVCaptureSession owned by
 * FibriChecker to render the camera feed, so we expose it here as a class-level pointer.
 *
 * Lifecycle:
 *   - Set by -activate once the React Native view is attached.
 *   - A "FibriCheckerReady" NSNotification is posted so RNCameraPreviewView knows it can safely
 *     call +sharedFibriChecker, regardless of which view mounts first.
 *   - Cleared by -invalidate when the React Native view is detached or recycled.
 */
static FibriChecker *_sharedFibriChecker;
static __weak RNTFibriCheckViewController *_sharedFibriCheckerOwner;

@implementation RNTFibriCheckViewController {
  BOOL _active;
  BOOL _idleTimerWasDisabled;
}

// React Native embeds this controller's view without UIKit view-controller containment, so the
// Paper/Fabric view-to-window callbacks explicitly call activate/invalidate.

+ (nullable FibriChecker *)sharedFibriChecker {
  return _sharedFibriChecker;
}

- (void)fibriCheckViewDidSetSampleTime {
    NSInteger sampleTime = ((RNTFibriCheckView*)self.view).sampleTime;
    _fibrichecker.sampleTime = sampleTime;
}

- (void)fibriCheckViewDidMoveToWindow:(UIWindow *)window {
  if (!self.legacyManaged) return;
  if (window) {
    [self activate];
  } else if (_active) {
    [self invalidate];
    // Break UIViewController -> view; the legacy view retains its controller through an
    // associated object until the view itself is released by React Native.
    self.view = nil;
  }
}

- (void)fibriCheckViewDidSetFlash {
    BOOL flashEnabled = ((RNTFibriCheckView*)self.view).flashEnabled;
    _fibrichecker.flashEnabled = flashEnabled;
}

- (void)fibriCheckViewDidSetGrav {
    BOOL gravEnabled = ((RNTFibriCheckView*)self.view).gravEnabled;
    _fibrichecker.gravEnabled = gravEnabled;
}

- (void)fibriCheckViewDidSetGyro {
    BOOL gyroEnabled = ((RNTFibriCheckView*)self.view).gyroEnabled;
    _fibrichecker.gyroEnabled = gyroEnabled;
}

- (void)fibriCheckViewDidSetAcc {
    BOOL accEnabled = ((RNTFibriCheckView*)self.view).accEnabled;
    _fibrichecker.accEnabled = accEnabled;
}

- (void)fibriCheckViewDidSetRotation {
    BOOL rotationEnabled = ((RNTFibriCheckView*)self.view).rotationEnabled;
    _fibrichecker.rotationEnabled = rotationEnabled;
}

- (void)fibriCheckViewDidSetMovementDetection {
    BOOL movementDetectionEnabled = ((RNTFibriCheckView*)self.view).movementDetectionEnabled;
    _fibrichecker.movementDetectionEnabled = movementDetectionEnabled;
}

- (void)fibriCheckViewDidSetFingerDetectionExpiryTime {
    NSInteger fingerDetectionExpiryTime = ((RNTFibriCheckView*)self.view).fingerDetectionExpiryTime;
    _fibrichecker.fingerDetectionExpiryTime = fingerDetectionExpiryTime;
}

- (void)fibriCheckViewDidSetPulseDetectionExpiryTime {
    NSInteger pulseDetectionExpiryTime = ((RNTFibriCheckView*)self.view).pulseDetectionExpiryTime;
    _fibrichecker.pulseDetectionExpiryTime = pulseDetectionExpiryTime;
}

- (void)fibriCheckViewDidSetWaitForStartRecordingSignal {
    BOOL waitForStartRecordingSignal = ((RNTFibriCheckView*)self.view).waitForStartRecordingSignal;
    _fibrichecker.waitForStartRecordingSignal = waitForStartRecordingSignal;
}

- (void)startMeasurement {
  if (!_active) {
    RCTLogError(@"[RNFibriCheckView] Cannot start measurement because this view is not the active measurement view.");
    return;
  }
  NSLog(@"startMeasurement");
  [_fibrichecker startMeasurement];
}

- (void)startRecording {
  if (!_active) {
    RCTLogError(@"[RNFibriCheckView] Cannot start recording because this view is not the active measurement view.");
    return;
  }
  NSLog(@"startRecording");
  [_fibrichecker startRecording];
}

- (void)stopCamera {
  NSLog(@"stopCamera");
  [_fibrichecker stop];
}

- (void)activate {
  if (_active) return;
  if ([RNCameraPreviewViewManager isStandalonePreviewActive]) {
    RCTLogError(@"[RNFibriCheckView] Cannot activate while a standalone camera preview is active.");
    return;
  }
  if (_sharedFibriCheckerOwner && _sharedFibriCheckerOwner != self) {
    RCTLogError(@"[RNFibriCheckView] Only one mounted FibriCheck measurement view is supported.");
    return;
  }
  _active = YES;
  _sharedFibriCheckerOwner = self;
  _sharedFibriChecker = self.fibrichecker;
  _idleTimerWasDisabled = [UIApplication sharedApplication].idleTimerDisabled;
  [UIApplication sharedApplication].idleTimerDisabled = YES;
  [[NSNotificationCenter defaultCenter] postNotificationName:@"FibriCheckerReady" object:nil];
}

- (void)invalidate {
  if (!_active) return;
  _active = NO;
  [self.fibrichecker stop];
  if (_sharedFibriCheckerOwner == self) {
    _sharedFibriCheckerOwner = nil;
    _sharedFibriChecker = nil;
    [UIApplication sharedApplication].idleTimerDisabled = _idleTimerWasDisabled;
  }
}

- (void)emitEvent:(RNTFibriCheckEvent)event body:(NSDictionary *)body {
  id<RNTFibriCheckEventDelegate> delegate = self.eventDelegate;
  if (delegate) [delegate fibriCheckViewController:self emitEvent:event body:body ?: @{}];
}

// MARK: - UI
- (void)viewDidLoad {
  [super viewDidLoad];
  if ([RNCameraPreviewViewManager isStandalonePreviewActive]) {
    RCTLogError(@"[RNFibriCheckView] Cannot mount RNFibriCheckView while RNCameraPreviewView is "
                @"in standalone mode — mount one or the other, not both simultaneously.");
  }
  self.fibrichecker = [FibriChecker new];
  [self addListeners];
}

- (void)loadView {
    RNTFibriCheckView *customView = [[RNTFibriCheckView alloc] init];
    customView.delegate = self;
    self.view = customView;
}

- (void)drawGraphPoint:(double)value {
  dispatch_async(dispatch_get_main_queue(), ^{
    RNTFibriCheckView *view = (RNTFibriCheckView *)self.view;
    [view addPoint:[NSNumber numberWithDouble:value]];
    [view setNeedsDisplay];
  });
}

- (void)addListeners {
  RCTLogInfo(@"addListeners");
  __weak typeof(self) weakSelf = self;

  self.fibrichecker.onMeasurementStart = ^{
    RCTLogInfo(@"Measurement start");
    dispatch_async(dispatch_get_main_queue(), ^{
        [weakSelf emitEvent:RNTFibriCheckEventMeasurementStart body:@{}];
    });
  };

  self.fibrichecker.onMeasurementFinished = ^{
    RCTLogInfo(@"Measurement Finished");
    dispatch_async(dispatch_get_main_queue(), ^{
        [weakSelf emitEvent:RNTFibriCheckEventMeasurementFinished body:@{}];
    });
  };

  self.fibrichecker.onMeasurementProcessed = ^(Measurement* measurement){
    RCTLogInfo(@"Measurement processed");
    NSDictionary *data = @{@"measurement":[measurement mapToJson]};
    dispatch_async(dispatch_get_main_queue(), ^{
        [weakSelf emitEvent:RNTFibriCheckEventMeasurementProcessed body:data];
    });
  };

  self.fibrichecker.onSampleReady = ^(double ppg, double raw) {
    BOOL drawGraph = ((RNTFibriCheckView*)weakSelf.view).drawGraph;
    if(drawGraph) [weakSelf drawGraphPoint:ppg];
    NSDictionary *data = @{@"ppg":[NSNumber numberWithFloat:ppg], @"raw":[NSNumber numberWithFloat:raw]};
    dispatch_async(dispatch_get_main_queue(), ^{
        [weakSelf emitEvent:RNTFibriCheckEventSampleReady body:data];
    });
  };

  self.fibrichecker.onCalibrationReady = ^{
    RCTLogInfo(@"Calibration Ready");
    dispatch_async(dispatch_get_main_queue(), ^{
        [weakSelf emitEvent:RNTFibriCheckEventCalibrationReady body:@{}];
    });
  };

  self.fibrichecker.onFingerRemoved = ^(double y, double v, double stdDevY){
    RCTLogInfo(@"Finger Removed");
    NSDictionary *data = @{@"y":[NSNumber numberWithFloat:y], @"v":[NSNumber numberWithFloat:v], @"stdDevY":[NSNumber numberWithFloat:stdDevY]};
    dispatch_async(dispatch_get_main_queue(), ^{
        [weakSelf emitEvent:RNTFibriCheckEventFingerRemoved body:data];
    });
  };

  self.fibrichecker.onFingerDetected = ^{
    RCTLogInfo(@"Finger Detected");
    dispatch_async(dispatch_get_main_queue(), ^{
        [weakSelf emitEvent:RNTFibriCheckEventFingerDetected body:@{}];
    });
  };

  self.fibrichecker.onMovementDetected = ^{
    RCTLogInfo(@"Movement Detected");
    dispatch_async(dispatch_get_main_queue(), ^{
        [weakSelf emitEvent:RNTFibriCheckEventMovementDetected body:@{}];
    });
  };

  self.fibrichecker.onPulseDetected = ^{
    RCTLogInfo(@"Pulse Detected");
    dispatch_async(dispatch_get_main_queue(), ^{
        [weakSelf emitEvent:RNTFibriCheckEventPulseDetected body:@{}];
    });
  };

  self.fibrichecker.onPulseDetectionTimeExpired = ^{
    RCTLogInfo(@"Pulse Detection Time Expired");
    dispatch_async(dispatch_get_main_queue(), ^{
        [weakSelf emitEvent:RNTFibriCheckEventPulseDetectionTimeExpired body:@{}];
    });
  };

  self.fibrichecker.onFingerDetectionTimeExpired = ^{
    RCTLogInfo(@"Finger Detection Time Expired");
    dispatch_async(dispatch_get_main_queue(), ^{
        [weakSelf emitEvent:RNTFibriCheckEventFingerDetectionTimeExpired body:@{}];
    });
  };

  self.fibrichecker.onHeartBeat = ^(NSUInteger value) {
    RCTLogInfo(@"Heart Beat Detected: %lu", value);
    NSDictionary *data = @{@"heartRate":[NSNumber numberWithInteger:value]};
    dispatch_async(dispatch_get_main_queue(), ^{
        [weakSelf emitEvent:RNTFibriCheckEventHeartBeat body:data];
    });
  };

  self.fibrichecker.onTimeRemaining = ^(NSUInteger seconds) {
    RCTLogInfo(@"Time Remaining: %lu", seconds);
    NSDictionary *data = @{@"seconds":[NSNumber numberWithInteger:seconds]};
    dispatch_async(dispatch_get_main_queue(), ^{
        [weakSelf emitEvent:RNTFibriCheckEventTimeRemaining body:data];
    });
  };

  self.fibrichecker.onMeasurementError = ^(NSString* message) {
    RCTLogInfo(@"Measurement error occured: %@", message);
    NSDictionary *data = @{@"message": message};
    dispatch_async(dispatch_get_main_queue(), ^{
        [weakSelf emitEvent:RNTFibriCheckEventMeasurementError body:data];
    });
  };
}

- (void)dealloc {
  [self invalidate];
}

@end

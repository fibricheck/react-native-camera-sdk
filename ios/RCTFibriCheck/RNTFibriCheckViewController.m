#import "RNTFibriCheckViewController.h"
#import <React/RCTLog.h>
#import "RCTFibriCheckEventEmitter.h"
#import "FibriCheckerComponent.h"

@interface RNTFibriCheckViewController ()
@property (nonatomic, strong) FibriChecker *fibrichecker;
@end

@implementation RNTFibriCheckViewController

- (void)fibriCheckViewDidSetSampleTime {
    NSInteger sampleTime = ((RNTFibriCheckView*)self.view).sampleTime;
    _fibrichecker.sampleTime = sampleTime;
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

- (void)fibriCheckViewDidSetWaitForStartRecordingSignal {
    NSInteger waitForStartRecordingSignal = ((RNTFibriCheckView*)self.view).waitForStartRecordingSignal;
    _fibrichecker.waitForStartRecordingSignal = waitForStartRecordingSignal;
}

- (void)stopCamera {
    _fibrichecker.stop;
}

// MARK: - UI
- (void)viewDidLoad {
  [super viewDidLoad];
  self.fibrichecker = [FibriChecker new];
  [self addListeners];
}

- (void)startMeasurement {
  NSLog(@"startMeasurement");
  [_fibrichecker startMeasurement];
}

- (void)loadView {
    RNTFibriCheckView *customView = [[RNTFibriCheckView alloc] init];
    customView.delegate = self;
    self.view = customView;
}

- (void)drawGraphPoint:(double)value {
  [((RNTFibriCheckView*)self.view) addPoint:[NSNumber numberWithDouble:value]];
  dispatch_async(dispatch_get_main_queue(), ^{
    [((RNTFibriCheckView*)self.view) setNeedsDisplay];
  });
}

- (void)addListeners {
  RCTLogInfo(@"addListeners");
  __unsafe_unretained typeof(self) weakSelf = self;

  self.fibrichecker.onMeasurementStart = ^{
    RCTLogInfo(@"Measurement start");
    dispatch_async(dispatch_get_main_queue(), ^{
        if(((RNTFibriCheckView*)weakSelf.view).onMeasurementStart != nil) ((RNTFibriCheckView*)weakSelf.view).onMeasurementStart(@{});
    });
  };

  self.fibrichecker.onMeasurementFinished = ^{
    RCTLogInfo(@"Measurement Finished");
    dispatch_async(dispatch_get_main_queue(), ^{
        if(((RNTFibriCheckView*)weakSelf.view).onMeasurementFinished != nil) ((RNTFibriCheckView*)weakSelf.view).onMeasurementFinished(@{});
    });
  };

  self.fibrichecker.onMeasurementProcessed = ^(Measurement* measurement){
    RCTLogInfo(@"Measurement processed");
    NSDictionary *data = @{@"measurement":[measurement mapToJson]};
    dispatch_async(dispatch_get_main_queue(), ^{
        if(((RNTFibriCheckView*)weakSelf.view).onMeasurementProcessed != nil) ((RNTFibriCheckView*)weakSelf.view).onMeasurementProcessed(data);
    });
  };

  self.fibrichecker.onSampleReady = ^(double ppg, double raw) {
    BOOL drawGraph = ((RNTFibriCheckView*)self.view).drawGraph;
    if(drawGraph) [weakSelf drawGraphPoint:ppg];
    NSDictionary *data = @{@"ppg":[NSNumber numberWithFloat:ppg], @"raw":[NSNumber numberWithFloat:raw]};
    dispatch_async(dispatch_get_main_queue(), ^{
        if(((RNTFibriCheckView*)weakSelf.view).onSampleReady != nil) ((RNTFibriCheckView*)weakSelf.view).onSampleReady(data);
    });
  };

  self.fibrichecker.onCalibrationReady = ^{
    RCTLogInfo(@"Calibration Ready");
    dispatch_async(dispatch_get_main_queue(), ^{
        if(((RNTFibriCheckView*)weakSelf.view).onCalibrationReady != nil) ((RNTFibriCheckView*)weakSelf.view).onCalibrationReady(@{});
    });
  };

  self.fibrichecker.onFingerRemoved = ^(double y, double v, double stdDevY){
    RCTLogInfo(@"Finger Removed");
    NSDictionary *data = @{@"y":[NSNumber numberWithFloat:y], @"v":[NSNumber numberWithFloat:v], @"stdDevY":[NSNumber numberWithFloat:stdDevY]};
    dispatch_async(dispatch_get_main_queue(), ^{
        if(((RNTFibriCheckView*)weakSelf.view).onFingerRemoved != nil) ((RNTFibriCheckView*)weakSelf.view).onFingerRemoved(data);
    });
  };

  self.fibrichecker.onFingerDetected = ^{
    RCTLogInfo(@"Finger Detected");
    dispatch_async(dispatch_get_main_queue(), ^{
        if(((RNTFibriCheckView*)weakSelf.view).onFingerDetected != nil) ((RNTFibriCheckView*)weakSelf.view).onFingerDetected(@{});
    });
  };

  self.fibrichecker.onMovementDetected = ^{
    RCTLogInfo(@"Movement Detected");
    dispatch_async(dispatch_get_main_queue(), ^{
        if(((RNTFibriCheckView*)weakSelf.view).onMovementDetected != nil) ((RNTFibriCheckView*)weakSelf.view).onMovementDetected(@{});
    });
  };

  self.fibrichecker.onPulseDetected = ^{
    RCTLogInfo(@"Pulse Detected");
    dispatch_async(dispatch_get_main_queue(), ^{
        if(((RNTFibriCheckView*)weakSelf.view).onPulseDetected != nil) ((RNTFibriCheckView*)weakSelf.view).onPulseDetected(@{});
    });
  };

  self.fibrichecker.onPulseDetectionTimeExpired = ^{
    RCTLogInfo(@"Pulse Detection Time Expired");
    dispatch_async(dispatch_get_main_queue(), ^{
        if(((RNTFibriCheckView*)weakSelf.view).onPulseDetectionTimeExpired != nil) ((RNTFibriCheckView*)weakSelf.view).onPulseDetectionTimeExpired(@{});
    });
  };

  self.fibrichecker.onFingerDetectionTimeExpired = ^{
    RCTLogInfo(@"Finger Detection Time Expired");
    dispatch_async(dispatch_get_main_queue(), ^{
        if(((RNTFibriCheckView*)weakSelf.view).onFingerDetectionTimeExpired != nil) ((RNTFibriCheckView*)weakSelf.view).onFingerDetectionTimeExpired(@{});
    });
  };

  self.fibrichecker.onHeartBeat = ^(NSUInteger value) {
    RCTLogInfo(@"Heart Beat Detected: %lu", value);
    NSDictionary *data = @{@"heartRate":[NSNumber numberWithInteger:value]};
    dispatch_async(dispatch_get_main_queue(), ^{
        if(((RNTFibriCheckView*)weakSelf.view).onHeartBeat != nil) ((RNTFibriCheckView*)weakSelf.view).onHeartBeat(data);
    });
  };

  self.fibrichecker.onTimeRemaining = ^(NSUInteger seconds) {
    RCTLogInfo(@"Time Remaining: %lu", seconds);
    NSDictionary *data = @{@"seconds":[NSNumber numberWithInteger:seconds]};
    dispatch_async(dispatch_get_main_queue(), ^{
        if(((RNTFibriCheckView*)weakSelf.view).onTimeRemaining != nil) ((RNTFibriCheckView*)weakSelf.view).onTimeRemaining(data);
    });
  };

  self.fibrichecker.onMeasurementError = ^(NSString* message) {
    RCTLogInfo(@"Measurement error occured: %@", message);
    NSDictionary *data = @{@"message": message};
    dispatch_async(dispatch_get_main_queue(), ^{
        if(((RNTFibriCheckView*)weakSelf.view).onMeasurementError != nil) ((RNTFibriCheckView*)weakSelf.view).onMeasurementError(data);
    });
  };
}

@end

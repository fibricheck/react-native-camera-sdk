#import "RNTFibriCheckViewController.h"
#import <React/RCTLog.h>
#import "RCTFibriCheckEventEmitter.h"
#import "FibriCheckerComponent.h"

@interface RNTFibriCheckViewController ()
@property (nonatomic, strong) FibriChecker *fibrichecker;
@end

@implementation RNTFibriCheckViewController

// MARK: - UI
- (void)viewDidLoad {
  [super viewDidLoad];
  self.fibrichecker = [FibriChecker new];
  [self addListeners];
  [_fibrichecker startMeasurement];
}

- (void)loadView {
    RNTFibriCheckView *customView = [[RNTFibriCheckView alloc] init];
    customView.delegate = self;
    self.view = customView;
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

  self.fibrichecker.onFingerRemoved = ^{
    RCTLogInfo(@"Finger Removed");
    dispatch_async(dispatch_get_main_queue(), ^{
        if(((RNTFibriCheckView*)weakSelf.view).onFingerRemoved != nil) ((RNTFibriCheckView*)weakSelf.view).onFingerRemoved(@{});
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
    NSDictionary *data = @{@"timeRemaining":[NSNumber numberWithInteger:seconds]};
    dispatch_async(dispatch_get_main_queue(), ^{
        if(((RNTFibriCheckView*)weakSelf.view).onTimeRemaining != nil) ((RNTFibriCheckView*)weakSelf.view).onTimeRemaining(data);
    });
  };
}

@end

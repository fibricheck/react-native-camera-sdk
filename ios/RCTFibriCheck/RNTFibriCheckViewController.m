#import "RNTFibriCheckViewController.h"
#import <React/RCTLog.h>
#import "RCTFibriCheckEventEmitter.h"
#import "FibriCheckerComponent.h"
#import "CameraSettings.h"

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

- (void)fibriCheckViewDidSetPulseDetectionExpiryTime {
    NSInteger pulseDetectionExpiryTime = ((RNTFibriCheckView*)self.view).pulseDetectionExpiryTime;
    _fibrichecker.pulseDetectionExpiryTime = pulseDetectionExpiryTime;
}

- (void)fibriCheckViewDidSetWaitForStartRecordingSignal {
    NSInteger waitForStartRecordingSignal = ((RNTFibriCheckView*)self.view).waitForStartRecordingSignal;
    _fibrichecker.waitForStartRecordingSignal = waitForStartRecordingSignal;
}

- (void)fibriCheckViewDidSetCameraSettings {
    NSDictionary* settings = ((RNTFibriCheckView*)self.view).cameraSettings;
    CameraSettingsInput* input = [[CameraSettingsInput alloc] initWithValues:
                                  CameraModeLocked manualIso:0 manualExposureTime:0
                                whiteBalanceMode:WhiteBalanceModeAuto manualWhiteBalanceRgb: (RgbColor) { .r = 1.0, .g = 1.0, .b = 1.0 } manualWhiteBalanceKelvin:5000
                               focusMode:CameraModeAuto manualFocus:0.0
                                 hdrMode: HdrAuto
                             logExposure:NO logWhiteBalance:NO logFocus:NO logHdr:NO];

    
    
    if (settings == nil) {
       return;
   }

   if (settings[@"exposureMode"]) {
       CameraSettingMode exposureMode = [self toCameraSettingMode:settings[@"exposureMode"] defaultValue:CameraModeLocked];
       input.exposureMode = exposureMode;
   }

   if (settings[@"iso"]) {
       input.manualIso = [settings[@"iso"] unsignedIntegerValue];
   }

   if (settings[@"exposureTime"]) {
       input.manualExposureTime = [settings[@"exposureTime"] unsignedIntegerValue];
   }

   if (settings[@"logExposure"]) {
       input.logExposure = [settings[@"logExposure"] boolValue];
   }

   if (settings[@"focusMode"]) {
       CameraSettingMode focusMode = [self toCameraSettingMode:settings[@"focusMode"] defaultValue:CameraModeAuto];
       input.focusMode = focusMode;
   }

   if (settings[@"focus"]) {
       input.manualFocus = [settings[@"focus"] doubleValue];
   }

   if (settings[@"logFocus"]) {
       input.logFocus = [settings[@"logFocus"] boolValue];
   }

   if (settings[@"whiteBalanceMode"]) {
       WhiteBalanceMode whiteBalanceMode = [self toWhiteBalanceMode:settings[@"whiteBalanceMode"] defaultValue:WhiteBalanceModeAuto];
       input.whiteBalanceMode = whiteBalanceMode;
   }

   if (settings[@"whiteBalanceRgb"]) {
       NSArray *rgb = settings[@"whiteBalanceRgb"];
       RgbColor rgbColor;
       rgbColor.r = [rgb[0] doubleValue];
       rgbColor.g = [rgb[1] doubleValue];
       rgbColor.b = [rgb[2] doubleValue];
       input.manualWhiteBalanceRgb = rgbColor;
   }

   if (settings[@"whiteBalanceKelvin"]) {
       input.manualWhiteBalanceKelvin = [settings[@"whiteBalanceKelvin"] unsignedIntegerValue];
   }

   if (settings[@"logWhiteBalance"]) {
       input.logWhiteBalance = [settings[@"logWhiteBalance"] boolValue];
   }
    
    if (settings[@"hdrMode"]) {
        HdrMode hdrMode = [self toHdrMode:settings[@"hdrMode"] defaultValue:HdrAuto];
        input.hdrMode = hdrMode;
    }
    
    if (settings[@"logHdr"]) {
        input.logHdr = [settings[@"logHdr"] boolValue];
    }

   [_fibrichecker setCameraSettings:input];
}

- (void)startMeasurement {
  NSLog(@"startMeasurement");
  [_fibrichecker startMeasurement];
}

- (void)startRecording {
  NSLog(@"startRecording");
  [_fibrichecker startRecording];
}

- (void)stopCamera {
  NSLog(@"stopCamera");
  [_fibrichecker stop];
}

// MARK: - UI
- (void)viewDidLoad {
  [super viewDidLoad];
  self.fibrichecker = [FibriChecker new];
  [self addListeners];
}

- (void)viewDidDisappear:(BOOL)animated {
    [super viewDidDisappear:animated];
    // Clean up resources, remove observers, stop timers, etc.
    [self.fibrichecker stop];
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


// MARK: - Helper Methods
- (CameraSettingMode)toCameraSettingMode:(NSString *)mode defaultValue:(CameraSettingMode)defaultValue {
    if (mode == nil) {
        return defaultValue;
    }

    if ([mode isEqualToString:@"auto"]) {
        return CameraModeAuto;
    } else if ([mode isEqualToString:@"locked"]) {
        return CameraModeLocked;
    } else if ([mode isEqualToString:@"manual"]) {
        return CameraModeManual;
    }

    NSLog(@"Invalid camera setting mode %@", mode);
    return defaultValue;
}

- (WhiteBalanceMode)toWhiteBalanceMode:(NSString *)mode defaultValue:(WhiteBalanceMode)defaultValue {
    if (mode == nil) {
        return defaultValue;
    }

    if ([mode isEqualToString:@"auto"]) {
        return WhiteBalanceModeAuto;
    } else if ([mode isEqualToString:@"locked"]) {
        return WhiteBalanceModeLocked;
    } else if ([mode isEqualToString:@"manual-rgb"]) {
        return WhiteBalanceModeManualRgb;
    } else if ([mode isEqualToString:@"manual-kelvin"]) {
        return WhiteBalanceModeManualKelvin;
    }

    NSLog(@"Invalid white balance mode %@", mode);
    return defaultValue;
}

- (HdrMode)toHdrMode:(NSString *)mode defaultValue:(HdrMode)defaultValue {
    if (mode == nil) {
        return defaultValue;
    }

    if ([mode isEqualToString:@"auto"]) {
        return HdrAuto;
    } else if ([mode isEqualToString:@"on"]) {
        return HdrOn;
    } else if ([mode isEqualToString:@"off"]) {
        return HdrOff;
    }

    NSLog(@"Invalid white balance mode %@", mode);
    return defaultValue;
}

@end

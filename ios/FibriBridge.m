//
//  FibriBridge.m
//  FibriCheck
//
//  Created by Qompium on 01/02/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import "FibriBridge.h"
#import "React/RCTLog.h"
#import "React/RCTBridge.h"
#import "FibriEventEmitter.h"
#import "SimpleChart.h"
#import "FibriCheckerComponent.h"

@interface FibriBridge ()
@property (nonatomic, strong) SimpleChart *simpleChart;
@property (nonatomic, strong) FibriChecker *fibrichecker;
@end

@implementation FibriBridge

//@synthesize bridge = _bridge;

// This RCT (React) "macro" exposes the current module to JavaScript
RCT_EXPORT_MODULE();

//RCT_EXPORT_VIEW_PROPERTY(sampleTime, NSInteger)
RCT_CUSTOM_VIEW_PROPERTY(sampleTime, NSInteger, SimpleChart) {
  _fibrichecker.sampleTime = [json integerValue];
}
RCT_CUSTOM_VIEW_PROPERTY(accEnabled, BOOL, SimpleChart) {
  _fibrichecker.accEnabled = [json boolValue];
}
RCT_CUSTOM_VIEW_PROPERTY(fingerDetectionExpiryTime, NSInteger, SimpleChart) {
  _fibrichecker.fingerDetectionExpiryTime = [json integerValue];
}
RCT_CUSTOM_VIEW_PROPERTY(flashEnabled, BOOL, SimpleChart) {
  _fibrichecker.flashEnabled = [json boolValue];
}
RCT_CUSTOM_VIEW_PROPERTY(gravEnabled, BOOL, SimpleChart) {
  _fibrichecker.gravEnabled = [json boolValue];
}
RCT_CUSTOM_VIEW_PROPERTY(gyroEnabled, BOOL, SimpleChart) {
  _fibrichecker.gyroEnabled = [json boolValue];
}
RCT_CUSTOM_VIEW_PROPERTY(lowerMovementLimit, NSInteger, SimpleChart) {
  _fibrichecker.lowerMovementLimit = [json integerValue];
}
RCT_CUSTOM_VIEW_PROPERTY(upperMovementLimit, NSInteger, SimpleChart) {
  _fibrichecker.upperMovementLimit = [json integerValue];
  [_fibrichecker updateConfiguration];
}
RCT_CUSTOM_VIEW_PROPERTY(maxStdDevYValue, NSInteger, SimpleChart) {
  _fibrichecker.maxStdDevYValue = [json integerValue];
}
RCT_CUSTOM_VIEW_PROPERTY(maxYValue, NSInteger, SimpleChart) {
  _fibrichecker.maxYValue = [json integerValue];
}
RCT_CUSTOM_VIEW_PROPERTY(minVValue, NSInteger, SimpleChart) {
  _fibrichecker.minVValue = [json integerValue];
}
RCT_CUSTOM_VIEW_PROPERTY(movementDetectionEnabled, BOOL, SimpleChart) {
  _fibrichecker.movementDetectionEnabled = [json boolValue];
}
RCT_CUSTOM_VIEW_PROPERTY(rotationEnabled, BOOL, SimpleChart) {
  _fibrichecker.rotationEnabled = [json boolValue];
}
RCT_CUSTOM_VIEW_PROPERTY(quadrantCols, NSInteger, SimpleChart) {
  _fibrichecker.quadrantCols = [json integerValue];
}
RCT_CUSTOM_VIEW_PROPERTY(quadrantRows, NSInteger, SimpleChart) {
  _fibrichecker.quadrantRows = [json integerValue];
}
RCT_CUSTOM_VIEW_PROPERTY(waitForStartRecordingSignal, NSInteger, SimpleChart) {
  _fibrichecker.waitForStartRecordingSignal = [json integerValue];
}

- (UIView *)view {
  self.fibrichecker = [FibriChecker new];
  [self addListeners];

  _simpleChart = [[SimpleChart alloc] init];
  [_simpleChart setBackgroundColor:[UIColor clearColor]];
  [_fibrichecker startMeasurement];
  return _simpleChart;
}
// We must explicitly expose methods otherwise JavaScript can't access anything
RCT_EXPORT_METHOD(startMeasurement) {
  RCTLogInfo(@"Received start Measurement Command");
  //NSLog(@"Received start Measurement Command");
  [self.fibrichecker startMeasurement];
}

RCT_EXPORT_METHOD(startRecording) {
  RCTLogInfo(@"Received start Recording Command");
  //NSLog(@"Received Start Recording Command");
  [self.fibrichecker startRecording];
}

- (void)addListeners {
  RCTLogInfo(@"addListeners");
  __unsafe_unretained typeof(self) weakSelf = self;

  self.fibrichecker.onMeasurementStart = ^{
    //NSLog(@"onMeasurementStart");
    RCTLogInfo(@"Measurement start");
    [FibriEventEmitter emitEventWithName:@"measurementStart" andPayload:nil];
  };

  self.fibrichecker.onMeasurementFinished = ^{
    //NSLog(@"onMeasurementFinished");
    RCTLogInfo(@"Measurement Finished");
    [FibriEventEmitter emitEventWithName:@"measurementFinished" andPayload:nil];
  };

  self.fibrichecker.onMeasurementProcessed = ^(Measurement* measurement){
    //NSLog(@"onMeasurementProcessed:");
    RCTLogInfo(@"Measurement processed");
    [FibriEventEmitter emitEventWithName:@"measurementProcessed" andPayload:@{ @"measurement": [measurement mapToJson] }];
  };

  self.fibrichecker.onSampleReady = ^(double ppg, double raw) {
    [FibriEventEmitter emitEventWithName:@"sampleReady" andPayload:@{ @"ppg": @(ppg) }];
    // [weakSelf drawGraphPoint:ppg];
  };

  self.fibrichecker.onCalibrationReady = ^{
    //NSLog(@"onCalibrationReady");
    RCTLogInfo(@"Calibration Ready");
    [FibriEventEmitter emitEventWithName:@"calibrationReady" andPayload:nil];
  };

  self.fibrichecker.onFingerRemoved = ^{
    //NSLog(@"onFingerRemoved");
    RCTLogInfo(@"Finger Removed");
    [FibriEventEmitter emitEventWithName:@"fingerRemoved" andPayload:nil];
  };

  self.fibrichecker.onFingerDetected = ^{
    //NSLog(@"onFingerDetected");
    RCTLogInfo(@"Finger Detected");
    [FibriEventEmitter emitEventWithName:@"fingerDetected" andPayload:nil];
  };

  self.fibrichecker.onMovementDetected = ^{
    //NSLog(@"onMovement");
    RCTLogInfo(@"Movement Detected");
    [FibriEventEmitter emitEventWithName:@"movementDetected" andPayload:nil];
  };

  self.fibrichecker.onPulseDetected = ^{
    //NSLog(@"onPulseDetected");
    RCTLogInfo(@"Pulse Detected");
    [FibriEventEmitter emitEventWithName:@"pulseDetected" andPayload:nil];
  };

  self.fibrichecker.onPulseDetectionTimeExpired = ^{
    //NSLog(@"onPulseDetectionTimeExpired");
    RCTLogInfo(@"Pulse Detection Time Expired");
    [FibriEventEmitter emitEventWithName:@"pulseDetectionTimeExpired" andPayload:nil];
  };

  self.fibrichecker.onFingerDetectionTimeExpired = ^{
    //NSLog(@"onFingerDetectionTimeExpired");
    RCTLogInfo(@"Finger Detection Time Expired");
    [FibriEventEmitter emitEventWithName:@"fingerDetectionTimeExpired" andPayload:nil];
  };

  self.fibrichecker.onHeartBeat = ^(NSUInteger value) {
    //NSLog(@"onHeartBeart: %lu", value);
    RCTLogInfo(@"Heart Beat Detected: %lu", value);
    [FibriEventEmitter emitEventWithName:@"heartBeat" andPayload:@{ @"heartRate": @(value) }];
  };

  self.fibrichecker.onTimeRemaining = ^(NSUInteger seconds) {
    //NSLog(@"onTimeRemaining: %lu", seconds);
    RCTLogInfo(@"Time Remaining: %lu", seconds);
    [FibriEventEmitter emitEventWithName:@"timeRemaining" andPayload:@{ @"seconds": @(seconds) }];
  };
}

- (void)drawGraphPoint:(double)value {
  [_simpleChart addPoint:[NSNumber numberWithDouble:value]];
  dispatch_async(dispatch_get_main_queue(), ^{
    [_simpleChart setNeedsDisplay];
  });
}

@end

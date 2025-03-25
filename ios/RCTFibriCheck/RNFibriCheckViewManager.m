#import "RNFibriCheckViewManager.h"
#import "RNTFibriCheckView.h"
#import <React/RCTLog.h>

@implementation RNFibriCheckViewManager

RCT_EXPORT_VIEW_PROPERTY(onFingerDetected, RCTBubblingEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onFingerRemoved, RCTBubblingEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onSampleReady, RCTBubblingEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onMeasurementStart, RCTBubblingEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onMeasurementFinished, RCTBubblingEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onMeasurementProcessed, RCTBubblingEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onMeasurementError, RCTBubblingEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onCalibrationReady, RCTBubblingEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onMovementDetected, RCTBubblingEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onPulseDetected, RCTBubblingEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onPulseDetectionTimeExpired, RCTBubblingEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onFingerDetectionTimeExpired, RCTBubblingEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onHeartBeat, RCTBubblingEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onTimeRemaining, RCTBubblingEventBlock);

RCT_EXPORT_VIEW_PROPERTY(sampleTime, NSInteger);
RCT_EXPORT_VIEW_PROPERTY(flashEnabled, BOOL);
RCT_EXPORT_VIEW_PROPERTY(gravEnabled, BOOL);
RCT_EXPORT_VIEW_PROPERTY(gyroEnabled, BOOL);
RCT_EXPORT_VIEW_PROPERTY(accEnabled, BOOL);
RCT_EXPORT_VIEW_PROPERTY(rotationEnabled, BOOL);
RCT_EXPORT_VIEW_PROPERTY(movementDetectionEnabled, BOOL);
RCT_EXPORT_VIEW_PROPERTY(fingerDetectionExpiryTime, NSInteger);
RCT_EXPORT_VIEW_PROPERTY(pulseDetectionExpiryTime, NSInteger);

RCT_EXPORT_VIEW_PROPERTY(waitForStartRecordingSignal, NSInteger);

RCT_EXPORT_VIEW_PROPERTY(drawGraph, BOOL);
RCT_EXPORT_VIEW_PROPERTY(lineColor, NSString);
RCT_EXPORT_VIEW_PROPERTY(lineThickness, NSInteger);
RCT_EXPORT_VIEW_PROPERTY(graphBackgroundColor, NSString);

RCT_EXPORT_MODULE(FibriCheck)
- (UIView *)view {
    self.fibriCheckViewController = [[RNTFibriCheckViewController alloc] init];
    return self.fibriCheckViewController.view;
}

RCT_EXPORT_METHOD(startMeasurement:(nonnull NSNumber*) reactTag)
{
    self.fibriCheckViewController.startMeasurement;
}

RCT_EXPORT_METHOD(startRecording:(nonnull NSNumber*) reactTag)
{
    self.fibriCheckViewController.startRecording;
}

RCT_EXPORT_METHOD(resetModule:(nonnull NSNumber*) reactTag)
{
    self.fibriCheckViewController.stopCamera;
}

RCT_EXPORT_METHOD(startRecording:(nonnull NSNumber*) reactTag)
{
 self.fibriCheckViewController.startRecording;
}

@end

#import "RNFibriCheckViewManager.h"
#import "RNTFibriCheckView.h"
#import <React/RCTLog.h>
#import <React/RCTUIManager.h>
#import <objc/runtime.h>

static const void *RNTFibriCheckControllerKey = &RNTFibriCheckControllerKey;

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

RCT_EXPORT_VIEW_PROPERTY(waitForStartRecordingSignal, BOOL);

RCT_EXPORT_VIEW_PROPERTY(drawGraph, BOOL);
RCT_EXPORT_VIEW_PROPERTY(drawBackground, BOOL);
RCT_EXPORT_VIEW_PROPERTY(lineColor, NSString);
RCT_EXPORT_VIEW_PROPERTY(lineThickness, NSInteger);
RCT_EXPORT_VIEW_PROPERTY(graphBackgroundColor, NSString);

#ifndef RCT_NEW_ARCH_ENABLED
RCT_EXPORT_MODULE(FibriCheck)
#endif
- (UIView *)view {
    RNTFibriCheckViewController *controller = [[RNTFibriCheckViewController alloc] init];
    controller.legacyManaged = YES;
    controller.eventDelegate = self;
    RNTFibriCheckView *view = (RNTFibriCheckView *)controller.view;
    objc_setAssociatedObject(view, RNTFibriCheckControllerKey, controller, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    [controller activate];
    return view;
}

- (RNTFibriCheckViewController *)controllerForReactTag:(NSNumber *)reactTag
{
    UIView *view = [self.bridge.uiManager viewForReactTag:reactTag];
    return objc_getAssociatedObject(view, RNTFibriCheckControllerKey);
}

RCT_EXPORT_METHOD(startMeasurement:(nonnull NSNumber*) reactTag)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        [[self controllerForReactTag:reactTag] startMeasurement];
    });
}

RCT_EXPORT_METHOD(startRecording:(nonnull NSNumber*) reactTag)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        [[self controllerForReactTag:reactTag] startRecording];
    });
}

RCT_EXPORT_METHOD(resetModule:(nonnull NSNumber*) reactTag)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        [[self controllerForReactTag:reactTag] stopCamera];
    });
}

- (void)fibriCheckViewController:(RNTFibriCheckViewController *)controller
                       emitEvent:(RNTFibriCheckEvent)event
                            body:(NSDictionary *)body
{
    RNTFibriCheckView *view = (RNTFibriCheckView *)controller.view;
    RCTBubblingEventBlock block = nil;
    switch (event) {
      case RNTFibriCheckEventFingerDetected: block = view.onFingerDetected; break;
      case RNTFibriCheckEventFingerRemoved: block = view.onFingerRemoved; break;
      case RNTFibriCheckEventSampleReady: block = view.onSampleReady; break;
      case RNTFibriCheckEventMeasurementStart: block = view.onMeasurementStart; break;
      case RNTFibriCheckEventMeasurementFinished: block = view.onMeasurementFinished; break;
      case RNTFibriCheckEventMeasurementProcessed: block = view.onMeasurementProcessed; break;
      case RNTFibriCheckEventMeasurementError: block = view.onMeasurementError; break;
      case RNTFibriCheckEventCalibrationReady: block = view.onCalibrationReady; break;
      case RNTFibriCheckEventMovementDetected: block = view.onMovementDetected; break;
      case RNTFibriCheckEventPulseDetected: block = view.onPulseDetected; break;
      case RNTFibriCheckEventPulseDetectionTimeExpired: block = view.onPulseDetectionTimeExpired; break;
      case RNTFibriCheckEventFingerDetectionTimeExpired: block = view.onFingerDetectionTimeExpired; break;
      case RNTFibriCheckEventHeartBeat: block = view.onHeartBeat; break;
      case RNTFibriCheckEventTimeRemaining: block = view.onTimeRemaining; break;
    }
    if (block) block(body);
}

@end

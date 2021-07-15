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
RCT_EXPORT_VIEW_PROPERTY(onCalibrationReady, RCTBubblingEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onMovementDetected, RCTBubblingEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onPulseDetected, RCTBubblingEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onPulseDetectionTimeExpired, RCTBubblingEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onFingerDetectionTimeExpired, RCTBubblingEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onHeartBeat, RCTBubblingEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onTimeRemaining, RCTBubblingEventBlock);

RCT_EXPORT_MODULE(FibriCheck)
- (UIView *)view {
    self.fibriCheckViewController = [[RNTFibriCheckViewController alloc] init];
    return self.fibriCheckViewController.view;
}

@end

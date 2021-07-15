#import <UIKit/UIKit.h>
#import <React/RCTComponent.h>

@protocol FibriCheckViewDelegate <NSObject>

@end

@interface RNTFibriCheckView : UIView

@property (nonatomic, weak) id<FibriCheckViewDelegate> delegate;

@property (nonatomic, copy) RCTBubblingEventBlock onFingerDetected;
@property (nonatomic, copy) RCTBubblingEventBlock onFingerRemoved;
@property (nonatomic, copy) RCTBubblingEventBlock onSampleReady;
@property (nonatomic, copy) RCTBubblingEventBlock onMeasurementStart;
@property (nonatomic, copy) RCTBubblingEventBlock onMeasurementFinished;
@property (nonatomic, copy) RCTBubblingEventBlock onMeasurementProcessed;
@property (nonatomic, copy) RCTBubblingEventBlock onCalibrationReady;
@property (nonatomic, copy) RCTBubblingEventBlock onMovementDetected;
@property (nonatomic, copy) RCTBubblingEventBlock onPulseDetected;
@property (nonatomic, copy) RCTBubblingEventBlock onPulseDetectionTimeExpired;
@property (nonatomic, copy) RCTBubblingEventBlock onFingerDetectionTimeExpired;
@property (nonatomic, copy) RCTBubblingEventBlock onHeartBeat;
@property (nonatomic, copy) RCTBubblingEventBlock onTimeRemaining;

@end

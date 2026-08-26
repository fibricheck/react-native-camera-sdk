#import <UIKit/UIKit.h>
#import "RNTFibriCheckView.h"

@class FibriChecker;
@class RNTFibriCheckViewController;

NS_ASSUME_NONNULL_BEGIN

typedef NS_ENUM(NSInteger, RNTFibriCheckEvent) {
  RNTFibriCheckEventFingerDetected,
  RNTFibriCheckEventFingerRemoved,
  RNTFibriCheckEventSampleReady,
  RNTFibriCheckEventMeasurementStart,
  RNTFibriCheckEventMeasurementFinished,
  RNTFibriCheckEventMeasurementProcessed,
  RNTFibriCheckEventMeasurementError,
  RNTFibriCheckEventCalibrationReady,
  RNTFibriCheckEventMovementDetected,
  RNTFibriCheckEventPulseDetected,
  RNTFibriCheckEventPulseDetectionTimeExpired,
  RNTFibriCheckEventFingerDetectionTimeExpired,
  RNTFibriCheckEventHeartBeat,
  RNTFibriCheckEventTimeRemaining,
};

@protocol RNTFibriCheckEventDelegate <NSObject>
- (void)fibriCheckViewController:(RNTFibriCheckViewController *)controller
                        emitEvent:(RNTFibriCheckEvent)event
                             body:(NSDictionary *)body;
@end

@interface RNTFibriCheckViewController : UIViewController <FibriCheckViewDelegate>

@property (nonatomic, weak, nullable) id<RNTFibriCheckEventDelegate> eventDelegate;
@property (nonatomic) BOOL legacyManaged;

+ (nullable FibriChecker *)sharedFibriChecker;
- (void)activate;
- (void)invalidate;
- (void)startMeasurement;
- (void)startRecording;
- (void)stopCamera;

@end

NS_ASSUME_NONNULL_END

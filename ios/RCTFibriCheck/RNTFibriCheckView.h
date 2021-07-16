#import <UIKit/UIKit.h>
#import <React/RCTComponent.h>

@protocol FibriCheckViewDelegate <NSObject>
- (void) fibriCheckViewDidSetSampleTime;
- (void) fibriCheckViewDidSetGrav;
- (void) fibriCheckViewDidSetFlash;
- (void) fibriCheckViewDidSetGyro;
- (void) fibriCheckViewDidSetAcc;
- (void) fibriCheckViewDidSetRotation;
- (void) fibriCheckViewDidSetMovementDetection;
- (void) fibriCheckViewDidSetFingerDetectionExpiryTime;
- (void) fibriCheckViewDidSetWaitForStartRecordingSignal;
@end

@interface RNTFibriCheckView : UIView

@property (nonatomic, weak) id<FibriCheckViewDelegate> delegate;

@property (nonatomic) NSInteger *sampleTime;
@property (nonatomic) BOOL flashEnabled;
@property (nonatomic) BOOL gravEnabled;
@property (nonatomic) BOOL gyroEnabled;
@property (nonatomic) BOOL accEnabled;
@property (nonatomic) BOOL rotationEnabled;
@property (nonatomic) BOOL movementDetectionEnabled;
@property (nonatomic) NSInteger *fingerDetectionExpiryTime;
@property (nonatomic) NSInteger *waitForStartRecordingSignal;

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

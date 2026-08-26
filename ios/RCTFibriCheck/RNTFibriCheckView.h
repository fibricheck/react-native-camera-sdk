#import <UIKit/UIKit.h>
#import <React/RCTComponent.h>

NS_ASSUME_NONNULL_BEGIN

@class RNTFibriCheckView;

@protocol FibriCheckViewDelegate <NSObject>
- (void) fibriCheckViewDidSetSampleTime:(NSInteger)value;
- (void) fibriCheckViewDidSetGrav:(BOOL)value;
- (void) fibriCheckViewDidSetFlash:(BOOL)value;
- (void) fibriCheckViewDidSetGyro:(BOOL)value;
- (void) fibriCheckViewDidSetAcc:(BOOL)value;
- (void) fibriCheckViewDidSetRotation:(BOOL)value;
- (void) fibriCheckViewDidSetMovementDetection:(BOOL)value;
- (void) fibriCheckViewDidSetFingerDetectionExpiryTime:(NSInteger)value;
- (void) fibriCheckViewDidSetPulseDetectionExpiryTime:(NSInteger)value;

- (void) fibriCheckViewDidSetWaitForStartRecordingSignal:(BOOL)value;
- (void) startMeasurement;
- (void) startRecording;
- (void) stopCamera;
- (void) fibriCheckView:(RNTFibriCheckView *)view didMoveToWindow:(nullable UIWindow *)window;
@end

@interface RNTFibriCheckView : UIView {
  float min;
  float max;
  float delta;
  int index;
}

@property (nonatomic, weak) id<FibriCheckViewDelegate> delegate;

@property (nonatomic) NSInteger sampleTime;
@property (nonatomic) BOOL flashEnabled;
@property (nonatomic) BOOL gravEnabled;
@property (nonatomic) BOOL gyroEnabled;
@property (nonatomic) BOOL accEnabled;
@property (nonatomic) BOOL rotationEnabled;
@property (nonatomic) BOOL movementDetectionEnabled;
@property (nonatomic) NSInteger fingerDetectionExpiryTime;
@property (nonatomic) NSInteger pulseDetectionExpiryTime;
@property (nonatomic) BOOL waitForStartRecordingSignal;
@property (nonatomic) BOOL drawGraph;
@property (nonatomic) BOOL drawBackground;

@property (nonatomic) NSInteger stepIncrement;
@property (nonatomic) NSInteger verticalOffset;
// Despite the ObjC type, these always hold hex color strings (e.g. "#63b3a6"),
// never UIColor instances - see -drawGraphArea/-drawGraphLine, which parse
// them with NSScanner. Typed as NSString* to match actual usage.
@property (nonatomic, copy, nullable) NSString *lineColor;
@property (nonatomic, copy, nullable) NSString *graphBackgroundColor;
@property (nonatomic) NSInteger lineThickness;

@property (nonatomic, copy, nullable) RCTBubblingEventBlock onFingerDetected;
@property (nonatomic, copy, nullable) RCTBubblingEventBlock onFingerRemoved;
@property (nonatomic, copy, nullable) RCTBubblingEventBlock onSampleReady;
@property (nonatomic, copy, nullable) RCTBubblingEventBlock onMeasurementStart;
@property (nonatomic, copy, nullable) RCTBubblingEventBlock onMeasurementFinished;
@property (nonatomic, copy, nullable) RCTBubblingEventBlock onMeasurementProcessed;
@property (nonatomic, copy, nullable) RCTBubblingEventBlock onMeasurementError;
@property (nonatomic, copy, nullable) RCTBubblingEventBlock onCalibrationReady;
@property (nonatomic, copy, nullable) RCTBubblingEventBlock onMovementDetected;
@property (nonatomic, copy, nullable) RCTBubblingEventBlock onPulseDetected;
@property (nonatomic, copy, nullable) RCTBubblingEventBlock onPulseDetectionTimeExpired;
@property (nonatomic, copy, nullable) RCTBubblingEventBlock onFingerDetectionTimeExpired;
@property (nonatomic, copy, nullable) RCTBubblingEventBlock onHeartBeat;
@property (nonatomic, copy, nullable) RCTBubblingEventBlock onTimeRemaining;

/*!
 *  Contains all the points currently displayed on the chart
 */
@property (nonatomic, retain, nullable) NSMutableArray *points;

-(void) addPoint:(NSNumber *) newPoint;
-(void) resetGraph;

@end

NS_ASSUME_NONNULL_END

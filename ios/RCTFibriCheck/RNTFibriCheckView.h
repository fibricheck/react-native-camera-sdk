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
- (void) fibriCheckViewDidSetPulseDetectionExpiryTime;

- (void) fibriCheckViewDidSetWaitForStartRecordingSignal;
- (void) drawGraphPoint;
- (void) addPoint;

- (void) startMeasurement;
- (void) startRecording;
- (void) stopCamera;
@end

@interface RNTFibriCheckView : UIView {
  float min;
  float max;
  float delta;
  int index;
}

@property (nonatomic, weak) id<FibriCheckViewDelegate> delegate;

@property (nonatomic) NSInteger *sampleTime;
@property (nonatomic) BOOL flashEnabled;
@property (nonatomic) BOOL gravEnabled;
@property (nonatomic) BOOL gyroEnabled;
@property (nonatomic) BOOL accEnabled;
@property (nonatomic) BOOL rotationEnabled;
@property (nonatomic) BOOL movementDetectionEnabled;
@property (nonatomic) NSInteger *fingerDetectionExpiryTime;
@property (nonatomic) NSInteger *pulseDetectionExpiryTime;
@property (nonatomic) NSInteger *waitForStartRecordingSignal;
@property (nonatomic) BOOL drawGraph;

@property (nonatomic) NSInteger stepIncrement;
@property (nonatomic) NSInteger verticalOffset;
@property (weak, nonatomic) UIColor *lineColor;
@property (weak, nonatomic) UIColor *graphBackgroundColor;
@property (nonatomic) NSInteger lineThickness;

@property (nonatomic, copy) RCTBubblingEventBlock onFingerDetected;
@property (nonatomic, copy) RCTBubblingEventBlock onFingerRemoved;
@property (nonatomic, copy) RCTBubblingEventBlock onSampleReady;
@property (nonatomic, copy) RCTBubblingEventBlock onMeasurementStart;
@property (nonatomic, copy) RCTBubblingEventBlock onMeasurementFinished;
@property (nonatomic, copy) RCTBubblingEventBlock onMeasurementProcessed;
@property (nonatomic, copy) RCTBubblingEventBlock onMeasurementError;
@property (nonatomic, copy) RCTBubblingEventBlock onCalibrationReady;
@property (nonatomic, copy) RCTBubblingEventBlock onMovementDetected;
@property (nonatomic, copy) RCTBubblingEventBlock onPulseDetected;
@property (nonatomic, copy) RCTBubblingEventBlock onPulseDetectionTimeExpired;
@property (nonatomic, copy) RCTBubblingEventBlock onFingerDetectionTimeExpired;
@property (nonatomic, copy) RCTBubblingEventBlock onHeartBeat;
@property (nonatomic, copy) RCTBubblingEventBlock onTimeRemaining;

/*!
 *  Contains all the points currently displayed on the chart
 */
@property (nonatomic, retain) NSMutableArray *points;

-(void) addPoint:(NSNumber *) newPoint;

@end

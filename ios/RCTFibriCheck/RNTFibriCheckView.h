#import <React/RCTComponent.h>
#import <UIKit/UIKit.h>

@protocol FibriCheckViewDelegate <NSObject>
- (void)fibriCheckViewDidSetSampleTime;
- (void)fibriCheckViewDidSetGrav;
- (void)fibriCheckViewDidSetFlash;
- (void)fibriCheckViewDidSetGyro;
- (void)fibriCheckViewDidSetAcc;
- (void)fibriCheckViewDidSetRotation;
- (void)fibriCheckViewDidSetMovementDetection;
- (void)fibriCheckViewDidSetFingerDetectionExpiryTime;
- (void)fibriCheckViewDidSetPulseDetectionExpiryTime;

- (void)fibriCheckViewDidSetWaitForStartRecordingSignal;
- (void)drawGraphPoint;
- (void)addPoint;

- (void)startMeasurement;
- (void)startRecording;
- (void)stopCamera;

- (void)startRawData;
- (void)stopRawData;

- (void)getCameraInfo;

@end

@interface RNTFibriCheckView : UIView {
  float min;
  float max;
  float delta;
  int index;
}

@property(nonatomic, weak) id<FibriCheckViewDelegate> delegate;

@property(nonatomic) NSInteger *sampleTime;
@property(nonatomic) BOOL flashEnabled;
@property(nonatomic) BOOL gravEnabled;
@property(nonatomic) BOOL gyroEnabled;
@property(nonatomic) BOOL accEnabled;
@property(nonatomic) BOOL rotationEnabled;
@property(nonatomic) BOOL movementDetectionEnabled;
@property(nonatomic) NSInteger *fingerDetectionExpiryTime;
@property(nonatomic) NSInteger *pulseDetectionExpiryTime;
@property(nonatomic) NSInteger *waitForStartRecordingSignal;
@property(nonatomic) BOOL drawGraph;

// Stubs
@property(nonatomic) BOOL manualExposureEnabled;
@property(nonatomic) NSInteger *manualIso;
@property(nonatomic) NSInteger *manualExposureTime;

@property(nonatomic) BOOL manualFocusEnabled;
@property(nonatomic) NSNumber *manualFocus;

@property(nonatomic) NSString *whiteBalanceMode;
@property(nonatomic) NSInteger *manualWhiteBalance;
@property(nonatomic) NSArray<NSNumber*> *manualGains;
// Stubs end

@property(nonatomic) NSInteger stepIncrement;
@property(nonatomic) NSInteger verticalOffset;
@property(weak, nonatomic) UIColor *lineColor;
@property(weak, nonatomic) UIColor *graphBackgroundColor;
@property(nonatomic) NSInteger lineThickness;

@property(nonatomic, copy) RCTBubblingEventBlock onFingerDetected;
@property(nonatomic, copy) RCTBubblingEventBlock onFingerRemoved;
@property(nonatomic, copy) RCTBubblingEventBlock onSampleReady;
@property(nonatomic, copy) RCTBubblingEventBlock onMeasurementStart;
@property(nonatomic, copy) RCTBubblingEventBlock onMeasurementFinished;
@property(nonatomic, copy) RCTBubblingEventBlock onMeasurementProcessed;
@property(nonatomic, copy) RCTBubblingEventBlock onMeasurementError;
@property(nonatomic, copy) RCTBubblingEventBlock onCalibrationReady;
@property(nonatomic, copy) RCTBubblingEventBlock onMovementDetected;
@property(nonatomic, copy) RCTBubblingEventBlock onPulseDetected;
@property(nonatomic, copy) RCTBubblingEventBlock onPulseDetectionTimeExpired;
@property(nonatomic, copy) RCTBubblingEventBlock onFingerDetectionTimeExpired;
@property(nonatomic, copy) RCTBubblingEventBlock onHeartBeat;
@property(nonatomic, copy) RCTBubblingEventBlock onTimeRemaining;
@property(nonatomic, copy) RCTBubblingEventBlock onRawData;
@property(nonatomic, copy) RCTBubblingEventBlock onCameraInfo;


/*!
 *  Contains all the points currently displayed on the chart
 */
@property(nonatomic, retain) NSMutableArray *points;

- (void)addPoint:(NSNumber *)newPoint;

@end

#import "RCTFibriCheckEventEmitter.h"
#import "RCTFibriCheck.h"
#import "FibriCheckerComponent.h"

@interface RCTFibriCheckEventEmitter ()
@property (nonatomic, strong) FibriChecker *fibrichecker;
@end

@implementation RCTFibriCheckEventEmitter {
    BOOL _hasListeners;
}

static BOOL _didStartObserving = false;

+ (BOOL)hasSetBridge {
    return _didStartObserving;
}

+(BOOL)requiresMainQueueSetup {
    return YES;
}

RCT_EXPORT_MODULE(RCTFibriCheck)

#pragma mark RCTEventEmitter Subclass Methods

-(instancetype)init {
    if (self = [super init]) {
        NSLog(@"-------- Initialized RCTFibriCheckEventEmitter --------");
        self.fibrichecker = [FibriChecker new];
        for (NSString *eventName in [self supportedEvents])
            [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(emitEvent:) name:eventName object:nil];
    }

    return self;
}

-(void)startObserving {
    _hasListeners = true;
    NSLog(@"-------- RCTFibriCheckEventEmitter did start observing --------");
    [[NSNotificationCenter defaultCenter] postNotificationName:@"didSetBridge" object:nil];
    _didStartObserving = true;
}

-(void)stopObserving {
    _hasListeners = false;
    NSLog(@"-------- RCTFibriCheckEventEmitter did stop observing --------");
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

-(NSArray<NSString *> *)supportedEvents {
    NSMutableArray *events = [NSMutableArray new];

    for (int i = 0; i < FCNotificationEventTypesArray.count; i++)
        [events addObject:FCEventString(i)];

    return events;
}

#pragma mark Send Event Methods

- (void)emitEvent:(NSNotification *)notification {
    if (!_hasListeners) {
       NSLog(@"-------- Attempted to send an event (%@) when no listeners were set. --------");
        return;
    }

    [self sendEventWithName:notification.name body:notification.userInfo];
}

+ (void)sendEventWithName:(NSString *)name withBody:(NSDictionary *)body {
    [[NSNotificationCenter defaultCenter] postNotificationName:name object:nil userInfo:body];
}

#pragma mark Exported Methods

RCT_EXPORT_METHOD(startMeasurement) {
    RCTLogInfo(@"Received start Measuring Command");
    [_fibrichecker startMeasurement];
}

RCT_EXPORT_METHOD(startRecording) {
  RCTLogInfo(@"Received start Recording Command");
  [_fibrichecker startRecording];
}

RCT_EXPORT_METHOD(setSampleReceivedHandler) {
    _fibrichecker.onSampleReady = ^(double ppg, double raw) {
        NSDictionary *data = @{@"ppg":[NSNumber numberWithFloat:ppg], @"raw":[NSNumber numberWithFloat:raw]};
        [RCTFibriCheckEventEmitter sendEventWithName:@"sampleReady" withBody:data];
    };
}

RCT_EXPORT_METHOD(setHeartBeatReceivedHandler) {
    _fibrichecker.onHeartBeat = ^(NSUInteger value) {
        RCTLogInfo(@"Heart Beat Detected: %lu", value);
        NSDictionary *data = @{@"heartBeat":[NSNumber numberWithInteger:value]};
        [RCTFibriCheckEventEmitter sendEventWithName:@"heartBeat" withBody:data];
    };
}

RCT_EXPORT_METHOD(setMeasurementStartHandler) {
    _fibrichecker.onMeasurementStart = ^{
        RCTLogInfo(@"Measurement start");
        [RCTFibriCheckEventEmitter sendEventWithName:@"measurementStart" withBody:nil];
    };
}

RCT_EXPORT_METHOD(setFingerDetectedHandler) {
    _fibrichecker.onFingerDetected = ^{
        RCTLogInfo(@"Finger Detected");
        [RCTFibriCheckEventEmitter sendEventWithName:@"fingerDetected" withBody:nil];
    };
}

RCT_EXPORT_METHOD(setFingerRemovedHandler) {
    _fibrichecker.onFingerRemoved = ^{
        RCTLogInfo(@"Finger Removed");
        [RCTFibriCheckEventEmitter sendEventWithName:@"fingerRemoved" withBody:nil];
    };
}

RCT_EXPORT_METHOD(setPulseDetectedHandler) {
    _fibrichecker.onPulseDetected = ^{
        RCTLogInfo(@"Pulse Detected");
        [RCTFibriCheckEventEmitter sendEventWithName:@"pulseDetected" withBody:nil];
    };
}

RCT_EXPORT_METHOD(setMeasurementFinishedHandler) {
    _fibrichecker.onMeasurementFinished = ^{
        RCTLogInfo(@"Measurement Finished");
        [RCTFibriCheckEventEmitter sendEventWithName:@"measurementFinished" withBody:nil];
    };
}

RCT_EXPORT_METHOD(setMeasurementProcessedHandler) {
    _fibrichecker.onMeasurementProcessed = ^(Measurement* measurement){
        RCTLogInfo(@"Measurement processed");
        NSDictionary *data = @{@"measurement":[measurement mapToJson]};
        [RCTFibriCheckEventEmitter sendEventWithName:@"measurementProcessed" withBody:data];
    };
}

RCT_EXPORT_METHOD(setCalibrationReadyHandler) {
    _fibrichecker.onCalibrationReady = ^{
        RCTLogInfo(@"Calibration Ready");
        [RCTFibriCheckEventEmitter sendEventWithName:@"calibrationReady" withBody:nil];
    };
}

RCT_EXPORT_METHOD(setMovementDetectedHandler) {
    _fibrichecker.onMovementDetected = ^{
        RCTLogInfo(@"Movement Detected");
        [RCTFibriCheckEventEmitter sendEventWithName:@"movementDetected" withBody:nil];
    };
}

RCT_EXPORT_METHOD(setPulseDetectionTimeExpiredHandler) {
    _fibrichecker.onPulseDetectionTimeExpired = ^{
        RCTLogInfo(@"Pulse Detection Time Expired");
        [RCTFibriCheckEventEmitter sendEventWithName:@"pulseDetectionTimeExpired" withBody:nil];
    };
}

RCT_EXPORT_METHOD(setFingerDetectionTimeExpiredHandler) {
    _fibrichecker.onFingerDetectionTimeExpired = ^{
        RCTLogInfo(@"Finger Detection Time Expired");
        [RCTFibriCheckEventEmitter sendEventWithName:@"fingerDetectionTimeExpired" withBody:nil];
    };
}

RCT_EXPORT_METHOD(setTimeRemainingHandler) {
    _fibrichecker.onTimeRemaining = ^(NSUInteger seconds) {
        RCTLogInfo(@"Time Remaining: %lu", seconds);
        NSDictionary *data = @{@"timeRemaining":[NSNumber numberWithInteger:seconds]};
        [RCTFibriCheckEventEmitter sendEventWithName:@"timeRemaining" withBody:data];
    };
}
@end

#ifdef RCT_NEW_ARCH_ENABLED

#import "FibriCheckComponentView.h"

#import <react/renderer/components/RNFibriCheckSpecs/ComponentDescriptors.h>
#import <react/renderer/components/RNFibriCheckSpecs/EventEmitters.h>
#import <react/renderer/components/RNFibriCheckSpecs/Props.h>
#import <react/renderer/components/RNFibriCheckSpecs/RCTComponentViewHelpers.h>

#import <React/RCTConversions.h>
#import <React/RCTFabricComponentsPlugins.h>
#import <React/RCTLog.h>

#import "RNTFibriCheckView.h"
#import "RNTFibriCheckViewController.h"

using namespace facebook::react;

// The shared RNTFibriCheckView/RNTFibriCheckViewController implementation always works with hex
// color strings (see RNTFibriCheckView's -drawGraphArea/-drawGraphLine), not UIColor instances -
// this converts Codegen's SharedColor prop into that same representation.
static NSString *_Nullable RNTHexStringFromSharedColor(const SharedColor &sharedColor)
{
  UIColor *color = RCTUIColorFromSharedColor(sharedColor);
  if (!color) {
    return nil;
  }
  CGFloat red, green, blue, alpha;
  if (![color getRed:&red green:&green blue:&blue alpha:&alpha]) {
    CGFloat white;
    if (![color getWhite:&white alpha:&alpha]) {
      RCTLogWarn(@"[RNFibriCheckView] Unsupported color space for graph color");
      return nil;
    }
    red = green = blue = white;
  }
  return [NSString stringWithFormat:@"#%02lX%02lX%02lX",
                                     (long)(red * 255 + 0.5),
                                     (long)(green * 255 + 0.5),
                                     (long)(blue * 255 + 0.5)];
}

@interface FibriCheckComponentView () <RCTFibriCheckViewProtocol, RNTFibriCheckEventDelegate>
@end

@implementation FibriCheckComponentView {
  RNTFibriCheckViewController *_controller;
}

+ (void)load
{
  [super load];
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return facebook::react::concreteComponentDescriptorProvider<
      facebook::react::FibriCheckComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const FibriCheckProps>();
    _props = defaultProps;

    _controller = [[RNTFibriCheckViewController alloc] init];
    _controller.eventDelegate = self;
    self.contentView = _controller.view;
  }

  return self;
}

- (RNTFibriCheckView *)fibriCheckView
{
  return (RNTFibriCheckView *)_controller.view;
}

- (const FibriCheckEventEmitter &)eventEmitter
{
  return static_cast<const FibriCheckEventEmitter &>(*_eventEmitter);
}

- (void)fibriCheckViewController:(RNTFibriCheckViewController *)controller
                       emitEvent:(RNTFibriCheckEvent)event
                            body:(NSDictionary *)body
{
  if (!_eventEmitter) return;
  switch (event) {
    case RNTFibriCheckEventFingerDetected: self.eventEmitter.onFingerDetected({}); break;
    case RNTFibriCheckEventFingerRemoved: self.eventEmitter.onFingerRemoved({
      .y = [body[@"y"] doubleValue],
      .v = [body[@"v"] doubleValue],
      .stdDevY = [body[@"stdDevY"] doubleValue],
    }); break;
    case RNTFibriCheckEventSampleReady: self.eventEmitter.onSampleReady({
      .ppg = [body[@"ppg"] doubleValue],
      .raw = [body[@"raw"] doubleValue],
    }); break;
    case RNTFibriCheckEventMeasurementStart: self.eventEmitter.onMeasurementStart({}); break;
    case RNTFibriCheckEventMeasurementFinished: self.eventEmitter.onMeasurementFinished({}); break;
    case RNTFibriCheckEventMeasurementProcessed: {
      NSString *value = body[@"measurement"] ?: @"";
      self.eventEmitter.onMeasurementProcessed({.measurement = std::string(value.UTF8String)});
      break;
    }
    case RNTFibriCheckEventMeasurementError: {
      NSString *value = body[@"message"] ?: @"";
      self.eventEmitter.onMeasurementError({.message = std::string(value.UTF8String)});
      break;
    }
    case RNTFibriCheckEventCalibrationReady: self.eventEmitter.onCalibrationReady({}); break;
    case RNTFibriCheckEventMovementDetected: self.eventEmitter.onMovementDetected({}); break;
    case RNTFibriCheckEventPulseDetected: self.eventEmitter.onPulseDetected({}); break;
    case RNTFibriCheckEventPulseDetectionTimeExpired: self.eventEmitter.onPulseDetectionTimeExpired({}); break;
    case RNTFibriCheckEventFingerDetectionTimeExpired: self.eventEmitter.onFingerDetectionTimeExpired({}); break;
    case RNTFibriCheckEventHeartBeat:
      self.eventEmitter.onHeartBeat({.heartRate = (int)[body[@"heartRate"] integerValue]}); break;
    case RNTFibriCheckEventTimeRemaining:
      self.eventEmitter.onTimeRemaining({.seconds = (int)[body[@"seconds"] integerValue]}); break;
  }
}

- (void)didMoveToWindow
{
  [super didMoveToWindow];
  if (self.window) [_controller activate]; else [_controller invalidate];
}

#pragma mark - RCTComponentViewProtocol

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  const auto &oldViewProps = *std::static_pointer_cast<const FibriCheckProps>(_props);
  const auto &newViewProps = *std::static_pointer_cast<const FibriCheckProps>(props);
  RNTFibriCheckView *view = self.fibriCheckView;

  if (oldViewProps.drawGraph != newViewProps.drawGraph) {
    view.drawGraph = newViewProps.drawGraph;
  }
  if (oldViewProps.drawBackground != newViewProps.drawBackground) {
    view.drawBackground = newViewProps.drawBackground;
  }
  if (oldViewProps.accEnabled != newViewProps.accEnabled) {
    view.accEnabled = newViewProps.accEnabled;
  }
  if (oldViewProps.flashEnabled != newViewProps.flashEnabled) {
    view.flashEnabled = newViewProps.flashEnabled;
  }
  if (oldViewProps.gravEnabled != newViewProps.gravEnabled) {
    view.gravEnabled = newViewProps.gravEnabled;
  }
  if (oldViewProps.gyroEnabled != newViewProps.gyroEnabled) {
    view.gyroEnabled = newViewProps.gyroEnabled;
  }
  if (oldViewProps.movementDetectionEnabled != newViewProps.movementDetectionEnabled) {
    view.movementDetectionEnabled = newViewProps.movementDetectionEnabled;
  }
  if (oldViewProps.rotationEnabled != newViewProps.rotationEnabled) {
    view.rotationEnabled = newViewProps.rotationEnabled;
  }
  if (oldViewProps.waitForStartRecordingSignal != newViewProps.waitForStartRecordingSignal) {
    view.waitForStartRecordingSignal = newViewProps.waitForStartRecordingSignal;
  }
  if (oldViewProps.sampleTime != newViewProps.sampleTime) {
    view.sampleTime = newViewProps.sampleTime;
  }
  if (oldViewProps.fingerDetectionExpiryTime != newViewProps.fingerDetectionExpiryTime) {
    view.fingerDetectionExpiryTime = newViewProps.fingerDetectionExpiryTime;
  }
  if (oldViewProps.pulseDetectionExpiryTime != newViewProps.pulseDetectionExpiryTime) {
    view.pulseDetectionExpiryTime = newViewProps.pulseDetectionExpiryTime;
  }
  if (oldViewProps.lineThickness != newViewProps.lineThickness) {
    view.lineThickness = newViewProps.lineThickness;
  }
  // Cheap and side-effect-free (no custom setter), so just always apply rather than relying on
  // SharedColor's pointer-identity-based equality to decide whether it "changed".
  view.lineColor = RNTHexStringFromSharedColor(newViewProps.lineColor);
  view.graphBackgroundColor = RNTHexStringFromSharedColor(newViewProps.graphBackgroundColor);

  [super updateProps:props oldProps:oldProps];
}

- (void)handleCommand:(NSString const *)commandName args:(NSArray const *)args
{
  RCTFibriCheckHandleCommand(self, commandName, args);
}

- (void)startMeasurement
{
  [_controller startMeasurement];
}

- (void)startRecording
{
  [_controller startRecording];
}

- (void)resetModule
{
  [_controller stopCamera];
}

- (void)prepareForRecycle
{
  [super prepareForRecycle];
  [_controller invalidate];
}

@end

Class<RCTComponentViewProtocol> FibriCheckCls(void)
{
  return FibriCheckComponentView.class;
}

#endif

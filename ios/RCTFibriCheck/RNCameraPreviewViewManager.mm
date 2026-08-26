#import "RNCameraPreviewViewManager.h"
#import "RNTFibriCheckViewController.h"
#import "FibriCheckerComponent.h"
#import <AVFoundation/AVFoundation.h>
#import <React/RCTLog.h>

@class RNCameraPreviewUIView;
static __weak RNCameraPreviewUIView *_standalonePreviewOwner = nil;

@interface RNCameraPreviewUIView : UIView <RNCameraPreviewLifecycle>
@property (nonatomic, strong) AVCaptureVideoPreviewLayer *previewLayer;
@property (nonatomic, strong) FibriChecker *ownFibriChecker;
@property (nonatomic) BOOL fabricManaged;
@end

@implementation RNCameraPreviewUIView

- (instancetype)initWithFrame:(CGRect)frame {
  self = [super initWithFrame:frame];
  if (self) {
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(fibriCheckerReady:)
                                                 name:@"FibriCheckerReady"
                                               object:nil];
  }
  return self;
}

- (void)dealloc {
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)fibriCheckerReady:(NSNotification *)notification {
  dispatch_async(dispatch_get_main_queue(), ^{
    if (self.ownFibriChecker) {
      RCTLogError(@"[RNCameraPreviewView] RNFibriCheckView mounted while standalone preview is "
                  @"active — mount one or the other, not both simultaneously.");
      return;
    }
    [self activatePreview];
  });
}

- (void)didMoveToWindow {
  [super didMoveToWindow];
  if (self.fabricManaged) return;
  if (self.window) {
    [self activatePreview];
  } else {
    [self invalidatePreview];
  }
}

- (void)layoutSubviews {
  [super layoutSubviews];
  self.previewLayer.frame = self.bounds;
}

- (void)activatePreview {
  FibriChecker *sharedChecker = [RNTFibriCheckViewController sharedFibriChecker];
  if (sharedChecker) {
    // Shared mode: the session is already running — just attach a preview layer.
    // Do NOT call startPreview here: it would overwrite FibriChecker's internal state and
    // could disrupt a measurement that is in progress.
    AVCaptureSession *session = sharedChecker.captureSession;
    if (!session) {
      RCTLogWarn(@"[RNCameraPreviewView] captureSession unavailable on shared FibriChecker");
      return;
    }
    if (self.previewLayer.session == session) return;
    [self.previewLayer removeFromSuperlayer];
    self.previewLayer = nil;
    [self attachPreviewLayerToSession:session];
  } else {
    // Standalone mode: no RNFibriCheckView present — own the FibriChecker instance.
    if (_standalonePreviewOwner && _standalonePreviewOwner != self) {
      RCTLogError(@"[RNCameraPreviewView] Only one standalone camera preview is supported.");
      return;
    }
    if (self.ownFibriChecker && self.previewLayer) return;
    [self.previewLayer removeFromSuperlayer];
    self.previewLayer = nil;
    _standalonePreviewOwner = self;
    self.ownFibriChecker = [FibriChecker new];
    [self.ownFibriChecker startPreview];
    AVCaptureSession *session = self.ownFibriChecker.captureSession;
    if (!session) {
      RCTLogError(@"[RNCameraPreviewView] captureSession unavailable in standalone mode");
      self.ownFibriChecker = nil;
      if (_standalonePreviewOwner == self) _standalonePreviewOwner = nil;
      return;
    }
    [self attachPreviewLayerToSession:session];
  }
}

- (void)attachPreviewLayerToSession:(AVCaptureSession *)session {
  self.previewLayer = [AVCaptureVideoPreviewLayer layerWithSession:session];
  self.previewLayer.videoGravity = AVLayerVideoGravityResizeAspectFill;
  self.previewLayer.frame = self.bounds;
  [self.layer addSublayer:self.previewLayer];
}

- (void)invalidatePreview {
  if (self.previewLayer) {
    [self.previewLayer removeFromSuperlayer];
    self.previewLayer = nil;
  }
  if (self.ownFibriChecker) {
    [self.ownFibriChecker stop];
    self.ownFibriChecker = nil;
    if (_standalonePreviewOwner == self) _standalonePreviewOwner = nil;
  }
}

@end

@implementation RNCameraPreviewViewManager

+ (BOOL)isStandalonePreviewActive {
  return _standalonePreviewOwner != nil;
}

#ifndef RCT_NEW_ARCH_ENABLED
RCT_EXPORT_MODULE(FibriCheckCameraPreview)
#endif

- (UIView *)view {
  return [[RNCameraPreviewUIView alloc] init];
}

- (UIView<RNCameraPreviewLifecycle> *)fabricView {
  RNCameraPreviewUIView *view = [[RNCameraPreviewUIView alloc] init];
  view.fabricManaged = YES;
  return view;
}

@end

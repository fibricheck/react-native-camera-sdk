#import "RNCameraPreviewViewManager.h"
#import "RNTFibriCheckViewController.h"
#import "FibriCheckerComponent.h"
#import <AVFoundation/AVFoundation.h>
#import <React/RCTLog.h>

static BOOL _standalonePreviewActive = NO;

@interface RNCameraPreviewUIView : UIView
@property (nonatomic, strong) AVCaptureVideoPreviewLayer *previewLayer;
@property (nonatomic, strong) FibriChecker *ownFibriChecker;
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
    [self setupPreviewLayer];
  });
}

- (void)didMoveToWindow {
  [super didMoveToWindow];
  if (self.window) {
    [self setupPreviewLayer];
  } else {
    [self teardownPreviewLayer];
  }
}

- (void)layoutSubviews {
  [super layoutSubviews];
  self.previewLayer.frame = self.bounds;
}

- (void)setupPreviewLayer {
  if (self.previewLayer) return;

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
    [self attachPreviewLayerToSession:session];
  } else {
    // Standalone mode: no RNFibriCheckView present — own the FibriChecker instance.
    self.ownFibriChecker = [FibriChecker new];
    [self.ownFibriChecker startPreview];
    AVCaptureSession *session = self.ownFibriChecker.captureSession;
    if (!session) {
      RCTLogError(@"[RNCameraPreviewView] captureSession unavailable in standalone mode");
      self.ownFibriChecker = nil;
      return;
    }
    _standalonePreviewActive = YES;
    [self attachPreviewLayerToSession:session];
  }
}

- (void)attachPreviewLayerToSession:(AVCaptureSession *)session {
  self.previewLayer = [AVCaptureVideoPreviewLayer layerWithSession:session];
  self.previewLayer.videoGravity = AVLayerVideoGravityResizeAspectFill;
  self.previewLayer.frame = self.bounds;
  [self.layer addSublayer:self.previewLayer];
}

- (void)teardownPreviewLayer {
  if (self.previewLayer) {
    [self.previewLayer removeFromSuperlayer];
    self.previewLayer = nil;
  }
  if (self.ownFibriChecker) {
    [self.ownFibriChecker stop];
    self.ownFibriChecker = nil;
    _standalonePreviewActive = NO;
  }
}

@end

@implementation RNCameraPreviewViewManager

+ (BOOL)isStandalonePreviewActive {
  return _standalonePreviewActive;
}

RCT_EXPORT_MODULE(FibriCheckCameraPreview)

- (UIView *)view {
  return [[RNCameraPreviewUIView alloc] init];
}

@end

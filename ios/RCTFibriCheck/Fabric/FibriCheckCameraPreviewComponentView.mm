#ifdef RCT_NEW_ARCH_ENABLED

#import "FibriCheckCameraPreviewComponentView.h"

#import <react/renderer/components/RNFibriCheckSpecs/ComponentDescriptors.h>
#import <react/renderer/components/RNFibriCheckSpecs/RCTComponentViewHelpers.h>

#import <React/RCTFabricComponentsPlugins.h>

#import "RNCameraPreviewViewManager.h"

using namespace facebook::react;

@interface FibriCheckCameraPreviewComponentView () <RCTFibriCheckCameraPreviewViewProtocol>
@end

@implementation FibriCheckCameraPreviewComponentView {
  RNCameraPreviewViewManager *_viewManager;
  UIView<RNCameraPreviewLifecycle> *_previewView;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return facebook::react::concreteComponentDescriptorProvider<
      facebook::react::FibriCheckCameraPreviewComponentDescriptor>();
}

+ (BOOL)shouldBeRecycled
{
  // A preview owns an AVCaptureSession. Reusing the native component can preserve a stopped
  // session and its final frame across separate React mounts, so camera views must start fresh.
  return NO;
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const FibriCheckCameraPreviewProps>();
    _props = defaultProps;

    // RNCameraPreviewViewManager.view is a plain factory method for the shared/standalone preview
    // UIView (RNCameraPreviewUIView) - reusing it means the shared/standalone-preview coordination
    // with RNFibriCheckView doesn't need to be duplicated here.
    _viewManager = [RNCameraPreviewViewManager new];
    _previewView = [_viewManager fabricView];
    self.contentView = _previewView;
  }

  return self;
}

- (void)didMoveToWindow
{
  [super didMoveToWindow];
  if (self.window) {
    [_previewView activatePreview];
  } else {
    [_previewView invalidatePreview];
  }
}

- (void)prepareForRecycle
{
  [_previewView invalidatePreview];
  [super prepareForRecycle];
}

@end

Class<RCTComponentViewProtocol> FibriCheckCameraPreviewCls(void)
{
  return FibriCheckCameraPreviewComponentView.class;
}

#endif

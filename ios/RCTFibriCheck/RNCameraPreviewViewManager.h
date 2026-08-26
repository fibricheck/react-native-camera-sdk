#import <React/RCTViewManager.h>

@protocol RNCameraPreviewLifecycle <NSObject>
- (void)activatePreview;
- (void)invalidatePreview;
@end

@interface RNCameraPreviewViewManager : RCTViewManager

/**
 * Returns YES while a standalone RNCameraPreviewView (with its own FibriChecker instance) is
 * active. Used by RNTFibriCheckViewController to detect the conflict of mounting RNFibriCheckView
 * at the same time.
 */
+ (BOOL)isStandalonePreviewActive;

/** Creates a preview whose lifecycle is driven by its outer Fabric component view. */
- (UIView<RNCameraPreviewLifecycle> *)fabricView;

@end

#import <React/RCTViewManager.h>

@interface RNCameraPreviewViewManager : RCTViewManager

/**
 * Returns YES while a standalone RNCameraPreviewView (with its own FibriChecker instance) is
 * active. Used by RNTFibriCheckViewController to detect the conflict of mounting RNFibriCheckView
 * at the same time.
 */
+ (BOOL)isStandalonePreviewActive;

@end

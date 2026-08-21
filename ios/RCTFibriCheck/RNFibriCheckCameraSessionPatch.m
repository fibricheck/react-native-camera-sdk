#import "FibriCheckerComponent.h"
#import <FibriCheckCameraSDK/MeasurementController.h>
#import <AVFoundation/AVFoundation.h>
#import <objc/runtime.h>

// FibriCheckCameraSDK 1.1.0 initializes AVCaptureSession on the caller's thread and starts it
// asynchronously. A rapid preview remount can therefore call startRunning while the session is
// still between beginConfiguration and commitConfiguration. Keep this compatibility fix local to
// that exact native version; later SDKs contain the serialized implementation themselves.
@interface MeasurementController (RNFibriCheckCameraSessionPatchPrivate)
@property (nonatomic, readonly) dispatch_queue_t dispatchQueue;
@property (nonatomic, readonly) AVCaptureSession *session;
@property (nonatomic, readonly) BOOL isCameraInit;
- (void)initCamera;
- (void)configureCamera;
- (void)rnfc_startCamera;
@end

@implementation MeasurementController (RNFibriCheckCameraSessionPatch)

- (void)rnfc_startCamera {
  dispatch_queue_t cameraQueue = self.dispatchQueue;
  if (!cameraQueue) return;

  dispatch_async(cameraQueue, ^{
    [self initCamera];
    if (!self.isCameraInit) return;

    if (!self.session.isRunning) {
      [self.session startRunning];
    }

    dispatch_async(dispatch_get_main_queue(), ^{
      [self configureCamera];
    });
  });
}

@end

@interface RNFibriCheckCameraSessionPatchLoader : NSObject
@end

@implementation RNFibriCheckCameraSessionPatchLoader

+ (void)load {
  if (![[FibriChecker sdkVersion] isEqualToString:@"1.1.0"]) return;

  Method original = class_getInstanceMethod(MeasurementController.class, @selector(startCamera));
  Method replacement = class_getInstanceMethod(MeasurementController.class, @selector(rnfc_startCamera));
  if (original && replacement) {
    method_exchangeImplementations(original, replacement);
  }
}

@end

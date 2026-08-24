#import <FibriCheckCameraSDK/MeasurementController.h>
#import <AVFoundation/AVFoundation.h>
#import <objc/runtime.h>

// FibriCheckCameraSDK 1.1.0 initializes AVCaptureSession on the caller's thread while stopCamera
// tears it down synchronously on dispatchQueue. A rapid remount can therefore start and stop the
// same session concurrently. The podspec is pinned to 1.1.0 while this compatibility patch is in
// place; remove both the pin and this file once the fix is available in the native SDK.
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
  Method original = class_getInstanceMethod(MeasurementController.class, @selector(startCamera));
  Method replacement = class_getInstanceMethod(MeasurementController.class, @selector(rnfc_startCamera));
  if (original && replacement) {
    method_exchangeImplementations(original, replacement);
  }
}

@end

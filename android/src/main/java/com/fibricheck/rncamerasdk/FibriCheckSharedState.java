package com.fibricheck.rncamerasdk;

import android.widget.FrameLayout;

/**
 * RNFibriCheck and RNCameraPreviewView are two separate React Native view managers that need to
 * coordinate: RNCameraPreviewView reparents RNFibriCheck's previewContainer (holding the camera's
 * TextureView) when operating in "shared" mode, and needs to know whether a standalone preview is
 * active to avoid mounting both at once.
 *
 * This coordination used to be done via static fields shared across both ViewManager classes,
 * which is a real bug: static state is shared across every RN bridge/surface instance in the
 * process, not scoped to a single mounted view tree, so two independently mounted component
 * instances (e.g. across a Fast Refresh reload, or genuinely multiple concurrent screens) could
 * silently clobber each other's state. One instance of this class is created per RNFibriCheckPackage
 * and passed to both ViewManagers, scoping the shared state to a single ReactPackage/bridge instance
 * instead.
 */
class FibriCheckSharedState {
  volatile FrameLayout previewContainer;
  volatile FrameLayout rootLayout;
  volatile RNCameraPreviewView.PreviewFrameLayout standalonePreviewOwner;
  volatile RNCameraPreviewView.PreviewFrameLayout sharedPreviewOwner;
}

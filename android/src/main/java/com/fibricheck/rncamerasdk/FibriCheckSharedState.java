package com.fibricheck.rncamerasdk;

import android.widget.FrameLayout;

/**
 * State for the single measurement view supported by each React Native instance. Android camera
 * preview is registered as a no-op while camera SDK 1.0.2 is in use.
 */
class FibriCheckSharedState {
  volatile FrameLayout previewContainer;
  volatile FrameLayout rootLayout;
}

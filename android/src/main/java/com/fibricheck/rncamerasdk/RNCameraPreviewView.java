package com.fibricheck.rncamerasdk;

import android.widget.FrameLayout;

import androidx.annotation.NonNull;

import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
public class RNCameraPreviewView extends SimpleViewManager<RNCameraPreviewView.PreviewFrameLayout> {
  public static final String REACT_CLASS = "FibriCheckCameraPreview";

  public RNCameraPreviewView(@NonNull FibriCheckSharedState sharedState) {
    // Keep the native component registered so existing JavaScript remains loadable. Android is
    // pinned to camera SDK 1.0.2 for this release, where preview support is intentionally disabled.
  }

  @NonNull
  @Override
  public String getName() {
    return REACT_CLASS;
  }

  @NonNull
  @Override
  public PreviewFrameLayout createViewInstance(@NonNull ThemedReactContext context) {
    return new PreviewFrameLayout(context);
  }

  public static class PreviewFrameLayout extends FrameLayout {
    public PreviewFrameLayout(ThemedReactContext context) {
      super(context);
    }
  }
}

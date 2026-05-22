package com.fibricheck.rncamerasdk;

import android.app.Activity;
import android.content.Context;
import android.content.ContextWrapper;
import android.util.Log;
import android.view.ViewParent;
import android.widget.FrameLayout;

import androidx.annotation.NonNull;

import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.qompium.fibricheck.camerasdk.FibriChecker;

public class RNCameraPreviewView extends SimpleViewManager<RNCameraPreviewView.PreviewFrameLayout> {
  public static final String REACT_CLASS = "FibriCheckCameraPreview";
  private static final String TAG = "RNCameraPreviewView";

  // Tracks whether a standalone preview is active so RNFibriCheck can detect the conflict.
  static boolean standalonePreviewActive = false;

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

    private boolean isStandaloneMode = false;
    private FibriChecker ownFibriChecker;

    public PreviewFrameLayout(Context context) {
      super(context);
    }

    @Override
    protected void onAttachedToWindow() {
      super.onAttachedToWindow();
      FrameLayout previewContainer = RNFibriCheck.previewContainer;
      if (previewContainer != null) {
        // Shared mode: RNFibriCheckView is mounted — steal its TextureView container.
        // It may already be parented to RNFibriCheck's rootLayout, so detach it first.
        ViewParent currentParent = previewContainer.getParent();
        if (currentParent instanceof android.view.ViewGroup) {
          ((android.view.ViewGroup) currentParent).removeView(previewContainer);
        }
        addView(previewContainer, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
      } else {
        // Standalone mode: no RNFibriCheckView present — own the FibriChecker instance.
        Activity activity = getActivity(getContext());
        if (activity == null) {
          Log.e(TAG, "Cannot start standalone preview: no Activity found in context");
          return;
        }
        isStandaloneMode = true;
        standalonePreviewActive = true;
        FrameLayout container = new FrameLayout(getContext());
        ownFibriChecker = new FibriChecker.FibriBuilder(activity, container).build();
        ownFibriChecker.start();
        addView(container, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
      }
    }

    @Override
    protected void onDetachedFromWindow() {
      if (isStandaloneMode) {
        if (ownFibriChecker != null) {
          ownFibriChecker.stop();
          ownFibriChecker = null;
        }
        standalonePreviewActive = false;
        isStandaloneMode = false;
      } else {
        // Return previewContainer to rootLayout so FibriChecker retains its camera surface.
        FrameLayout previewContainer = RNFibriCheck.previewContainer;
        FrameLayout root = RNFibriCheck.rootLayout;
        if (previewContainer != null && root != null) {
          removeView(previewContainer);
          root.addView(previewContainer, 0, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        }
      }
      super.onDetachedFromWindow();
    }

    private static Activity getActivity(Context context) {
      if (context instanceof Activity) return (Activity) context;
      if (context instanceof ContextWrapper) return getActivity(((ContextWrapper) context).getBaseContext());
      return null;
    }
  }
}

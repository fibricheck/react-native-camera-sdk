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

  private final FibriCheckSharedState sharedState;

  public RNCameraPreviewView(@NonNull FibriCheckSharedState sharedState) {
    this.sharedState = sharedState;
  }

  @NonNull
  @Override
  public String getName() {
    return REACT_CLASS;
  }

  @NonNull
  @Override
  public PreviewFrameLayout createViewInstance(@NonNull ThemedReactContext context) {
    return new PreviewFrameLayout(context, sharedState);
  }

  public static class PreviewFrameLayout extends FrameLayout {

    private final FibriCheckSharedState sharedState;
    private boolean isStandaloneMode = false;
    private FibriChecker ownFibriChecker;
    private FrameLayout sharedPreviewContainer;

    public PreviewFrameLayout(Context context, FibriCheckSharedState sharedState) {
      super(context);
      this.sharedState = sharedState;
    }

    @Override
    protected void onAttachedToWindow() {
      super.onAttachedToWindow();
      FrameLayout previewContainer = sharedState.previewContainer;
      if (previewContainer != null) {
        sharedState.sharedPreviewOwner = this;
        bindSharedPreview(previewContainer);
      } else {
        // Standalone mode: no RNFibriCheckView present — own the FibriChecker instance.
        if (sharedState.standalonePreviewOwner != null && sharedState.standalonePreviewOwner != this) {
          Log.e(TAG, "Only one standalone FibriCheckCameraPreview is supported per React Native instance.");
          return;
        }
        Activity activity = getActivity(getContext());
        if (activity == null) {
          Log.e(TAG, "Cannot start standalone preview: no Activity found in context");
          return;
        }
        isStandaloneMode = true;
        sharedState.standalonePreviewOwner = this;
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
        if (sharedState.standalonePreviewOwner == this) {
          sharedState.standalonePreviewOwner = null;
        }
        isStandaloneMode = false;
      } else {
        // Return previewContainer to rootLayout so FibriChecker retains its camera surface.
        FrameLayout previewContainer = sharedPreviewContainer;
        FrameLayout root = sharedState.rootLayout;
        if (previewContainer != null && previewContainer == sharedState.previewContainer && root != null) {
          removeView(previewContainer);
          root.addView(previewContainer, 0, new FrameLayout.LayoutParams(1, 1));
        }
        sharedPreviewContainer = null;
        if (sharedState.sharedPreviewOwner == this) {
          sharedState.sharedPreviewOwner = null;
        }
      }
      super.onDetachedFromWindow();
    }

    void bindSharedPreview(FrameLayout previewContainer) {
      if (sharedPreviewContainer == previewContainer) return;
      if (sharedPreviewContainer != null && sharedPreviewContainer.getParent() == this) {
        removeView(sharedPreviewContainer);
      }
      ViewParent currentParent = previewContainer.getParent();
      if (currentParent instanceof android.view.ViewGroup) {
        ((android.view.ViewGroup) currentParent).removeView(previewContainer);
      }
      sharedPreviewContainer = previewContainer;
      addView(previewContainer, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
    }

    private static Activity getActivity(Context context) {
      if (context instanceof Activity) return (Activity) context;
      if (context instanceof ContextWrapper) return getActivity(((ContextWrapper) context).getBaseContext());
      return null;
    }
  }
}

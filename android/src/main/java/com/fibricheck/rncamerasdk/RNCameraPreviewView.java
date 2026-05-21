package com.fibricheck.rncamerasdk;

import android.app.Activity;
import android.content.Context;
import android.content.ContextWrapper;
import android.util.Log;
import android.widget.FrameLayout;

import androidx.annotation.NonNull;

import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;

public class RNCameraPreviewView extends SimpleViewManager<RNCameraPreviewView.PreviewFrameLayout> {
    public static final String REACT_CLASS = "FibriCheckCameraPreview";
    private static final String TAG = "RNCameraPreviewView";

    private final FibriCheckerCoordinator coordinator;

    public RNCameraPreviewView(FibriCheckerCoordinator coordinator) {
        this.coordinator = coordinator;
    }

    @NonNull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @NonNull
    @Override
    public PreviewFrameLayout createViewInstance(@NonNull ThemedReactContext context) {
        return new PreviewFrameLayout(context, coordinator);
    }

    public static class PreviewFrameLayout extends FrameLayout {
        private static final String TAG = "PreviewFrameLayout";

        private final FibriCheckerCoordinator coordinator;

        public PreviewFrameLayout(Context context, FibriCheckerCoordinator coordinator) {
            super(context);
            this.coordinator = coordinator;
        }

        @Override
        protected void onAttachedToWindow() {
            super.onAttachedToWindow();
            Activity activity = getActivity(getContext());
            if (activity == null) {
                Log.e(TAG, "Cannot attach preview: no Activity found in context");
                return;
            }
            coordinator.onPreviewViewAttached(activity, this);
        }

        @Override
        protected void onDetachedFromWindow() {
            coordinator.onPreviewViewDetached();
            super.onDetachedFromWindow();
        }

        private static Activity getActivity(Context context) {
            if (context instanceof Activity) return (Activity) context;
            if (context instanceof ContextWrapper) return getActivity(((ContextWrapper) context).getBaseContext());
            return null;
        }
    }
}

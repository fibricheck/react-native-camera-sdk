package com.fibricheck.rncamerasdk;

import android.app.Activity;
import android.util.Log;
import android.view.TextureView;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.qompium.fibricheck.camerasdk.FibriChecker;
import com.qompium.fibricheck.camerasdk.listeners.FibriListener;
import com.qompium.fibricheck.camerasdk.measurement.MeasurementData;

class FibriCheckerCoordinator implements LifecycleEventListener {
    private static final String TAG = "FibriCheckerCoordinator";

    private final ReactApplicationContext reactContext;

    private FibriChecker fibriChecker;
    private SafeFibriListener safeListener;
    private FibriListener fibriListener;
    private boolean isRunning = false;
    private FibriCheckerConfig config = new FibriCheckerConfig();

    private Activity currentActivity;
    private FrameLayout previewContainer;
    private FrameLayout mainRootLayout;

    FibriCheckerCoordinator(ReactApplicationContext reactContext) {
        this.reactContext = reactContext;
        reactContext.addLifecycleEventListener(this);
    }

    synchronized void onMainViewCreated(Activity activity, FrameLayout rootLayout, FrameLayout previewContainer) {
        if (fibriChecker != null && mainRootLayout == null) {
            Log.w(TAG, "RNFibriCheck mounted while standalone preview was active; stopping standalone preview.");
            teardown();
        }
        this.currentActivity = activity;
        this.mainRootLayout = rootLayout;
        this.previewContainer = previewContainer;
        buildFibriChecker();
        start();
    }

    synchronized void onMainViewDropped() {
        teardown();
        mainRootLayout = null;
    }

    synchronized void onPreviewViewAttached(Activity activity, FrameLayout previewLayout) {
        if (mainRootLayout != null) {
            reparentTo(activity, previewLayout);
        } else {
            // Standalone mode: no FibriCheck measurement view mounted.
            this.currentActivity = activity;
            this.previewContainer = new FrameLayout(previewLayout.getContext());
            previewLayout.addView(previewContainer, matchParentParams());
            buildFibriChecker();
            start();
        }
    }

    synchronized void onPreviewViewDetached() {
        if (mainRootLayout != null) {
            // Return previewContainer to index 0 of rootLayout so it sits behind the graph.
            reparentToRoot();
        } else {
            // Standalone mode: full teardown.
            teardown();
            currentActivity = null;
        }
    }

    synchronized void setFibriListener(FibriListener listener) {
        this.fibriListener = listener;
        if (safeListener != null) {
            safeListener.setDelegate(listener);
        }
    }

    synchronized void start() {
        if (isRunning || fibriChecker == null) return;
        isRunning = true;
        fibriChecker.start();
    }

    synchronized void stop() {
        if (!isRunning || fibriChecker == null) return;
        isRunning = false;
        fibriChecker.stop();
    }

    synchronized void startRecording() {
        if (fibriChecker != null) fibriChecker.startRecording();
    }

    synchronized void applyConfig(FibriCheckerConfig config) {
        this.config = config;
        if (fibriChecker != null) {
            config.applyTo(fibriChecker);
            fibriChecker.initializeListeners();
        }
    }

    // The SDK closes the camera in its own ActivityLifecycleCallbacks on pause; we do not
    // duplicate that. We keep isRunning = true so onHostResume knows to rebuild.
    @Override public void onHostPause() {}

    @Override
    public synchronized void onHostResume() {
        // The SDK's onActivityPaused closed the camera but did not reset our isRunning flag.
        // Rebuild the FibriChecker so the camera reopens cleanly rather than calling start()
        // on a partially-torn-down instance (which has no idempotency guard).
        if (isRunning) {
            rebuild();
        }
    }

    @Override
    public synchronized void onHostDestroy() {
        teardown();
        reactContext.removeLifecycleEventListener(this);
    }

    // -- Private --

    private void reparentTo(Activity activity, FrameLayout newParent) {
        boolean wasRunning = isRunning;
        isRunning = false;
        nullSurfaceTextureListener();
        stopFibriChecker();
        previewContainer.removeAllViews();

        ViewGroup oldParent = (ViewGroup) previewContainer.getParent();
        if (oldParent != null) oldParent.removeView(previewContainer);
        newParent.addView(previewContainer, matchParentParams());

        this.currentActivity = activity;
        buildFibriChecker();
        if (wasRunning) {
            isRunning = true;
            fibriChecker.start();
        }
    }

    private void reparentToRoot() {
        boolean wasRunning = isRunning;
        isRunning = false;
        nullSurfaceTextureListener();
        stopFibriChecker();
        previewContainer.removeAllViews();

        ViewGroup oldParent = (ViewGroup) previewContainer.getParent();
        if (oldParent != null) oldParent.removeView(previewContainer);
        // Insert at 0 so it sits behind the graph view.
        mainRootLayout.addView(previewContainer, 0, matchParentParams());

        buildFibriChecker();
        if (wasRunning) {
            isRunning = true;
            fibriChecker.start();
        }
    }

    private void rebuild() {
        // Full rebuild in place: clears the old TextureView, creates a fresh FibriChecker in
        // the same previewContainer location. Used on resume to avoid calling start() on an
        // instance the SDK has already partially torn down via its own lifecycle callbacks.
        boolean wasRunning = isRunning;
        isRunning = false;
        nullSurfaceTextureListener();
        stopFibriChecker();
        if (previewContainer != null) previewContainer.removeAllViews();
        buildFibriChecker();
        if (wasRunning && fibriChecker != null) {
            isRunning = true;
            fibriChecker.start();
        }
    }

    private void buildFibriChecker() {
        if (currentActivity == null || previewContainer == null) {
            Log.e(TAG, "Cannot build FibriChecker: activity or previewContainer is null");
            return;
        }
        safeListener = new SafeFibriListener(fibriListener);
        fibriChecker = new FibriChecker.FibriBuilder(currentActivity, previewContainer).build();
        fibriChecker.setFibriListener(safeListener);
        config.applyTo(fibriChecker);
    }

    private void stopFibriChecker() {
        if (fibriChecker == null) return;
        // Silence the delegate inside the wrapper before calling stop(). The SDK's stop()
        // internally clears its own listener reference, but the background thread may still
        // be mid-execution and call handleStates() after that. The SafeFibriListener wrapper
        // is always non-null (no SDK NPE), and the null delegate means callbacks are no-ops.
        // TODO: remove SafeFibriListener once the SDK null-checks its listener in handleStates().
        if (safeListener != null) {
            safeListener.setDelegate(null);
            safeListener = null;
        }
        fibriChecker.stop();
        fibriChecker = null;
    }

    private void teardown() {
        isRunning = false;
        nullSurfaceTextureListener();
        stopFibriChecker();
        if (previewContainer != null) {
            previewContainer.removeAllViews();
            previewContainer = null;
        }
    }

    // Severs the SDK's SurfaceTextureListener before we destroy the surface so the SDK does
    // not receive a spurious onSurfaceTextureDestroyed callback on a stopped instance.
    // TODO: remove once the SDK clears its own SurfaceTextureListener in stop().
    private void nullSurfaceTextureListener() {
        if (previewContainer == null) return;
        for (int i = 0; i < previewContainer.getChildCount(); i++) {
            View child = previewContainer.getChildAt(i);
            if (child instanceof TextureView) {
                ((TextureView) child).setSurfaceTextureListener(null);
            }
        }
    }

    private static FrameLayout.LayoutParams matchParentParams() {
        return new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        );
    }

    // Wrapper that the SDK holds permanently so it never NPEs on a null listener reference.
    // We control callback forwarding by swapping the delegate, not the SDK's reference.
    private static class SafeFibriListener implements FibriListener {
        private volatile FibriListener delegate;

        SafeFibriListener(FibriListener delegate) {
            this.delegate = delegate;
        }

        void setDelegate(FibriListener delegate) {
            this.delegate = delegate;
        }

        @Override public void onSampleReady(double ppg, double raw) {
            FibriListener d = delegate; if (d != null) d.onSampleReady(ppg, raw);
        }
        @Override public void onFingerDetected() {
            FibriListener d = delegate; if (d != null) d.onFingerDetected();
        }
        @Override public void onFingerRemoved(double y, double v, double stdDevY) {
            FibriListener d = delegate; if (d != null) d.onFingerRemoved(y, v, stdDevY);
        }
        @Override public void onCalibrationReady() {
            FibriListener d = delegate; if (d != null) d.onCalibrationReady();
        }
        @Override public void onHeartBeat(int value) {
            FibriListener d = delegate; if (d != null) d.onHeartBeat(value);
        }
        @Override public void onTimeRemaining(int seconds) {
            FibriListener d = delegate; if (d != null) d.onTimeRemaining(seconds);
        }
        @Override public void onMeasurementFinished(long timestamp) {
            FibriListener d = delegate; if (d != null) d.onMeasurementFinished(timestamp);
        }
        @Override public void onMeasurementStart(long timestamp) {
            FibriListener d = delegate; if (d != null) d.onMeasurementStart(timestamp);
        }
        @Override public void onFingerDetectionTimeExpired() {
            FibriListener d = delegate; if (d != null) d.onFingerDetectionTimeExpired();
        }
        @Override public void onPulseDetected() {
            FibriListener d = delegate; if (d != null) d.onPulseDetected();
        }
        @Override public void onPulseDetectionTimeExpired() {
            FibriListener d = delegate; if (d != null) d.onPulseDetectionTimeExpired();
        }
        @Override public void onMovementDetected() {
            FibriListener d = delegate; if (d != null) d.onMovementDetected();
        }
        @Override public void onMeasurementProcessed(MeasurementData measurementData) {
            FibriListener d = delegate; if (d != null) d.onMeasurementProcessed(measurementData);
        }
        @Override public void onMeasurementError(String message) {
            FibriListener d = delegate; if (d != null) d.onMeasurementError(message);
        }
    }
}

//  Created by react-native-create-bridge

package com.fibricheck.rncamerasdk;

import android.app.Activity;
import android.content.Context;
import android.content.ContextWrapper;
import android.graphics.Color;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;

import com.facebook.infer.annotation.Assertions;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.UIManagerHelper;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.uimanager.events.EventDispatcher;
import com.google.gson.Gson;
import com.jjoe64.graphview.GraphView;
import com.jjoe64.graphview.series.DataPoint;
import com.jjoe64.graphview.series.LineGraphSeries;
import com.qompium.fibricheck.camerasdk.FibriChecker;
import com.qompium.fibricheck.camerasdk.listeners.FibriListener;
import com.qompium.fibricheck.camerasdk.measurement.MeasurementData;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import org.json.JSONException;
import org.json.JSONObject;


public class RNFibriCheck extends SimpleViewManager<FrameLayout> {
  public static final String REACT_CLASS = "FibriCheck";
  private static final String TAG = "RNFibriCheck";
  private static final String COMMAND_START_MEASUREMENT_STRING = "startMeasurement";
  private static final String COMMAND_START_RECORDING_STRING = "startRecording";
  private static final String COMMAND_RESET_MODULE_STRING = "resetModule";
  private static final int SAMPLE_COUNT = 120;

  private final FibriCheckSharedState sharedState;

  public RNFibriCheck(@NonNull FibriCheckSharedState sharedState) {
    this.sharedState = sharedState;
  }

  public boolean drawGraphPoints = false;

  private LineGraphSeries<DataPoint> series;

  private ArrayList<Double> valueSR;

  private int xValue = 0;

  private GraphView graphView;


  private FibriChecker fibriChecker;

  private static final String EVENT_SAMPLE_READY = "onSampleReady";
  private static final String EVENT_FINGER_DETECTED = "onFingerDetected";
  private static final String EVENT_FINGER_REMOVED = "onFingerRemoved";
  private static final String EVENT_CALIBRATION_READY = "onCalibrationReady";
  private static final String EVENT_HEARTBEAT = "onHeartBeat";
  private static final String EVENT_TIME_REMAINING = "onTimeRemaining";
  private static final String EVENT_MEASUREMENT_FINISHED = "onMeasurementFinished";
  private static final String EVENT_MEASUREMENT_START = "onMeasurementStart";
  private static final String EVENT_FINGER_DETECTION_TIME_EXPIRED = "onFingerDetectionTimeExpired";
  private static final String EVENT_PULSE_DETECTED = "onPulseDetected";
  private static final String EVENT_PULSE_DETECTION_TIME_EXPIRED = "onPulseDetectionTimeExpired";
  private static final String EVENT_MOVEMENT_DETECTED = "onMovementDetected";
  private static final String EVENT_MEASUREMENT_PROCESSED = "onMeasurementProcessed";
  private static final String EVENT_MEASUREMENT_ERROR = "onMeasurementError";

  public Activity getActivity(Context context) {
    if (context == null) {
      return null;
    } else if (context instanceof ContextWrapper) {
      if (context instanceof Activity) {
        return (Activity) context;
      } else {
        return getActivity(((ContextWrapper) context).getBaseContext());
      }
    }

    return null;
  }

  @NonNull
  @Override
  public String getName() {
    // Tell React the name of the module
    // https://facebook.github.io/react-native/docs/native-components-android.html#1-create-the-viewmanager-subclass
    return REACT_CLASS;
  }

  private void sendEvent(FrameLayout sourceView,
                         String eventName,
                         @Nullable WritableMap params) {
    if (sharedState.rootLayout != sourceView) return;
    ReactContext reactContext = (ReactContext) sourceView.getContext();
    int reactTag = sourceView.getId();

    EventDispatcher dispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, reactTag);
    if (dispatcher == null) return;
    int surfaceId = UIManagerHelper.getSurfaceId(sourceView);
    dispatcher.dispatchEvent(new FibriCheckEvent(surfaceId, reactTag, eventName, params));
  }

  @NonNull
  @Override
  public FrameLayout createViewInstance(@NonNull ThemedReactContext context) {
    Log.i(TAG, "Creating View instance");
    if (sharedState.rootLayout != null) {
      Log.e(TAG, "Only one mounted FibriCheck measurement view is supported per React Native instance.");
      return new FrameLayout(context);
    }
    if (sharedState.standalonePreviewOwner != null) {
      Log.e(TAG, "Cannot mount FibriCheck while a standalone FibriCheckCameraPreview is active.");
      return new FrameLayout(context);
    }

    Activity activity = context.getCurrentActivity();
    if (activity == null) activity = getActivity(context);
    if (activity == null) {
      Log.e(TAG, "createViewInstance: no Activity available, cannot initialize FibriChecker");
      return new FrameLayout(context);
    }

    FrameLayout rootLayout = new FrameLayout(context);
    rootLayout.setLayoutParams(new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
    rootLayout.setKeepScreenOn(true);
    valueSR = new ArrayList<>();

    // previewContainer must be in the view hierarchy so FibriChecker's TextureView gets a SurfaceTexture.
    // Kept at 1x1 so it is invisible; RNCameraPreviewView reparents it when operating in standalone mode.
    FrameLayout previewContainer = new FrameLayout(context);
    previewContainer.setLayoutParams(new FrameLayout.LayoutParams(1, 1));
    rootLayout.addView(previewContainer);

    graphView = createGraphView(context);
    rootLayout.addView(graphView);

    sharedState.rootLayout = rootLayout;
    sharedState.previewContainer = previewContainer;
    fibriChecker = new FibriChecker.FibriBuilder(activity, previewContainer).build();
    fibriChecker.setFibriListener(new FibriListener() {

      @Override public void onSampleReady(final double ppg, double raw) {
        if (drawGraphPoints) {
          addGraphData(ppg);
        }
        WritableMap event = Arguments.createMap();
        event.putDouble("ppg", ppg);
        event.putDouble("raw", raw);
        sendEvent(rootLayout, EVENT_SAMPLE_READY, event);
      }

      @Override public void onFingerDetected() {
        WritableMap event = Arguments.createMap();
        sendEvent(rootLayout, EVENT_FINGER_DETECTED, event);
      }

      @Override public void onFingerRemoved(double y, double v, double stdDevY) {
        WritableMap event = Arguments.createMap();
        event.putDouble("y", y);
        event.putDouble("v", v);
        event.putDouble("stdDevY", stdDevY);
        sendEvent(rootLayout, EVENT_FINGER_REMOVED, event);
      }

      @Override public void onCalibrationReady() {
        WritableMap event = Arguments.createMap();
        sendEvent(rootLayout, EVENT_CALIBRATION_READY, event);
      }

      @Override public void onHeartBeat(int value) {
        WritableMap event = Arguments.createMap();
        event.putInt("heartRate", value);
        sendEvent(rootLayout, EVENT_HEARTBEAT, event);
      }

      @Override public void onTimeRemaining(int seconds) {
          WritableMap event = Arguments.createMap();
          event.putInt("seconds", seconds);
          sendEvent(rootLayout, EVENT_TIME_REMAINING, event);
      }

      @Override public void onMeasurementFinished(long timestamp) {
        WritableMap event = Arguments.createMap();
        sendEvent(rootLayout, EVENT_MEASUREMENT_FINISHED, event);
      }

      @Override public void onMeasurementStart(long timestamp) {
        WritableMap event = Arguments.createMap();
        sendEvent(rootLayout, EVENT_MEASUREMENT_START, event);
      }

      @Override public void onFingerDetectionTimeExpired() {
        WritableMap event = Arguments.createMap();
        sendEvent(rootLayout, EVENT_FINGER_DETECTION_TIME_EXPIRED, event);
      }

      @Override public void onPulseDetected() {
        WritableMap event = Arguments.createMap();
        sendEvent(rootLayout, EVENT_PULSE_DETECTED, event);
      }

      @Override public void onPulseDetectionTimeExpired() {
        WritableMap event = Arguments.createMap();
        sendEvent(rootLayout, EVENT_PULSE_DETECTION_TIME_EXPIRED, event);
      }

      @Override public void onMovementDetected() {
        WritableMap event = Arguments.createMap();
        sendEvent(rootLayout, EVENT_MOVEMENT_DETECTED, event);
      }

      @Override public void onMeasurementProcessed(MeasurementData measurementData) {

        Log.i(TAG, "Measurement processed with Heartbeat: " + measurementData.heartrate);
        WritableMap event = Arguments.createMap();
        try {
          Gson gson = new Gson();
          JSONObject jsonObject = new JSONObject(gson.toJson(measurementData));
          String measurementJson = jsonObject.toString();
          event.putString("measurement", measurementJson);
          sendEvent(rootLayout, EVENT_MEASUREMENT_PROCESSED, event);
        } catch (JSONException | NullPointerException ex) {
          Log.e(TAG, ex.toString());
        }
      }

       @Override public void onMeasurementError(String message) {
          WritableMap event = Arguments.createMap();
          event.putString("message", message);
          sendEvent(rootLayout, EVENT_MEASUREMENT_ERROR, event);
      }
    });

    RNCameraPreviewView.PreviewFrameLayout previewOwner = sharedState.sharedPreviewOwner;
    if (previewOwner != null) previewOwner.bindSharedPreview(previewContainer);

    return rootLayout;
  }

  @Override
  public void receiveCommand(@NonNull FrameLayout view, @NonNull String commandId, @Nullable ReadableArray args) {
    Assertions.assertNotNull(args);
    if (sharedState.rootLayout != view) {
      Log.e(TAG, "Ignoring command for an inactive FibriCheck view: " + commandId);
      return;
    }

    Log.i(TAG, "Received command: " + commandId);
    switch (commandId) {
      case COMMAND_START_MEASUREMENT_STRING: {
        Log.i(TAG, "Command Received: start measurement");
        if (fibriChecker != null) fibriChecker.start();
        break;
      }
      case COMMAND_START_RECORDING_STRING: {
        Log.i(TAG, "Command Received: start recording");
        if (fibriChecker != null) fibriChecker.startRecording();
        break;
      }
      case COMMAND_RESET_MODULE_STRING: {
        Log.i(TAG, "Command Received: reset Module");
        if (fibriChecker != null) fibriChecker.stop();
        break;
      }

      default:
        throw new IllegalArgumentException(
                String.format("Unsupported command %s received by %s.", commandId,
                        getClass().getSimpleName()));
    }
  }

  //region Props Setters
  // Set properties from React onto your native component via a setter method
  // https://facebook.github.io/react-native/docs/native-components-android.html#3-expose-view-property-setters-using-reactprop-or-reactpropgroup-annotation
  @ReactProp(name = "drawGraph")
  public void setDrawGraph(View view, boolean drawGraph) {
    if (sharedState.rootLayout != view) return;
    drawGraphPoints = drawGraph;
  }

  @ReactProp(name = "drawBackground")
  public void setDrawBackground(View view, boolean drawBackground) {
    if (sharedState.rootLayout != view) return;
    series.setDrawBackground(drawBackground);
  }

  @ReactProp(name = "lineColor", customType = "Color")
  public void setLineColor(View view, @Nullable Integer lineColor) {
    if (sharedState.rootLayout != view) return;
     series.setColor(lineColor != null ? lineColor : Color.BLUE);
  }

  @ReactProp(name = "lineThickness")
  public void setLineThickness(View view, int lineThickness) {
    if (sharedState.rootLayout != view) return;
     series.setThickness(lineThickness);
  }

  @ReactProp(name = "graphBackgroundColor", customType = "Color")
  public void setGraphBackgroundColor(View view, @Nullable Integer graphBackgroundColor) {
    if (sharedState.rootLayout != view) return;
     series.setBackgroundColor(graphBackgroundColor != null ? graphBackgroundColor : Color.TRANSPARENT);
  }

  @ReactProp(name = "sampleTime")
  public void setSampleTime(View view, int sampleTime) {
    if (sharedState.rootLayout != view) return;
    fibriChecker.sampleTime = sampleTime;
    Log.i(TAG, "Sampletime set to: " + sampleTime);
  }

  @ReactProp(name = "accEnabled")
  public void setAccEnabled(View view, boolean accEnabled) {
    if (sharedState.rootLayout != view) return;
    fibriChecker.accEnabled = accEnabled;
  }

  @ReactProp(name = "fingerDetectionExpiryTime")
  public void setFingerDetectionExpiryTime(View view, int fingerDetectionExpiryTime) {
    if (sharedState.rootLayout != view) return;
    fibriChecker.fingerDetectionExpiryTime = fingerDetectionExpiryTime;
  }

  @ReactProp(name = "pulseDetectionExpiryTime")
  public void setPulseDetectionExpiryTime(View view, int pulseDetectionExpiryTime) {
    if (sharedState.rootLayout != view) return;
    fibriChecker.pulseDetectionExpiryTime = pulseDetectionExpiryTime;
  }

  @ReactProp(name = "flashEnabled")
  public void setFlashEnabled(View view, boolean flashEnabled) {
    if (sharedState.rootLayout != view) return;
    fibriChecker.flashEnabled = flashEnabled;
  }

  @ReactProp(name = "gravEnabled")
  public void setGravEnabled(View view, boolean gravEnabled) {
    if (sharedState.rootLayout != view) return;
    fibriChecker.gravEnabled = gravEnabled;
  }

  @ReactProp(name = "gyroEnabled")
  public void setGyroEnabled(View view, boolean gyroEnabled) {
    if (sharedState.rootLayout != view) return;
    fibriChecker.gyroEnabled = gyroEnabled;
  }

  @ReactProp(name = "movementDetectionEnabled")
  public void setMovementDetectionEnabled(View view, boolean movementDetectionEnabled) {
    if (sharedState.rootLayout != view) return;
    fibriChecker.movementDetectionEnabled = movementDetectionEnabled;
  }

  @ReactProp(name = "rotationEnabled")
  public void setRotationEnabled(View view, boolean rotationEnabled) {
    if (sharedState.rootLayout != view) return;
    fibriChecker.rotationEnabled = rotationEnabled;
  }

  @ReactProp(name = "waitForStartRecordingSignal")
  public void setWaitForStartRecordingSignal(View view, boolean waitForStartRecordingSignal) {
    if (sharedState.rootLayout != view) return;
    fibriChecker.waitForStartRecordingSignal = waitForStartRecordingSignal;
  }
  //endregion

  @Override
  protected void onAfterUpdateTransaction(@NonNull FrameLayout view) {

    super.onAfterUpdateTransaction(view);
    if (sharedState.rootLayout != view) return;
    // This will be called when all the props are set
    fibriChecker.initializeListeners();
  }

  //region Graphs
  private GraphView createGraphView(Context context) {

    graphView = new GraphView(context);
    invalidateGraphView(graphView, context);

    Log.i(TAG, "W X H: " + graphView.getWidth() + " x " + graphView.getHeight());
    return graphView;
  }

  private void invalidateGraphView(GraphView graphView, Context context) {
    FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);
    graphView.setBackgroundColor(Color.TRANSPARENT);
    params.gravity = Gravity.CENTER_HORIZONTAL;
    graphView.setLayoutParams(params);
    setViewPortOptions(graphView);
    setSeries(graphView, context);
  }

  private void setViewPortOptions(GraphView graphView) {

    graphView.getViewport().setScalable(false);
    graphView.getViewport().setScrollable(false);
    graphView.getViewport().setXAxisBoundsManual(true);
    graphView.getViewport().setYAxisBoundsManual(true);
    graphView.getViewport().setMinX(0);
    graphView.getViewport().setMaxX(SAMPLE_COUNT);
  }

  private void setSeries(GraphView graphView, Context context) {
    // fill array wih empty values
    DataPoint[] data = new DataPoint[SAMPLE_COUNT];
    for (int i = 0; i < SAMPLE_COUNT; i++) {
      data[i] = new DataPoint(0, 0);
    }

    series = new LineGraphSeries<>(data);
    series.setColor(Color.BLUE);
    series.setThickness(8);
    series.setBackgroundColor(Color.TRANSPARENT);
    series.setDrawBackground(true);

    DisplayMetrics displayMetrics = new DisplayMetrics();

    getActivity(context).getWindowManager().getDefaultDisplay().getMetrics(displayMetrics);

    int width = displayMetrics.widthPixels;
    boolean drawAsPath = width >= 1080;

    series.setDrawAsPath(drawAsPath);

    graphView.removeAllSeries();
    graphView.addSeries(series);
  }

  private void addGraphData(double value) {

    calculateYaxisBoundaries(value);
    series.appendData(new DataPoint(++xValue, value), true, SAMPLE_COUNT);
  }

  private void calculateYaxisBoundaries(double value) {

    addValueToSR(value);
    graphView.getViewport().setMaxY(Collections.max(valueSR) + 0.2);
    graphView.getViewport().setMinY(Collections.min(valueSR) - 0.2);
  }

  private void addValueToSR(double value) {

    valueSR.add(value);
    if (valueSR.size() > SAMPLE_COUNT) {
      valueSR.remove(0);
    }
  }
  //endregion

  @Override
  public @Nullable
  Map<String, Object> getExportedCustomDirectEventTypeConstants() {
    final Map<String, Object> returnMap = new HashMap<>();
    String[] events = {
      EVENT_SAMPLE_READY, EVENT_FINGER_DETECTED, EVENT_FINGER_REMOVED,
      EVENT_CALIBRATION_READY, EVENT_HEARTBEAT, EVENT_TIME_REMAINING,
      EVENT_MEASUREMENT_FINISHED, EVENT_MEASUREMENT_START,
      EVENT_FINGER_DETECTION_TIME_EXPIRED, EVENT_PULSE_DETECTED,
      EVENT_PULSE_DETECTION_TIME_EXPIRED, EVENT_MOVEMENT_DETECTED,
      EVENT_MEASUREMENT_PROCESSED, EVENT_MEASUREMENT_ERROR
    };
    for (String event : events) {
      final Map<String, String> registration = new HashMap<>();
      registration.put("registrationName", event);
      returnMap.put(event, registration);
    }

    return returnMap;
  }

  @Override
  public void onDropViewInstance(@NonNull FrameLayout view) {
    if (sharedState.rootLayout == view) {
      if (fibriChecker != null) fibriChecker.stop();
      sharedState.previewContainer = null;
      sharedState.rootLayout = null;
    }
    super.onDropViewInstance(view);
  }
}

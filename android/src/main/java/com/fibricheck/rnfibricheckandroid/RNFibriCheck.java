//  Created by react-native-create-bridge

package com.fibricheck.rnfibricheckandroid;

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
import android.widget.LinearLayout;
import com.facebook.infer.annotation.Assertions;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.google.gson.Gson;
import com.jjoe64.graphview.GraphView;
import com.jjoe64.graphview.series.DataPoint;
import com.jjoe64.graphview.series.LineGraphSeries;
import com.qompium.fibrichecker.FibriChecker;
import com.qompium.fibrichecker.listeners.FibriListener;
import com.qompium.fibrichecker.measurement.MeasurementData;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Map;
import org.json.JSONException;
import org.json.JSONObject;
import com.facebook.react.uimanager.events.RCTEventEmitter;


public class RNFibriCheck extends SimpleViewManager<LinearLayout> {
  public static final String REACT_CLASS = "FibriCheck";

  private static final String TAG = "RNFibriCheck";

  public static final int COMMAND_START_MEASUREMENT = 1;

  public static final int COMMAND_RESET_GRAPH = 2;

  public static final int COMMAND_START_RECORDING = 3;

  private static final int COMMAND_RESET_MODULE = 4;

  private static final int SAMPLE_COUNT = 120;

  public boolean drawGraphPoints = false;

  private LineGraphSeries<DataPoint> series;

  private ArrayList<Double> valueSR;

  private int xValue = 0;

  private GraphView graphView;

  private LinearLayout linearLayout;

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


  @Override
  public String getName() {

    // Tell React the name of the module
    // https://facebook.github.io/react-native/docs/native-components-android.html#1-create-the-viewmanager-subclass
    return REACT_CLASS;
  }

  @Override
  public LinearLayout createViewInstance(ThemedReactContext context) {

    Log.i(TAG, "Creating View instance");

    linearLayout = new LinearLayout(context);
    linearLayout.setLayoutParams(new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.MATCH_PARENT));
    linearLayout.setOrientation(LinearLayout.HORIZONTAL);

    valueSR = new ArrayList<>();
    graphView = createGraphView(context);
    linearLayout.addView(graphView);

    fibriChecker = new FibriChecker.FibriBuilder(context.getCurrentActivity(), linearLayout).build();
    fibriChecker.setFibriListener(new FibriListener() {

      @Override public void onSampleReady(final double ppg, double raw) {
        if (drawGraphPoints) {
          addGraphData(ppg);
        }
        WritableMap event = Arguments.createMap();
        event.putDouble("ppg", ppg);
        event.putDouble("raw", raw);
        ReactContext reactContext = (ReactContext) linearLayout.getContext();
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(linearLayout.getId(), EVENT_SAMPLE_READY, event);
      }

      @Override public void onFingerDetected() {
        WritableMap event = Arguments.createMap();
        ReactContext reactContext = (ReactContext) linearLayout.getContext();
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(linearLayout.getId(), EVENT_FINGER_DETECTED, event);
      }

      @Override public void onFingerRemoved(double y, double v, double stdDevY) {
        WritableMap event = Arguments.createMap();
        event.putDouble("y", y);
        event.putDouble("v", v);
        event.putDouble("stdDevY", stdDevY);
        ReactContext reactContext = (ReactContext) linearLayout.getContext();
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(linearLayout.getId(), EVENT_FINGER_REMOVED, event);
      }

      @Override public void onCalibrationReady() {
        WritableMap event = Arguments.createMap();
        ReactContext reactContext = (ReactContext) linearLayout.getContext();
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(linearLayout.getId(), EVENT_CALIBRATION_READY, event);
      }

      @Override public void onHeartBeat(int value) {
        WritableMap event = Arguments.createMap();
        event.putInt("heartRate", value);
        ReactContext reactContext = (ReactContext) linearLayout.getContext();
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(linearLayout.getId(), EVENT_HEARTBEAT, event);
      }

      @Override public void timeRemaining(int seconds) {
          WritableMap event = Arguments.createMap();
          event.putInt("seconds", seconds);
          ReactContext reactContext = (ReactContext) linearLayout.getContext();
          reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(linearLayout.getId(), EVENT_TIME_REMAINING, event);
      }

      @Override public void onMeasurementFinished() {
        WritableMap event = Arguments.createMap();
        ReactContext reactContext = (ReactContext) linearLayout.getContext();
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(linearLayout.getId(), EVENT_MEASUREMENT_FINISHED, event);
      }

      @Override public void onMeasurementStart(long timestamp) {
        WritableMap event = Arguments.createMap();
        event.putDouble("timestamp", (double)timestamp);
        ReactContext reactContext = (ReactContext) linearLayout.getContext();
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(linearLayout.getId(), EVENT_MEASUREMENT_START, event);
      }

      @Override public void onFingerDetectionTimeExpired() {
        WritableMap event = Arguments.createMap();
        ReactContext reactContext = (ReactContext) linearLayout.getContext();
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(linearLayout.getId(), EVENT_FINGER_DETECTION_TIME_EXPIRED, event);
      }

      @Override public void onPulseDetected() {
        WritableMap event = Arguments.createMap();
        ReactContext reactContext = (ReactContext) linearLayout.getContext();
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(linearLayout.getId(), EVENT_PULSE_DETECTED, event);
      }

      @Override public void onPulseDetectionTimeExpired() {
        WritableMap event = Arguments.createMap();
        ReactContext reactContext = (ReactContext) linearLayout.getContext();
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(linearLayout.getId(), EVENT_PULSE_DETECTION_TIME_EXPIRED, event);
      }

      @Override public void onMovementDetected() {
        WritableMap event = Arguments.createMap();
        ReactContext reactContext = (ReactContext) linearLayout.getContext();
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(linearLayout.getId(), EVENT_MOVEMENT_DETECTED, event);
      }

      @Override public void onMeasurementProcessed(MeasurementData measurementData) {

        Log.i(TAG, "Measurement processed with Heartbeat: " + measurementData.heartrate);
        WritableMap event = Arguments.createMap();
        ReactContext reactContext = (ReactContext) linearLayout.getContext();
        try {
          Gson gson = new Gson();
          JSONObject jsonObject = new JSONObject(gson.toJson(measurementData));
          String measurementJson = jsonObject.toString();
          event.putString("measurement", measurementJson);
          reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(linearLayout.getId(), EVENT_MEASUREMENT_PROCESSED, event);
        } catch (JSONException | NullPointerException ex) {
          Log.e(TAG, ex.toString());
        }
      }

       @Override public void onMeasurementError(String message) {
          WritableMap event = Arguments.createMap();
          event.putString("message", message);
          ReactContext reactContext = (ReactContext) linearLayout.getContext();
          reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(linearLayout.getId(), EVENT_MEASUREMENT_ERROR, event);
      }
    });

    fibriChecker.start();

    return linearLayout;
  }

  @Override public Map<String, Integer> getCommandsMap() {

    return MapBuilder.of(
        "startMeasurement", COMMAND_START_MEASUREMENT,
        "resetGraph", COMMAND_RESET_GRAPH,
        "startRecording", COMMAND_START_RECORDING,
        "resetModule", COMMAND_RESET_MODULE);
  }

  @Override
  public @Nullable
  Map getExportedCustomDirectEventTypeConstants() {

    return MapBuilder.of(
        "onHeartBeat",
        MapBuilder.of("registrationName", "onHeartBeat"),
        "onPPG",
        MapBuilder.of("registrationName", "onPPG")
    );
  }

  @Override
  public void receiveCommand(LinearLayout view, int commandType, @Nullable ReadableArray args) {

    Assertions.assertNotNull(view);
    Assertions.assertNotNull(args);
    Log.i(TAG, "Received command: " + commandType);
    switch (commandType) {
      case COMMAND_START_MEASUREMENT: {
        Log.i(TAG, "Command Received: start measurement");
        fibriChecker.start();
        break;
      }
      case COMMAND_START_RECORDING: {
        Log.e(TAG, "Command Received: start recording");
        fibriChecker.startRecording();
        break;
      }
      case COMMAND_RESET_MODULE: {
        Log.e(TAG, "Command Received: reset Module");
        fibriChecker.stop();
        break;
      }

      default:
        throw new IllegalArgumentException(
            String.format("Unsupported command %d received by %s.", commandType,
                getClass().getSimpleName()));
    }
  }

  //region Props Setters

  // Set properties from React onto your native component via a setter method
  // https://facebook.github.io/react-native/docs/native-components-android.html#3-expose-view-property-setters-using-reactprop-or-reactpropgroup-annotation
  @ReactProp(name = "drawGraph")
  public void setDrawGraph(View view, boolean drawGraph) {
    drawGraphPoints = drawGraph;
  }

  @ReactProp(name = "drawBackground")
  public void setDrawBackground(View view, boolean drawBackground) {
    series.setDrawBackground(drawBackground);
  }

  @ReactProp(name = "lineColor")
  public void setLineColor(View view, String lineColor) {
     series.setColor(Color.parseColor(lineColor));
  }

  @ReactProp(name = "lineThickness")
  public void setLineThickness(View view, int lineThickness) {
     series.setThickness(lineThickness);
  }

  @ReactProp(name = "graphBackgroundColor")
  public void setGraphBackgroundColor(View view, String graphBackgroundColor) {
     series.setBackgroundColor(Color.parseColor(graphBackgroundColor));
  }

  @ReactProp(name = "sampleTime")
  public void setSampleTime(View view, int sampleTime) {
    fibriChecker.sampleTime = sampleTime;
    Log.i(TAG, "Sampletime set to: " + sampleTime);
  }

  @ReactProp(name = "accEnabled")
  public void setAccEnabled(View view, boolean accEnabled) {
    fibriChecker.accEnabled = accEnabled;
  }

  @ReactProp(name = "fingerDetectionExpiryTime")
  public void setFingerDetectionExpiryTime(View view, int fingerDetectionExpiryTime) {
    fibriChecker.fingerDetectionExpiryTime = fingerDetectionExpiryTime;
  }

  @ReactProp(name = "flashEnabled")
  public void setFlashEnabled(View view, boolean flashEnabled) {
    fibriChecker.flashEnabled = flashEnabled;
  }

  @ReactProp(name = "gravEnabled")
  public void setGravEnabled(View view, boolean gravEnabled) {
    fibriChecker.gravEnabled = gravEnabled;
  }

  @ReactProp(name = "gyroEnabled")
  public void setGyroEnabled(View view, boolean gyroEnabled) {
    fibriChecker.gyroEnabled = gyroEnabled;
  }

  @ReactProp(name = "movementDetectionEnabled")
  public void setMovementDetectionEnabled(View view, boolean movementDetectionEnabled) {
    fibriChecker.movementDetectionEnabled = movementDetectionEnabled;
  }

  @ReactProp(name = "rotationEnabled")
  public void setRotationEnabled(View view, boolean rotationEnabled) {
    fibriChecker.rotationEnabled = rotationEnabled;
  }

  @ReactProp(name = "waitForStartRecordingSignal")
  public void setWaitForStartRecordingSignal(View view, boolean waitForStartRecordingSignal) {
    fibriChecker.waitForStartRecordingSignal = waitForStartRecordingSignal;
  }
  //endregion

  @Override
  protected void onAfterUpdateTransaction(@NonNull LinearLayout view) {

    super.onAfterUpdateTransaction(view);
    // This will be called when all the props are set
    fibriChecker.initializeListeners();
  }

  //region Graphs
  private GraphView createGraphView(Context context) {

    graphView = new GraphView(context);
    invalidateGraphView(graphView, context);

    Log.e(TAG, "W X H: " + graphView.getWidth() + " x " + graphView.getHeight());
    return graphView;
  }

  private void invalidateGraphView(GraphView graphView, Context context) {

    LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);
    graphView.setBackgroundColor(Color.TRANSPARENT);
    params.gravity = Gravity.CENTER_HORIZONTAL;
    graphView.setLayoutParams(params);
    setViewPortOptions(graphView);
    setRenderOptions(graphView);
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

  private void setRenderOptions(GraphView graphView) {

  }

  private void setSeries(GraphView graphView, Context context) {
    
    ArrayList<DataPoint> dataPoints = new ArrayList<>();

    // fill array wih empty values
    DataPoint[] data = new DataPoint[SAMPLE_COUNT];
    for (int i = 0; i < SAMPLE_COUNT; i++) {
      data[i] = new DataPoint(0, 0);
    }

    this.series = new LineGraphSeries(data);

    series = new LineGraphSeries<>(dataPoints.toArray(new DataPoint[dataPoints.size()]));
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
  public Map getExportedCustomBubblingEventTypeConstants() {
      return MapBuilder.builder()
          .put(EVENT_SAMPLE_READY, MapBuilder.of("phasedRegistrationNames", MapBuilder.of("bubbled", EVENT_SAMPLE_READY)))
          .put(EVENT_FINGER_DETECTED, MapBuilder.of("phasedRegistrationNames", MapBuilder.of("bubbled", EVENT_FINGER_DETECTED)))
          .put(EVENT_FINGER_REMOVED, MapBuilder.of("phasedRegistrationNames", MapBuilder.of("bubbled", EVENT_FINGER_REMOVED)))
          .put(EVENT_CALIBRATION_READY, MapBuilder.of("phasedRegistrationNames", MapBuilder.of("bubbled", EVENT_CALIBRATION_READY)))
          .put(EVENT_TIME_REMAINING, MapBuilder.of("phasedRegistrationNames", MapBuilder.of("bubbled", EVENT_TIME_REMAINING)))
          .put(EVENT_MEASUREMENT_FINISHED, MapBuilder.of("phasedRegistrationNames", MapBuilder.of("bubbled", EVENT_MEASUREMENT_FINISHED)))
          .put(EVENT_MEASUREMENT_START, MapBuilder.of("phasedRegistrationNames", MapBuilder.of("bubbled", EVENT_MEASUREMENT_START)))
          .put(EVENT_FINGER_DETECTION_TIME_EXPIRED, MapBuilder.of("phasedRegistrationNames", MapBuilder.of("bubbled", EVENT_FINGER_DETECTION_TIME_EXPIRED)))
          .put(EVENT_PULSE_DETECTED, MapBuilder.of("phasedRegistrationNames", MapBuilder.of("bubbled", EVENT_PULSE_DETECTED)))
          .put(EVENT_PULSE_DETECTION_TIME_EXPIRED, MapBuilder.of("phasedRegistrationNames", MapBuilder.of("bubbled", EVENT_PULSE_DETECTION_TIME_EXPIRED)))
          .put(EVENT_MOVEMENT_DETECTED, MapBuilder.of("phasedRegistrationNames", MapBuilder.of("bubbled", EVENT_MOVEMENT_DETECTED)))
          .put(EVENT_MEASUREMENT_PROCESSED, MapBuilder.of("phasedRegistrationNames", MapBuilder.of("bubbled", EVENT_MEASUREMENT_PROCESSED)))
          .build();
  }
}

//  Created by react-native-create-bridge

package com.fibricheckreactnativesdk.fibribridge;

import android.content.Context;
import android.graphics.Color;
import android.os.Handler;
import android.os.Looper;
import android.support.annotation.Nullable;
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
import com.facebook.react.modules.core.RCTNativeAppEventEmitter;
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

public class FibriBridgeManager extends SimpleViewManager<LinearLayout> {
  public static final String REACT_CLASS = "FibriBridge";

  private static final String TAG = "FibriBridgeManager";

  public static final int COMMAND_START_MEASUREMENT = 1;

  public static final int COMMAND_RESET_GRAPH = 2;

  public static final int COMMAND_START_RECORDING = 3;

  private static final int SAMPLE_COUNT = 120;

  private LineGraphSeries<DataPoint> series;

  private ArrayList<Double> valueSR;

  private LinearLayout linearLayout;

  private int xValue = 0;

  private GraphView graphView;

  private FibriChecker fibriChecker;

  @Override
  public String getName() {
    // Tell React the name of the module
    // https://facebook.github.io/react-native/docs/native-components-android.html#1-create-the-viewmanager-subclass
    return REACT_CLASS;
  }

  @Override
  public LinearLayout createViewInstance(ThemedReactContext context) {
    // Create a view here
    // https://facebook.github.io/react-native/docs/native-components-android.html#2-implement-method-createviewinstance
    Log.i(TAG, "Creating View instance");

    linearLayout = new LinearLayout(context);
    linearLayout.setLayoutParams(new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.MATCH_PARENT));
    linearLayout.setOrientation(LinearLayout.HORIZONTAL);

    valueSR = new ArrayList<>();
    graphView = createGraphView(context);
    linearLayout.addView(graphView);

    fibriChecker = new FibriChecker.FibriBuilder(context.getCurrentActivity(), linearLayout).build();

    final ReactContext reactContext = (ReactContext) linearLayout.getContext();
    final Handler handler = new Handler(Looper.getMainLooper());
    fibriChecker.setFibriListener(new FibriListener() {

      @Override public void onSampleReady(final double ppg, double raw) {

        handler.post(new Runnable() {
          @Override
          public void run() {
            addGraphData(ppg);
          }
        });
      }

      @Override public void onFingerDetected() {

        reactContext.getJSModule(RCTNativeAppEventEmitter.class)
            .emit("fingerDetected", null);
      }

      @Override public void onFingerRemoved() {

        reactContext.getJSModule(RCTNativeAppEventEmitter.class)
            .emit("fingerRemoved", null);
      }

      @Override public void onCalibrationReady() {

        reactContext.getJSModule(RCTNativeAppEventEmitter.class)
            .emit("calibrationReady", null);
      }

      @Override public void onHeartBeat(int value) {

        WritableMap event = Arguments.createMap();
        event.putInt("heartRate", value);
        //reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(fv.getId(), "onHeartBeat", event);
        reactContext.getJSModule(RCTNativeAppEventEmitter.class)
            .emit("heartBeat", event);
      }

      @Override public void timeRemaining(int seconds) {

        //Log.e(TAG, "Time Remaining");
        WritableMap event = Arguments.createMap();
        event.putInt("seconds", seconds);
        reactContext.getJSModule(RCTNativeAppEventEmitter.class)
            .emit("timeRemaining", event);
      }

      @Override public void onMeasurementFinished() {

        Log.i(TAG, "Measurement Finished");
        reactContext.getJSModule(RCTNativeAppEventEmitter.class)
            .emit("measurementFinished", null);
      }

      @Override public void onMeasurementStart() {

        Log.i(TAG, "Measurement started");
        reactContext.getJSModule(RCTNativeAppEventEmitter.class)
            .emit("measurementStart", null);
      }

      @Override public void onFingerDetectionTimeExpired() {

        Log.i(TAG, "Finger Detection Time Expired");
        reactContext.getJSModule(RCTNativeAppEventEmitter.class)
            .emit("fingerDetectionTimeExpired", null);
      }

      @Override public void onPulseDetected() {

        Log.i(TAG, "Pulse detected");
        reactContext.getJSModule(RCTNativeAppEventEmitter.class)
            .emit("pulseDetected", null);
      }

      @Override public void onPulseDetectionTimeExpired() {

        Log.i(TAG, "Pulse Detection Time Expired");
        reactContext.getJSModule(RCTNativeAppEventEmitter.class)
            .emit("pulseDetectionTimeExpired", null);
      }

      @Override public void onMovementDetected() {

        Log.i(TAG, "Movement Detected");
        reactContext.getJSModule(RCTNativeAppEventEmitter.class)
            .emit("movementDetected", null);
      }

      @Override public void onMeasurementProcessed(MeasurementData measurementData) {

        Log.i(TAG, "Measurement processed with Heartbeat: " + measurementData.heartrate);
        WritableMap event = Arguments.createMap();

        try {
          Gson gson = new Gson();
          JSONObject jsonObject = new JSONObject(gson.toJson(measurementData));
          String measurementJson = jsonObject.toString();
          event.putString("measurement", measurementJson);
          reactContext.getJSModule(RCTNativeAppEventEmitter.class)
              .emit("measurementProcessed", event);
        } catch (JSONException | NullPointerException ex) {
          Log.e(TAG, ex.toString());
        }
      }
    });

    fibriChecker.start();

    return linearLayout;
  }

  @Override public Map<String, Integer> getCommandsMap() {

    return MapBuilder.of(
        "startMeasurement", COMMAND_START_MEASUREMENT,
        "resetGraph", COMMAND_RESET_GRAPH,
        "startRecording", COMMAND_START_RECORDING);
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

      default:
        throw new IllegalArgumentException(
            String.format("Unsupported command %d received by %s.", commandType,
                getClass().getSimpleName()));
    }
  }

  // Set properties from React onto your native component via a setter method
  // https://facebook.github.io/react-native/docs/native-components-android.html#3-expose-view-property-setters-using-reactprop-or-reactpropgroup-annotation
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

  @ReactProp(name = "lowerMovementLimit")
  public void setLowerMovementLimit(View view, int lowerMovementLimit) {
    fibriChecker.lowerMovementLimit = lowerMovementLimit;
  }

  @ReactProp(name = "upperMovementLimit")
  public void setUpperMovementLimit(View view, int upperMovementLimit) {
    fibriChecker.upperMovementLimit = upperMovementLimit;
  }

  @ReactProp(name = "maxStdDevYValue")
  public void setMaxStdDevYValue(View view, int maxStdDevYValue) {
    fibriChecker.maxStdDevYValue = maxStdDevYValue;
  }

  @ReactProp(name = "maxYValue")
  public void setMaxYValue(View view, int maxYValue) {
    fibriChecker.maxYValue = maxYValue;
  }

  @ReactProp(name = "minYValue")
  public void setMinYValue(View view, int minYValue) {
    fibriChecker.minYValue = minYValue;
  }

  @ReactProp(name = "minVValue")
  public void setMinVValue(View view, int minVValue) {
    fibriChecker.minVValue = minVValue;
  }

  @ReactProp(name = "movementDetectionEnabled")
  public void setMovementDetectionEnabled(View view, boolean movementDetectionEnabled) {
    fibriChecker.movementDetectionEnabled = movementDetectionEnabled;
  }

  @ReactProp(name = "rotationEnabled")
  public void setRotationEnabled(View view, boolean rotationEnabled) {
    fibriChecker.rotationEnabled = rotationEnabled;
  }

  @ReactProp(name = "quadrantCols")
  public void setQuadrantCols(View view, int quadrantCols) {
    fibriChecker.quadrantCols = quadrantCols;
  }

  @ReactProp(name = "quadrantRows")
  public void setQuadrantRows(View view, int quadrantRows) {
    fibriChecker.quadrantRows = quadrantRows;
  }

  @ReactProp(name = "waitForStartRecordingSignal")
  public void setWaitForStartRecordingSignal(View view, boolean waitForStartRecordingSignal) {
    fibriChecker.waitForStartRecordingSignal = waitForStartRecordingSignal;
  }

  private GraphView createGraphView(Context context) {

    graphView = new GraphView(context);
    invalidateGraphView(graphView, context);

    Log.e(TAG, "W X H: " + graphView.getWidth() + " x " + graphView.getHeight());
    return graphView;
  }

  private void invalidateGraphView(GraphView graphView, Context context) {

    LinearLayout.LayoutParams params =
        new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);
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
    //series.setColor(Color.BLACK);
    series.setThickness(8);
    series.setColor(Color.WHITE);
    series.setBackgroundColor(Color.parseColor("#1e8d95"));
    series.setDrawBackground(true);

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
}

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
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.uimanager.events.RCTEventEmitter;
import com.google.gson.Gson;
import com.jjoe64.graphview.GraphView;
import com.jjoe64.graphview.series.DataPoint;
import com.jjoe64.graphview.series.LineGraphSeries;
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
    private static final int COMMAND_START_MEASUREMENT_INT = 1;
    private static final int COMMAND_START_RECORDING_INT = 2;
    private static final int COMMAND_RESET_MODULE_INT = 3;

    private static final int SAMPLE_COUNT = 120;

    private final FibriCheckerCoordinator coordinator;
    private final FibriCheckerConfig config = new FibriCheckerConfig();

    // Per-view state — valid between createViewInstance and onDropViewInstance.
    private FrameLayout rootLayout;
    private LineGraphSeries<DataPoint> series;
    private ArrayList<Double> valueSR;
    private int xValue = 0;
    private GraphView graphView;
    public boolean drawGraphPoints = false;

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

    public RNFibriCheck(FibriCheckerCoordinator coordinator) {
        this.coordinator = coordinator;
    }

    public Activity getActivity(Context context) {
        if (context == null) return null;
        if (context instanceof Activity) return (Activity) context;
        if (context instanceof ContextWrapper) return getActivity(((ContextWrapper) context).getBaseContext());
        return null;
    }

    @NonNull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    private void sendEvent(String eventName, @Nullable WritableMap params) {
        if (rootLayout == null) return;
        ReactContext reactContext = (ReactContext) rootLayout.getContext();
        int reactTag = rootLayout.getId();
        reactContext
            // TODO: RCTEventEmitter is deprecated but info about a replacement is scarce
            .getJSModule(RCTEventEmitter.class)
            .receiveEvent(reactTag, eventName, params);
    }

    @NonNull
    @Override
    public FrameLayout createViewInstance(@NonNull ThemedReactContext context) {
        Log.i(TAG, "Creating View instance");

        rootLayout = new FrameLayout(context);
        rootLayout.setLayoutParams(new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        rootLayout.setKeepScreenOn(true);

        valueSR = new ArrayList<>();

        // previewContainer is added at index 0 so the graph view renders on top of it.
        // The coordinator reparents it to RNCameraPreviewView when that component is mounted.
        FrameLayout previewContainer = new FrameLayout(context);
        rootLayout.addView(previewContainer, new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));

        graphView = createGraphView(context);
        rootLayout.addView(graphView);

        coordinator.setFibriListener(createFibriListener());
        coordinator.onMainViewCreated(context.getCurrentActivity(), rootLayout, previewContainer);

        return rootLayout;
    }

    private FibriListener createFibriListener() {
        return new FibriListener() {
            @Override public void onSampleReady(final double ppg, double raw) {
                if (drawGraphPoints) addGraphData(ppg);
                WritableMap event = Arguments.createMap();
                event.putDouble("ppg", ppg);
                event.putDouble("raw", raw);
                sendEvent(EVENT_SAMPLE_READY, event);
            }

            @Override public void onFingerDetected() {
                sendEvent(EVENT_FINGER_DETECTED, Arguments.createMap());
            }

            @Override public void onFingerRemoved(double y, double v, double stdDevY) {
                WritableMap event = Arguments.createMap();
                event.putDouble("y", y);
                event.putDouble("v", v);
                event.putDouble("stdDevY", stdDevY);
                sendEvent(EVENT_FINGER_REMOVED, event);
            }

            @Override public void onCalibrationReady() {
                sendEvent(EVENT_CALIBRATION_READY, Arguments.createMap());
            }

            @Override public void onHeartBeat(int value) {
                WritableMap event = Arguments.createMap();
                event.putInt("heartRate", value);
                sendEvent(EVENT_HEARTBEAT, event);
            }

            @Override public void onTimeRemaining(int seconds) {
                WritableMap event = Arguments.createMap();
                event.putInt("seconds", seconds);
                sendEvent(EVENT_TIME_REMAINING, event);
            }

            @Override public void onMeasurementFinished(long timestamp) {
                sendEvent(EVENT_MEASUREMENT_FINISHED, Arguments.createMap());
            }

            @Override public void onMeasurementStart(long timestamp) {
                sendEvent(EVENT_MEASUREMENT_START, Arguments.createMap());
            }

            @Override public void onFingerDetectionTimeExpired() {
                sendEvent(EVENT_FINGER_DETECTION_TIME_EXPIRED, Arguments.createMap());
            }

            @Override public void onPulseDetected() {
                sendEvent(EVENT_PULSE_DETECTED, Arguments.createMap());
            }

            @Override public void onPulseDetectionTimeExpired() {
                sendEvent(EVENT_PULSE_DETECTION_TIME_EXPIRED, Arguments.createMap());
            }

            @Override public void onMovementDetected() {
                sendEvent(EVENT_MOVEMENT_DETECTED, Arguments.createMap());
            }

            @Override public void onMeasurementProcessed(MeasurementData measurementData) {
                Log.i(TAG, "Measurement processed with Heartbeat: " + measurementData.heartrate);
                WritableMap event = Arguments.createMap();
                try {
                    Gson gson = new Gson();
                    JSONObject jsonObject = new JSONObject(gson.toJson(measurementData));
                    event.putString("measurement", jsonObject.toString());
                    sendEvent(EVENT_MEASUREMENT_PROCESSED, event);
                } catch (JSONException | NullPointerException ex) {
                    Log.e(TAG, ex.toString());
                }
            }

            @Override public void onMeasurementError(String message) {
                WritableMap event = Arguments.createMap();
                event.putString("message", message);
                sendEvent(EVENT_MEASUREMENT_ERROR, event);
            }
        };
    }

    @Override
    public Map<String, Integer> getCommandsMap() {
        final Map<String, Integer> map = new HashMap<>();
        map.put(COMMAND_START_MEASUREMENT_STRING, COMMAND_START_MEASUREMENT_INT);
        map.put(COMMAND_START_RECORDING_STRING, COMMAND_START_RECORDING_INT);
        map.put(COMMAND_RESET_MODULE_STRING, COMMAND_RESET_MODULE_INT);
        return map;
    }

    @Override
    public void receiveCommand(@NonNull FrameLayout view, @NonNull String commandId, @Nullable ReadableArray args) {
        Assertions.assertNotNull(args);
        Log.i(TAG, "Received command: " + commandId);
        switch (commandId) {
            case COMMAND_START_MEASUREMENT_STRING:
                coordinator.start();
                break;
            case COMMAND_START_RECORDING_STRING:
                coordinator.startRecording();
                break;
            case COMMAND_RESET_MODULE_STRING:
                coordinator.stop();
                break;
            default:
                throw new IllegalArgumentException(
                    String.format("Unsupported command %s received by %s.", commandId, getClass().getSimpleName()));
        }
    }

    //region Props

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
        config.sampleTime = sampleTime;
        Log.i(TAG, "Sampletime set to: " + sampleTime);
    }

    @ReactProp(name = "accEnabled")
    public void setAccEnabled(View view, boolean accEnabled) {
        config.accEnabled = accEnabled;
    }

    @ReactProp(name = "fingerDetectionExpiryTime")
    public void setFingerDetectionExpiryTime(View view, int fingerDetectionExpiryTime) {
        config.fingerDetectionExpiryTime = fingerDetectionExpiryTime;
    }

    @ReactProp(name = "pulseDetectionExpiryTime")
    public void setPulseDetectionExpiryTime(View view, int pulseDetectionExpiryTime) {
        config.pulseDetectionExpiryTime = pulseDetectionExpiryTime;
    }

    @ReactProp(name = "flashEnabled")
    public void setFlashEnabled(View view, boolean flashEnabled) {
        config.flashEnabled = flashEnabled;
    }

    @ReactProp(name = "gravEnabled")
    public void setGravEnabled(View view, boolean gravEnabled) {
        config.gravEnabled = gravEnabled;
    }

    @ReactProp(name = "gyroEnabled")
    public void setGyroEnabled(View view, boolean gyroEnabled) {
        config.gyroEnabled = gyroEnabled;
    }

    @ReactProp(name = "movementDetectionEnabled")
    public void setMovementDetectionEnabled(View view, boolean movementDetectionEnabled) {
        config.movementDetectionEnabled = movementDetectionEnabled;
    }

    @ReactProp(name = "rotationEnabled")
    public void setRotationEnabled(View view, boolean rotationEnabled) {
        config.rotationEnabled = rotationEnabled;
    }

    @ReactProp(name = "waitForStartRecordingSignal")
    public void setWaitForStartRecordingSignal(View view, boolean waitForStartRecordingSignal) {
        config.waitForStartRecordingSignal = waitForStartRecordingSignal;
    }

    //endregion

    @Override
    protected void onAfterUpdateTransaction(@NonNull FrameLayout view) {
        super.onAfterUpdateTransaction(view);
        coordinator.applyConfig(config);
    }

    @Override
    public void onDropViewInstance(@NonNull FrameLayout view) {
        // Null rootLayout first: sendEvent() checks it, so any in-flight SDK callbacks
        // become no-ops before we stop the FibriChecker and the background thread winds down.
        rootLayout = null;
        coordinator.onMainViewDropped();
    }

    //region Graph

    private GraphView createGraphView(Context context) {
        graphView = new GraphView(context);
        invalidateGraphView(graphView, context);
        Log.i(TAG, "W X H: " + graphView.getWidth() + " x " + graphView.getHeight());
        return graphView;
    }

    private void invalidateGraphView(GraphView graphView, Context context) {
        FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);
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
        series.setDrawAsPath(displayMetrics.widthPixels >= 1080);

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
        if (valueSR.size() > SAMPLE_COUNT) valueSR.remove(0);
    }

    //endregion

    static private Map<String, Object> getBubbledMap(String event) {
        final Map<String, Object> returnMap = new HashMap<>();
        final Map<String, String> bubbleMap = new HashMap<>();
        bubbleMap.put("bubbled", event);
        returnMap.put("phasedRegistrationNames", bubbleMap);
        return returnMap;
    }

    @Override
    public @Nullable Map<String, Object> getExportedCustomDirectEventTypeConstants() {
        final Map<String, Object> returnMap = new HashMap<>();
        final Map<String, String> heartBeatMap = new HashMap<>();
        final Map<String, String> ppgMap = new HashMap<>();
        heartBeatMap.put("registrationName", "onHeartBeat");
        ppgMap.put("registrationName", "onPPG");
        returnMap.put("onHeartBeat", heartBeatMap);
        returnMap.put("onPPG", ppgMap);
        return returnMap;
    }

    @Override
    public Map<String, Object> getExportedCustomBubblingEventTypeConstants() {
        final Map<String, Object> returnMap = new HashMap<>();
        returnMap.put(EVENT_SAMPLE_READY, getBubbledMap(EVENT_SAMPLE_READY));
        returnMap.put(EVENT_FINGER_DETECTED, getBubbledMap(EVENT_FINGER_DETECTED));
        returnMap.put(EVENT_FINGER_REMOVED, getBubbledMap(EVENT_FINGER_REMOVED));
        returnMap.put(EVENT_CALIBRATION_READY, getBubbledMap(EVENT_CALIBRATION_READY));
        returnMap.put(EVENT_TIME_REMAINING, getBubbledMap(EVENT_TIME_REMAINING));
        returnMap.put(EVENT_MEASUREMENT_FINISHED, getBubbledMap(EVENT_MEASUREMENT_FINISHED));
        returnMap.put(EVENT_MEASUREMENT_START, getBubbledMap(EVENT_MEASUREMENT_START));
        returnMap.put(EVENT_FINGER_DETECTION_TIME_EXPIRED, getBubbledMap(EVENT_FINGER_DETECTION_TIME_EXPIRED));
        returnMap.put(EVENT_PULSE_DETECTED, getBubbledMap(EVENT_PULSE_DETECTED));
        returnMap.put(EVENT_PULSE_DETECTION_TIME_EXPIRED, getBubbledMap(EVENT_PULSE_DETECTION_TIME_EXPIRED));
        returnMap.put(EVENT_MOVEMENT_DETECTED, getBubbledMap(EVENT_MOVEMENT_DETECTED));
        returnMap.put(EVENT_MEASUREMENT_PROCESSED, getBubbledMap(EVENT_MEASUREMENT_PROCESSED));
        return returnMap;
    }
}

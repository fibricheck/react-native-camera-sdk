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
import com.facebook.react.bridge.UIManager;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.UIManagerHelper;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.uimanager.events.Event;
import com.facebook.react.uimanager.events.RCTEventEmitter;
import com.google.gson.Gson;
import com.jjoe64.graphview.GraphView;
import com.jjoe64.graphview.series.DataPoint;
import com.jjoe64.graphview.series.LineGraphSeries;
import com.qompium.fibricheck.camerasdk.FibriChecker;
import com.qompium.fibricheck.camerasdk.listeners.FibriListener;
import com.qompium.fibricheck.camerasdk.measurement.MeasurementData;
import com.qompium.fibricheck.camerasdk.measurement.Vec3f;
import com.qompium.fibricheck.camerasdk.models.CameraSettingMode;
import com.qompium.fibricheck.camerasdk.models.CameraSettingsInput;
import com.qompium.fibricheck.camerasdk.models.WhiteBalanceMode;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;


public class RNFibriCheck extends SimpleViewManager<FrameLayout> {
	public static final String REACT_CLASS = "FibriCheck";
	private static final String TAG = "RNFibriCheck";

	private static final String COMMAND_START_MEASUREMENT_STRING = "startMeasurement";
	private static final String COMMAND_START_RECORDING_STRING = "startRecording";
	private static final String COMMAND_RESET_MODULE_STRING = "resetModule";
	private static final int COMMAND_START_MEASUREMENT_INT = 1;
	private static final int COMMAND_START_RECORDING_INT = 2;
	private static final int COMMAND_RESET_MODULE_INT = 3;

	private static boolean isInit = false;

	private static final int SAMPLE_COUNT = 120;
	public static boolean drawGraphPoints = false;
	private static final LineGraphSeries<DataPoint> series = new LineGraphSeries<>();
	private static final ArrayList<Double> valueSR = new ArrayList<>();
	private static int xValue = 0;
	private static boolean previewEnabled = false;

	private static GraphView graphView;
	private static FrameLayout rootView;
	private static FrameLayout previewView;
	private static FibriChecker fibriChecker;
	private static CameraSettingsInput cameraSettings;

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
	private static final String EVENT_RAW_DATA = "onRawData";

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

	private void sendEvent(String eventName,
	                       @Nullable WritableMap params) {
		ReactContext reactContext = (ReactContext) rootView.getContext();
		int reactTag = rootView.getId();

		Log.d(TAG, "Send event " + eventName);
		int surfaceId = UIManagerHelper.getSurfaceId(rootView);


		UIManagerHelper.getEventDispatcherForReactTag(reactContext, reactTag).dispatchEvent(new Event(surfaceId, reactTag) {
			@Override
			public String getEventName() {
				return eventName;
			}

			@Override
			protected WritableMap getEventData() {
				return params;
			}
		});
	}

	private void initIfNeeded(@NonNull ThemedReactContext context) {
		if (isInit) {
			return;
		}

		rootView = new FrameLayout(context);
		rootView.setLayoutParams(new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));

		previewView = new FrameLayout(context);
		previewView.setLayoutParams(new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));

		graphView = createGraphView(context);
		graphView.setBackgroundColor(Color.WHITE);
		rootView.addView(previewView);
		rootView.addView(graphView);
		cameraSettings = new CameraSettingsInput();

		fibriChecker = new FibriChecker.FibriBuilder(context.getCurrentActivity(), previewView)
			.rawDataListener((imageBytes, cameraData) -> {
				WritableMap metaData = Arguments.createMap();
				for (String key : cameraData.keySet()) {
					metaData.putString(key, cameraData.get(key));
				}

				WritableMap map = Arguments.createMap();
				map.putString("image", "");
				map.putMap("cameraData", metaData);

				sendEvent(EVENT_RAW_DATA, map);
			})
			.build();
		fibriChecker.setCameraSettings(cameraSettings);
		fibriChecker.setFibriListener(new FibriListener() {
			@Override
			public void onSampleReady(final double ppg, double raw) {
				if (drawGraphPoints) {
					addGraphData(ppg);
				}
				WritableMap event = Arguments.createMap();
				event.putDouble("ppg", ppg);
				event.putDouble("raw", raw);
				sendEvent(EVENT_SAMPLE_READY, event);
			}

			@Override
			public void onFingerDetected() {
				WritableMap event = Arguments.createMap();
				sendEvent(EVENT_FINGER_DETECTED, event);
			}

			@Override
			public void onFingerRemoved(double y, double v, double stdDevY) {
				WritableMap event = Arguments.createMap();
				event.putDouble("y", y);
				event.putDouble("v", v);
				event.putDouble("stdDevY", stdDevY);
				sendEvent(EVENT_FINGER_REMOVED, event);
			}

			@Override
			public void onCalibrationReady() {
				WritableMap event = Arguments.createMap();
				sendEvent(EVENT_CALIBRATION_READY, event);
			}

			@Override
			public void onHeartBeat(int value) {
				WritableMap event = Arguments.createMap();
				event.putInt("heartRate", value);
				sendEvent(EVENT_HEARTBEAT, event);
			}

			@Override
			public void onTimeRemaining(int seconds) {
				WritableMap event = Arguments.createMap();
				event.putInt("seconds", seconds);
				sendEvent(EVENT_TIME_REMAINING, event);
			}

			@Override
			public void onMeasurementFinished(long timestamp) {
				WritableMap event = Arguments.createMap();
				sendEvent(EVENT_MEASUREMENT_FINISHED, event);
			}

			@Override
			public void onMeasurementStart(long timestamp) {
				WritableMap event = Arguments.createMap();
				sendEvent(EVENT_MEASUREMENT_START, event);
			}

			@Override
			public void onFingerDetectionTimeExpired() {
				WritableMap event = Arguments.createMap();
				sendEvent(EVENT_FINGER_DETECTION_TIME_EXPIRED, event);
			}

			@Override
			public void onPulseDetected() {
				WritableMap event = Arguments.createMap();
				sendEvent(EVENT_PULSE_DETECTED, event);
			}

			@Override
			public void onPulseDetectionTimeExpired() {
				WritableMap event = Arguments.createMap();
				sendEvent(EVENT_PULSE_DETECTION_TIME_EXPIRED, event);
			}

			@Override
			public void onMovementDetected() {
				WritableMap event = Arguments.createMap();
				sendEvent(EVENT_MOVEMENT_DETECTED, event);
			}

			@Override
			public void onMeasurementProcessed(MeasurementData measurementData) {
				Log.i(TAG, "Measurement processed with Heartbeat: " + measurementData.heartrate);
				WritableMap event = Arguments.createMap();
				try {
					Gson gson = new Gson();
					// JSONObject jsonObject = new JSONObject(gson.toJson(measurementData));
					String measurementJson = gson.toJson(measurementData);
					event.putString("measurement", measurementJson);
					sendEvent(EVENT_MEASUREMENT_PROCESSED, event);
				} catch (NullPointerException ex) {
					Log.e(TAG, ex.toString());
				}
			}

			@Override
			public void onMeasurementError(String message) {
				WritableMap event = Arguments.createMap();
				event.putString("message", message);
				sendEvent(EVENT_MEASUREMENT_ERROR, event);
			}
		});

		fibriChecker.initializeListeners();
		start();

		isInit = true;
	}

	@NonNull
	@Override
	public FrameLayout createViewInstance(@NonNull ThemedReactContext context) {
		Log.i(TAG, "Creating View instance");

		initIfNeeded(context);
		start();

		return rootView;
	}

	private void destroy() {
		Log.d(TAG, "Destroy");
		if (fibriChecker != null) {
			fibriChecker.destroy();

			fibriChecker = null;
		}

		if (rootView != null) {
			rootView.removeAllViews();
			rootView = null;
		}

		if (previewView != null) {
			previewView.removeAllViews();
			previewView = null;
		}

		if (graphView != null) {
			graphView.removeAllSeries();
			graphView = null;
		}

		valueSR.clear();
		cameraSettings = null;

		xValue = 0;
	}

	@Override
	public Map<String, Integer> getCommandsMap() {
		final Map<String, Integer> returnMap = new HashMap<>();
		returnMap.put(COMMAND_START_MEASUREMENT_STRING, COMMAND_START_MEASUREMENT_INT);
		returnMap.put(COMMAND_START_RECORDING_STRING, COMMAND_START_RECORDING_INT);
		returnMap.put(COMMAND_RESET_MODULE_STRING, COMMAND_RESET_MODULE_INT);
		return returnMap;
	}

	@Override
	public void receiveCommand(@NonNull FrameLayout view, @NonNull String commandId, @Nullable ReadableArray args) {
		Assertions.assertNotNull(args);

		Log.i(TAG, "Received command: " + commandId);
		switch (commandId) {
			case COMMAND_START_MEASUREMENT_STRING: {
				Log.i(TAG, "Command Received: start measurement");
				previewEnabled = false;
				start();
				break;
			}
			case COMMAND_START_RECORDING_STRING: {
				Log.i(TAG, "Command Received: start recording");
				fibriChecker.startRecording();
				break;
			}
			case COMMAND_RESET_MODULE_STRING: {
				Log.i(TAG, "Command Received: reset Module");
				fibriChecker.stop();
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
		drawGraphPoints = drawGraph;
	}

	@ReactProp(name = "drawBackground")
	public void setDrawBackground(View view, boolean drawBackground) {
		series.setDrawBackground(drawBackground);
	}

	@ReactProp(name = "preview")
	public void setPreview(View view, boolean preview) {
		previewEnabled = preview;
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

	@ReactProp(name = "pulseDetectionExpiryTime")
	public void setPulseDetectionExpiryTime(View view, int pulseDetectionExpiryTime) {
		fibriChecker.pulseDetectionExpiryTime = pulseDetectionExpiryTime;
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

	@ReactProp(name = "cameraSettings")
	public void setCameraSettings(View view, ReadableMap map) {
		if (map == null) {
			return;
		}

		if (map.hasKey("exposureMode")) {
			CameraSettingMode exposureMode = toCameraSettingMode(map.getString("exposureMode"), CameraSettingMode.Locked);
			cameraSettings.setExposureMode(exposureMode);
		}

		if (map.hasKey("iso")) {
			cameraSettings.setManualIsoValue(map.getInt("iso"));
		}

		if (map.hasKey("exposureTime")) {
			cameraSettings.setManualExposureTime((long) map.getInt("exposureTime"));
		}

		if (map.hasKey("logExposure")) {
			cameraSettings.setLogExposure(map.getBoolean("logExposure"));
		}

		if (map.hasKey("focusMode")) {
			CameraSettingMode focusMode = toCameraSettingMode(map.getString("focusMode"), CameraSettingMode.Auto);
			cameraSettings.setFocusMode(focusMode);
		}

		if (map.hasKey("focus")) {
			cameraSettings.setManualFocusValue((float) map.getDouble("focus"));
		}

		if (map.hasKey("logFocus")) {
			cameraSettings.setLogFocus(map.getBoolean("logFocus"));
		}

		if (map.hasKey("whiteBalanceMode")) {
			WhiteBalanceMode whiteBalanceMode = toWhiteBalanceMode(map.getString("whiteBalanceMode"), WhiteBalanceMode.Auto);
			cameraSettings.setWhiteBalanceMode(whiteBalanceMode);
		}

		if (map.hasKey("whiteBalanceRgb")) {
			ReadableArray whiteBalanceRgb = map.getArray("whiteBalanceRgb");
			float r, g, b;
			r = (float) whiteBalanceRgb.getDouble(0);
			g = (float) whiteBalanceRgb.getDouble(1);
			b = (float) whiteBalanceRgb.getDouble(2);

			cameraSettings.setManualWhiteBalanceRgb(new Vec3f(r, g, b));
		}

		if (map.hasKey("whiteBalanceKelvin")) {
			cameraSettings.setManualWhiteBalanceKelvin(map.getInt("whiteBalanceKelvin"));
		}

		if (map.hasKey("logWhiteBalance")) {
			cameraSettings.setLogWhiteBalance(map.getBoolean("logWhiteBalance"));
		}
	}
	//endregion

	@Override
	protected void onAfterUpdateTransaction(@NonNull FrameLayout view) {
		super.onAfterUpdateTransaction(view);
		start();
	}

	private void start() {
		// This will be called when all the props are set
		fibriChecker.setCameraSettings(cameraSettings);

		boolean previewJustEnabled = previewEnabled && !fibriChecker.getPreviewEnabled();
		if (previewJustEnabled) {
			fibriChecker.preview();
			graphView.setVisibility(View.GONE);
			return;
		}

		Log.d(TAG, "FibriChecker Started");
		graphView.setVisibility(View.VISIBLE);
		fibriChecker.start();
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

		series.resetData(data);
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

	static private Map<String, Object> getBubbledMap(String event) {
		final Map<String, Object> returnMap = new HashMap<>();
		final Map<String, String> bubbleMap = new HashMap<>();
		bubbleMap.put("bubbled", event);
		returnMap.put("phasedRegistrationNames", bubbleMap);
		return returnMap;
	}

	@Override
	public @Nullable
	Map<String, Object> getExportedCustomDirectEventTypeConstants() {
		final Map<String, Object> returnMap = new HashMap<>();
		final Map<String, String> heartBeatMap = new HashMap<>();
		final Map<String, String> ppgMap = new HashMap<>();

		heartBeatMap.put("registrationName", EVENT_HEARTBEAT);
		returnMap.put(EVENT_HEARTBEAT, heartBeatMap);

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
		returnMap.put(EVENT_MEASUREMENT_ERROR, getBubbledMap(EVENT_MEASUREMENT_ERROR));
		returnMap.put(EVENT_RAW_DATA, getBubbledMap(EVENT_RAW_DATA));

		return returnMap;
	}

	@Override
	public void onDropViewInstance(@NonNull FrameLayout view) {
		fibriChecker.stop();
	}

	public static CameraSettingMode toCameraSettingMode(String mode, CameraSettingMode defaultValue) {
		if (mode == null) {
			return defaultValue;
		}

		switch (mode) {
			case "auto":
				return CameraSettingMode.Auto;
			case "locked":
				return CameraSettingMode.Locked;
			case "manual":
				return CameraSettingMode.Manual;
		}

		Log.e(TAG, "Invalid camera setting mode " + mode);
		return defaultValue;
	}

	public static WhiteBalanceMode toWhiteBalanceMode(String mode, WhiteBalanceMode defaultValue) {
		if (mode == null) {
			return defaultValue;
		}

		switch (mode) {
			case "auto":
				return WhiteBalanceMode.Auto;
			case "locked":
				return WhiteBalanceMode.Locked;
			case "manual-rgb":
				return WhiteBalanceMode.ManualRgb;
			case "manual-kelvin":
				return WhiteBalanceMode.ManualKelvin;
		}

		Log.e(TAG, "Invalid white balance mode " + mode);
		return defaultValue;
	}
}

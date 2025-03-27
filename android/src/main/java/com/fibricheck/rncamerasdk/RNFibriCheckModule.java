//  Created by react-native-create-bridge

package com.fibricheck.rncamerasdk;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import java.util.HashMap;
import java.util.Map;
import android.content.Context;
import android.hardware.camera2.CameraCharacteristics;
import android.hardware.camera2.CameraManager;
import android.util.Range;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.fibricheck.rncamerasdk.extensions.CameraSettingsInfoKt;
import com.qompium.fibricheck.camerasdk.models.CameraSettingsInfo;

public class RNFibriCheckModule extends ReactContextBaseJavaModule {
  public static final String REACT_CLASS = "FibriCheck";
  private static ReactApplicationContext reactContext = null;

  public RNFibriCheckModule(ReactApplicationContext context) {
    // Pass in the context to the constructor and save it so you can emit events
    // https://facebook.github.io/react-native/docs/native-modules-android.html#the-toast-module
    super(context);

    reactContext = context;
  }

  @Override
  public String getName() {
    // Tell React the name of the module
    // https://facebook.github.io/react-native/docs/native-modules-android.html#the-toast-module
    return REACT_CLASS;
  }

  @Override
  public Map<String, Object> getConstants() {
    // Export any constants to be used in your native module
    // https://facebook.github.io/react-native/docs/native-modules-android.html#the-toast-module
    final Map<String, Object> constants = new HashMap<>();
    constants.put("EXAMPLE_CONSTANT", "example");

    return constants;
  }

  @ReactMethod
  public void exampleMethod() {
    // An example native method that you will expose to React
    // https://facebook.github.io/react-native/docs/native-modules-android.html#the-toast-module
  }

  public static void emitDeviceEvent(String eventName, @Nullable WritableMap eventData) {
    // A method for emitting from the native side to JS
    // https://facebook.github.io/react-native/docs/native-modules-android.html#sending-events-to-javascript
    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
        .emit(eventName, eventData);
  }

  public void sendEvent(ReactContext reactContext,
      String eventName,
      @Nullable WritableMap params) {
    reactContext
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
        .emit(eventName, params);
  }

  @ReactMethod
  public void getCameraInfo(Promise promise) {
    try {
      CameraManager manager = (CameraManager) reactContext.getSystemService(Context.CAMERA_SERVICE);
      CameraCharacteristics cameraCharacteristics = manager.getCameraCharacteristics(manager.getCameraIdList()[0]);
      CameraSettingsInfo info = CameraSettingsInfo.Companion.from(cameraCharacteristics);
      WritableMap event = CameraSettingsInfoKt.toWritableMap(info);
      promise.resolve(event);
    }
    catch (Exception e) {
      promise.reject(e);
    }
  }
}

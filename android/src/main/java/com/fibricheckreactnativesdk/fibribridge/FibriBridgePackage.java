//  Created by react-native-create-bridge

package com.fibricheckreactnativesdk.fibribridge;

import androidx.annotation.NonNull;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class FibriBridgePackage implements ReactPackage {
  @Override
  public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
    // Register your native module
    // https://facebook.github.io/react-native/docs/native-modules-android.html#register-the-module
    List<NativeModule> modules = new ArrayList<>();

    modules.add(new FibriBridgeModule(reactContext));

    return modules;

  }

  @Override
  public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
       return Arrays.asList(
           new FibriBridgeManager()
       );
  }
}

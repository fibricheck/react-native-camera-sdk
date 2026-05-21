package com.fibricheck.rncamerasdk;

import androidx.annotation.NonNull;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class RNFibriCheckPackage implements ReactPackage {
    @Override
    public List<NativeModule> createNativeModules(@NonNull ReactApplicationContext reactContext) {
        return Collections.singletonList(new RNFibriCheckModule(reactContext));
    }

    @Override
    public List<ViewManager> createViewManagers(@NonNull ReactApplicationContext reactContext) {
        FibriCheckerCoordinator coordinator = new FibriCheckerCoordinator(reactContext);
        return Arrays.asList(
            new RNFibriCheck(coordinator),
            new RNCameraPreviewView(coordinator)
        );
    }
}

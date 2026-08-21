package com.fibricheck.rncamerasdk;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.events.Event;

/**
 * Generic event used to dispatch all of RNFibriCheck's measurement events to JS via
 * UIManagerHelper.getEventDispatcherForReactTag(...).dispatchEvent(...) - the modern,
 * architecture-agnostic replacement for the deprecated
 * reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(...) call, which only worked under
 * Fabric because of RN's InteropEventEmitter compatibility shim.
 */
class FibriCheckEvent extends Event<FibriCheckEvent> {
  private final String eventName;
  private final @Nullable WritableMap data;

  FibriCheckEvent(int surfaceId, int viewTag, String eventName, @Nullable WritableMap data) {
    super(surfaceId, viewTag);
    this.eventName = eventName;
    this.data = data;
  }

  @NonNull
  @Override
  public String getEventName() {
    return eventName;
  }

  @Override
  public boolean canCoalesce() {
    return false;
  }

  @Nullable
  @Override
  protected WritableMap getEventData() {
    return data;
  }
}

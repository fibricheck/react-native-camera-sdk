package com.qompium.fibrichecker.listeners;

public interface OnBeatEventListener {

  void onFingerDetected ();

  void onFingerRemoved ();

  void onHeartBeat (int value);

  void onPulseDetected ();
}

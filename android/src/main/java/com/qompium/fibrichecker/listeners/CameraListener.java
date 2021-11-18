package com.qompium.fibrichecker.listeners;

import com.qompium.fibrichecker.measurement.Quadrant;

public interface CameraListener {

  void onFrameReceived (final Quadrant quadrantData, final double[] yuvData, final long timestamp);

  void onCameraDestroyed ();
}

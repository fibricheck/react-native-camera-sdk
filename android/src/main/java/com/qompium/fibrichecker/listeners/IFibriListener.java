package com.qompium.fibrichecker.listeners;

import com.qompium.fibrichecker.measurement.MeasurementData;

public interface IFibriListener {

  void onFingerDetected ();

  void onFingerRemoved (double y, double v, double stdDevY);

  void onHeartBeat (int value);

  void onPulseDetectionTimeExpired ();

  void onPulseDetected ();

  void onFingerDetectionTimeExpired ();

  void onMeasurementFinished (long timestamp);

  void timeRemaining (int seconds);

  void onMeasurementProcessed (MeasurementData measurementData);

  void onMeasurementError (String message);

  void onMeasurementStart (long timestamp);

  void onMovementDetected ();

  void onSampleReady (double ppg, double raw);

  void onCalibrationReady ();
}

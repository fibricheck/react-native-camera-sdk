package com.qompium.fibrichecker.listeners;

import com.qompium.fibrichecker.measurement.MeasurementData;

public interface IFibriListener {

  void onFingerDetected ();

  void onFingerRemoved ();

  void onHeartBeat (int value);

  void onPulseDetectionTimeExpired ();

  void onPulseDetected ();

  void onFingerDetectionTimeExpired ();

  void onMeasurementFinished ();

  void timeRemaining (int seconds);

  void onMeasurementProcessed (MeasurementData measurementData);

  void onMeasurementStart ();

  void onMovementDetected ();

  void onSampleReady (double ppg, double raw);

  void onCalibrationReady ();
}

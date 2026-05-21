package com.fibricheck.rncamerasdk;

import com.qompium.fibricheck.camerasdk.FibriChecker;

class FibriCheckerConfig {
    Integer sampleTime;
    Boolean accEnabled;
    Integer fingerDetectionExpiryTime;
    Integer pulseDetectionExpiryTime;
    Boolean flashEnabled;
    Boolean gravEnabled;
    Boolean gyroEnabled;
    Boolean movementDetectionEnabled;
    Boolean rotationEnabled;
    Boolean waitForStartRecordingSignal;

    void applyTo(FibriChecker fibriChecker) {
        if (sampleTime != null) fibriChecker.sampleTime = sampleTime;
        if (accEnabled != null) fibriChecker.accEnabled = accEnabled;
        if (fingerDetectionExpiryTime != null) fibriChecker.fingerDetectionExpiryTime = fingerDetectionExpiryTime;
        if (pulseDetectionExpiryTime != null) fibriChecker.pulseDetectionExpiryTime = pulseDetectionExpiryTime;
        if (flashEnabled != null) fibriChecker.flashEnabled = flashEnabled;
        if (gravEnabled != null) fibriChecker.gravEnabled = gravEnabled;
        if (gyroEnabled != null) fibriChecker.gyroEnabled = gyroEnabled;
        if (movementDetectionEnabled != null) fibriChecker.movementDetectionEnabled = movementDetectionEnabled;
        if (rotationEnabled != null) fibriChecker.rotationEnabled = rotationEnabled;
        if (waitForStartRecordingSignal != null) fibriChecker.waitForStartRecordingSignal = waitForStartRecordingSignal;
    }
}

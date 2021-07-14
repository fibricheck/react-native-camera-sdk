'use strict';

import { NativeModules } from 'react-native';
import EventManager from './EventManager';
import {
    HEARTBEAT,
    SAMPLE_READY,
    FINGER_DETECTED,
    PULSE_DETECTED,
    CALIBRATION_READY,
    MEASUREMENT_START,
    MEASUREMENT_FINISHED,
    MEASUREMENT_PROCESSED,
    FINGER_REMOVED,
    TIME_REMAINING,
    MOVEMENT_DETECTED,
    PULSE_DETECTION_TIME_EXPIRED,
    FINGER_DETECTION_TIME_EXPIRED
} from './events';
import { isValidCallback, isObjectNonNull } from './helpers';

const RNFibriCheck = NativeModules.FibriCheck;
const eventManager = new EventManager(RNFibriCheck);

export default class Fibricheck {


    static startMeasurement() {
        if (!isObjectNonNull(RNFibriCheck)) return;
        RNFibriCheck.startMeasurement();
    }

    /* O B S E R V E R S */

    static addHeartbeatObserver(observer) {
        if (!isObjectNonNull(RNFibricheck)) return;
        isValidCallback(observer);
        RNFibriCheck.addHeartbeatObserver();
        eventManager.addEventHandler(HEARTBEAT, observer);
    }

    static addSampleReadyObserver(observer) {
        if (!isObjectNonNull(RNFibricheck)) return;
        isValidCallback(observer);
        RNFibriCheck.addSampleReadyObserver();
        eventManager.addEventHandler(SAMPLE_READY, observer);
    }

    static addFingerDetectedObserver(observer) {
        if (!isObjectNonNull(RNFibricheck)) return;
        isValidCallback(observer);
        RNFibriCheck.addFingerDetectedObserver();
        eventManager.addEventHandler(FINGER_DETECTED, observer);
    }

    static addPulseDetectedObserver(observer) {
        if (!isObjectNonNull(RNFibricheck)) return;
        isValidCallback(observer);
        RNFibriCheck.addPulseDetectedObserver();
        eventManager.addEventHandler(PULSE_DETECTED, observer);
    }

    static addCalibrationReadyObserver(observer) {
        if (!isObjectNonNull(RNFibricheck)) return;
        isValidCallback(observer);
        RNFibriCheck.addCalibrationReadyObserver();
        eventManager.addEventHandler(CALIBRATION_READY, observer);
    }

    static addMeasurementStartObserver(observer) {
        if (!isObjectNonNull(RNFibricheck)) return;
        isValidCallback(observer);
        RNFibriCheck.addMeasurementStartObserver();
        eventManager.addEventHandler(MEASUREMENT_START, observer);
    }

    static addMeasurementFinishedObserver(observer) {
        if (!isObjectNonNull(RNFibricheck)) return;
        isValidCallback(observer);
        RNFibriCheck.addMeasurementFinishedObserver();
        eventManager.addEventHandler(MEASUREMENT_FINISHED, observer);
    }

    static addMeasurementProcessedObserver(observer) {
        if (!isObjectNonNull(RNFibricheck)) return;
        isValidCallback(observer);
        RNFibriCheck.addMeasurementProcessedObserver();
        eventManager.addEventHandler(MEASUREMENT_PROCESSED, observer);
    }

    static addFingerRemovedObserver(observer) {
        if (!isObjectNonNull(RNFibricheck)) return;
        isValidCallback(observer);
        RNFibriCheck.addFingerRemovedObserver();
        eventManager.addEventHandler(FINGER_REMOVED, observer);
    }

    static addTimeRemainingObserver(observer) {
        if (!isObjectNonNull(RNFibricheck)) return;
        isValidCallback(observer);
        RNFibriCheck.addTimeRemainingObserver();
        eventManager.addEventHandler(TIME_REMAINING, observer);
    }

    /* H A N D L E R S */

    static setSampleReceivedHandler(handler){
        if (!isObjectNonNull(RNFibriCheck)) return;
        isValidCallback(handler);

        RNFibriCheck.setSampleReceivedHandler();
        eventManager.setEventHandler(SAMPLE_READY, handler);
    }

    static setHeartBeatReceivedHandler(handler){
        if (!isObjectNonNull(RNFibriCheck)) return;
        isValidCallback(handler);

        RNFibriCheck.setHeartBeatReceivedHandler();
        eventManager.setEventHandler(HEARTBEAT, handler);
    }

    static setMeasurementStartHandler(handler){
        if (!isObjectNonNull(RNFibriCheck)) return;
        isValidCallback(handler);

        RNFibriCheck.setMeasurementStartHandler();
        eventManager.setEventHandler(MEASUREMENT_START, handler);
    }

    static setFingerDetectedHandler(handler){
        if (!isObjectNonNull(RNFibriCheck)) return;
        isValidCallback(handler);

        RNFibriCheck.setFingerDetectedHandler();
        eventManager.setEventHandler(FINGER_DETECTED, handler);
    }

    static setFingerRemovedHandler(handler){
        if (!isObjectNonNull(RNFibriCheck)) return;
        isValidCallback(handler);

        RNFibriCheck.setFingerRemovedHandler();
        eventManager.setEventHandler(FINGER_REMOVED, handler);
    }

    static setPulseDetectedHandler(handler){
        if (!isObjectNonNull(RNFibriCheck)) return;
        isValidCallback(handler);

        RNFibriCheck.setPulseDetectedHandler();
        eventManager.setEventHandler(PULSE_DETECTED, handler);
    }

    static setMeasurementFinishedHandler(handler){
        if (!isObjectNonNull(RNFibriCheck)) return;
        isValidCallback(handler);

        RNFibriCheck.setMeasurementFinishedHandler();
        eventManager.setEventHandler(MEASUREMENT_FINISHED, handler);
    }

    static setMeasurementProcessedHandler(handler){
        if (!isObjectNonNull(RNFibriCheck)) return;
        isValidCallback(handler);

        RNFibriCheck.setMeasurementProcessedHandler();
        eventManager.setEventHandler(MEASUREMENT_PROCESSED, handler);
    }

    static setCalibrationReadyHandler(handler){
        if (!isObjectNonNull(RNFibriCheck)) return;
        isValidCallback(handler);

        RNFibriCheck.setCalibrationReadyHandler();
        eventManager.setEventHandler(CALIBRATION_READY, handler);
    }

    static setMovementDetectedHandler(handler){
        if (!isObjectNonNull(RNFibriCheck)) return;
        isValidCallback(handler);

        RNFibriCheck.setMovementDetectedHandler();
        eventManager.setEventHandler(MOVEMENT_DETECTED, handler);
    }

    static setPulseDetectionTimeExpiredHandler(handler){
        if (!isObjectNonNull(RNFibriCheck)) return;
        isValidCallback(handler);

        RNFibriCheck.setPulseDetectionTimeExpiredHandler();
        eventManager.setEventHandler(PULSE_DETECTION_TIME_EXPIRED, handler);
    }

    static setFingerDetectionTimeExpiredHandler(handler){
        if (!isObjectNonNull(RNFibriCheck)) return;
        isValidCallback(handler);

        RNFibriCheck.setFingerDetectionTimeExpiredHandler();
        eventManager.setEventHandler(FINGER_DETECTION_TIME_EXPIRED, handler);
    }

    static setTimeRemainingHandler(handler){
        if (!isObjectNonNull(RNFibriCheck)) return;
        isValidCallback(handler);

        RNFibriCheck.setTimeRemainingHandler();
        eventManager.setEventHandler(TIME_REMAINING, handler);
    }
}

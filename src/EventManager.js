import { NativeEventEmitter } from 'react-native';
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

const eventList = [
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
]

export default class EventManager {
    constructor(RNFibricheck) {
        this.RNFibricheck = RNFibricheck;
        this.fibricheckEventEmitter = new NativeEventEmitter(RNFibricheck);
        this.eventHandlerMap = new Map();       // used for setters (single replacable callback)
        this.eventHandlerArrayMap = new Map();  // used for adders (multiple callbacks possible)
        this.listeners = [];
        this.setupListeners();
    }

    setupListeners() {
        // set up the event emitter and listeners
        if (this.RNFibricheck != null) {

            for(let i = 0; i < eventList.length; i++) {
                let eventName = eventList[i];
                this.listeners[eventName] = this.generateEventListener(eventName);
            }
        }
    }

    // clear handlers
    clearHandlers() {
        this.eventHandlerMap = new Map();
        this.eventHandlerArrayMap = new Map();
    }

    /**
     * Sets the event handler on the JS side of the bridge
     * Supports only one handler at a time
     * @param  {string} eventName
     * @param  {function} handler
     */
    setEventHandler(eventName, handler) {
        this.eventHandlerMap.set(eventName, handler);
    }

    /**
     * Adds the event handler to the corresponding handler array on the JS side of the bridge
     * @param  {string} eventName
     * @param  {function} handler
     */
    addEventHandler(eventName, handler) {
        let handlerArray = this.eventHandlerArrayMap.get(eventName);
        handlerArray && handlerArray.length > 0 ? handlerArray.push(handler) : this.eventHandlerArrayMap.set(eventName, [handler]);
    }

    // returns an event listener with the js to native mapping
    generateEventListener(eventName) {
        const addListenerCallback = (payload) => {
            // used for setters
            let handler = this.eventHandlerMap.get(eventName);
            payload = this.getFinalPayload(eventName, payload);

            // Check if we have added listener for this type yet
            if (handler) {
                handler(payload);
            }
        };

        return this.fibricheckEventEmitter.addListener(eventName, addListenerCallback);
    }

    getFinalPayload(eventName, payload) {
        return payload
    }
}

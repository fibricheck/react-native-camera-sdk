declare module 'react-native-fibricheck' {

    /* O B S E R V E R  C H A N G E  E V E N T S */
    export interface ChangeEvent<T> {
        from : T;
        to   : T;
    }

    export interface sampleEvent {
        ppg : number;
        raw : number;
    }

    export interface heartbeatEvent {
        heartBeat : number;
    }

    export interface timeEvent {
        timeRemaining : number;
    }

    export interface measurementEvent {
        data : any;
    }

    /* F I B R I C H E C K  I N T E R F A C E */
    export interface FibriCheck {
        /**
         * Completes FibriCheck initialization
         * @returns void
         */
        startMeasurement(): void;

        /**
         * Set the callback to run on measurement received.
         * @param  {(measurementEvent:measurementEvent)=>void} handler
         * @returns void
         */
        setSampleReceivedHandler(handler: (sampleEvent: sampleEvent) => void): void;

        /**
         * Set the callback to run on heartbeat received.
         * @param  {(heartBeatEvent:heartbeatEvent)=>void} handler
         * @returns void
         */
        setHeartBeatReceivedHandler(handler: (heartbeatEvent: heartBeatEvent) => void): void;

        /**
         * Set the callback to run when a measurement starts
         * @returns void
         */
        setMeasurementStartHandler(handler: () => void): void;

        /**
         * Set the callback to run when a finger is detected
         * @returns void
         */
        setFingerDetectedHandler(handler: () => void): void;

        /**
         * Set the callback to run when a finger is removed
         * @returns void
         */
        setFingerRemovedHandler(handler: () => void): void;

        /**
         * Set the callback to run when a pulse is detected
         * @returns void
         */
        setPulseDetectedHandler(handler: () => void): void;

        /**
         * Set the callback to run when a measurement is finished
         * @returns void
         */
        setMeasurementFinishedHandler(handler: () => void): void;

        /**
         * Set the callback to run on measurement processed received.
         * @param  {(measurementEvent:measurementEvent)=>void} handler
         * @returns void
         */
        setMeasurementProcessedHandler(handler: (measurementEvent: measurementEvent) => void): void;

        /**
         * Set the callback to run when the calibration is ready
         * @returns void
         */
        setCalibrationReadyHandler(handler: () => void): void;

        /**
         * Set the callback to run when movement is detected
         * @returns void
         */
        setMovementDetectedHandler(handler: () => void): void;

        /**
         * Set the callback to run when Pulse detection time is expired
         * @returns void
         */
        setPulseDetectionTimeExpiredHandler(handler: () => void): void;

        /**
         * Set the callback to run when Finger detection time is expired
         * @returns void
         */
        setFingerDetectionTimeExpiredHandler(handler: () => void): void;

        /**
         * Set the callback to run time changes
         * @returns void
         */
        setTimeRemainingHandler(handler: (timeEvent: timeEvent) => void): void;
    }
    const FibriCheck: FibriCheck;
    export default FibriCheck;
}

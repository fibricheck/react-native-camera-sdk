import * as React from 'react';
import PropTypes from 'prop-types';
import { requireNativeComponent, View} from 'react-native'

export default class FibriCheckView extends React.Component {

    constructor(props) {
        super(props);
    }

    render () {
        return (
            <FibriCheck {...this.props}/>
        );
    }
}

FibriCheckView.propTypes = {
    ...View.propTypes,
    style: PropTypes.any,
    sampleTime: PropTypes.number,
    flashEnabled: PropTypes.bool,
    gravEnabled: PropTypes.bool,
    gyroEnabled: PropTypes.bool,
    accEnabled: PropTypes.bool,
    rotationEnabled: PropTypes.bool,
    movementDetectionEnabled: PropTypes.bool,
    fingerDetectionExpiryTime: PropTypes.number,
    waitForStartRecordingSignal: PropTypes.number,
    onSampleReady: PropTypes.func,
    onFingerDetected: PropTypes.func,
    onFingerRemoved: PropTypes.func,
    onCalibrationReady: PropTypes.func,
    onHeartBeat: PropTypes.func,
    onTimeRemaining: PropTypes.func,
    onMeasurementFinished: PropTypes.func,
    onMeasurementStart: PropTypes.func,
    onFingerDetectionTimeExpired: PropTypes.func,
    onPulseDetected: PropTypes.func,
    onPulseDetectionTimeExpired: PropTypes.func,
    onMovementDetected: PropTypes.func,
    onMeasurementProcessed: PropTypes.func,
};

const FibriCheck = requireNativeComponent('FibriCheck', FibriCheckView);

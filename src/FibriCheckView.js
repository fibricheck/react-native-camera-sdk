import * as React from 'react';
import PropTypes from 'prop-types';
import { NativeModules } from 'react-native';
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
    flashEnabled: PropTypes.func,
    gyroEnabled: PropTypes.func,
    accEnabled: PropTypes.func,
    gravEnabled: PropTypes.func,
    rotationEnabled: PropTypes.func,
    movementDetectionEnabled: PropTypes.func,
    quadrantRows: PropTypes.number,
    quadrantCols: PropTypes.number,
    pulseDetectionExpiryTime: PropTypes.number,
    upperMovementLimit: PropTypes.number,
    lowerMovementLimit: PropTypes.number,
    fingerDetectionExpiryTime: PropTypes.number,
    minYValue: PropTypes.number,
    maxYValue: PropTypes.number,
    minVValue: PropTypes.number,
    maxStdDevYValue: PropTypes.number,
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

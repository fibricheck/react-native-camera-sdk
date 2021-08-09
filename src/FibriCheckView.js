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

FibriCheckView.defaultProps = {
    drawGraph: true,
    lineColor: '#0073ff',
    lineThickness: 8,
    drawBackground: true,
    sampleTime: 60,
    flashEnabled: true,
    gravEnabled: false,
    gyroEnabled: false,
    accEnabled: false,
    rotationEnabled: false,
    movementDetectionEnabled: true,
    fingerDetectionExpiryTime: 10,
    waitForStartRecordingSignal: false,
};

FibriCheckView.propTypes = {
    ...View.propTypes,
    style: PropTypes.any,
    drawGraph: PropTypes.bool,
    lineColor: PropTypes.string,
    lineThickness: PropTypes.number,
    graphBackgroundColor: PropTypes.string,
    drawBackground: PropTypes.bool,
    sampleTime: PropTypes.number,
    flashEnabled: PropTypes.bool,
    gravEnabled: PropTypes.bool,
    gyroEnabled: PropTypes.bool,
    accEnabled: PropTypes.bool,
    rotationEnabled: PropTypes.bool,
    movementDetectionEnabled: PropTypes.bool,
    fingerDetectionExpiryTime: PropTypes.number,
    waitForStartRecordingSignal: PropTypes.bool,
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

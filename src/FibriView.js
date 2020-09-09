import * as React from 'react';
import { requireNativeComponent} from 'react-native'
import PropTypes from 'prop-types';
import {
    StyleSheet,
    Platform,
    NativeModules,
    NativeEventEmitter,
} from 'react-native';

const fibEmitter = NativeModules.FibriEventEmitter;
const fibModule = NativeModules.FibriBridge;

// Use the managerEmitter to register a device listener
export const managerEmitter =
    Platform.OS === 'ios'
        ? new NativeEventEmitter(fibEmitter)
        : new NativeEventEmitter(fibModule);

export default class FibriView extends React.Component {
    constructor(props) {
        super(props);
    }

    render () {
        return (
            <FibriBridge style={styles.container} ref="fibriBridge" {...this.props}/>
        );
    }
}

FibriBridgeView.propTypes = {
    reference: PropTypes.any,
    style: PropTypes.any,
    sampleTime: PropTypes.number,
    flashEnabled : PropTypes.bool,
    gyroEnabled: PropTypes.bool,
    accEnabled: PropTypes.bool,
    gravEnabled: PropTypes.bool,
    rotationEnabled: PropTypes.bool,
    movementDetectionEnabled: PropTypes.bool,
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
};

const FibriBridge = requireNativeComponent(
    'FibriBridge',
    FibriView,
    {
        nativeOnly: {
            testID: true,
            accessibilityComponentType: true,
            renderToHardwareTextureAndroid: true,
            accessibilityLabel: true,
            accessibilityLiveRegion: true,
            importantForAccessibility: true,
            onLayout: true,
            nativeID: true
        },
    },
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        flexDirection: 'column',
    },
});

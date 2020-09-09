import * as React from 'react';
import {
    StyleSheet,
    Platform,
    NativeModules,
    NativeEventEmitter,
} from 'react-native';
import FibriView from './FibriBridgeNativeView';
import PropTypes from 'prop-types';

const fibEmitter = NativeModules.FibriEventEmitter;
const fibModule = NativeModules.FibriBridge;

// Use the managerEmitter to register a device listener
export const managerEmitter =
    Platform.OS === 'ios'
        ? new NativeEventEmitter(fibEmitter)
        : new NativeEventEmitter(fibModule);

export default class App extends React.Component {
    fibriRef;
    FibriEmitter =
        Platform.OS === 'ios'
            ? new NativeEventEmitter(fibEmitter)
            : new NativeEventEmitter(fibModule);

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <FibriView
                reference={e => {
                    this.fibriRef = e;
                }}
                style={styles.container}
                {...this.props}
            />
        );
    }
}

App.propTypes = {
    reference: PropTypes.any,
    style: PropTypes.any,
    sampleTime: PropTypes.number,
    flashEnabled : PropTypes.boolean,
    gyroEnabled: PropTypes.boolean,
    accEnabled: PropTypes.boolean,
    gravEnabled: PropTypes.boolean,
    rotationEnabled: PropTypes.boolean,
    movementDetectionEnabled: PropTypes.boolean,
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        flexDirection: 'column',
    },
});

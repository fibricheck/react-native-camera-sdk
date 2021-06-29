import * as React from 'react';
import { requireNativeComponent} from 'react-native'
import {
    Platform,
    NativeModules,
    NativeEventEmitter,
} from 'react-native';

type Props = {
    style: any;
    sampleTime?: number;
    flashEnabled?: boolean;
    gyroEnabled?: boolean;
    accEnabled?: boolean;
    gravEnabled?: boolean;
    rotationEnabled?: boolean;
    movementDetectionEnabled?: boolean;
    quadrantRows?: number;
    quadrantCols?: number;
    pulseDetectionExpiryTime?: number;
    upperMovementLimit?: number;
    lowerMovementLimit?: number;
    fingerDetectionExpiryTime?: number;
    minYValue?: number;
    maxYValue?: number;
    minVValue?: number;
    maxStdDevYValue?: number;
};

const fibEmitter = NativeModules.FibriEventEmitter;
const fibModule = NativeModules.FibriBridge;

// Use the managerEmitter to register a device listener
export const managerEmitter =
    Platform.OS === 'ios'
        ? new NativeEventEmitter(fibEmitter)
        : new NativeEventEmitter(fibModule);

export default class FibriView extends React.Component<Props> {
    static propTypes: {};
    constructor(props) {
        super(props);
    }

    render () {
        return (
            <FibriBridge ref="fibriBridge" {...this.props}/>
        );
    }
}

FibriView.propTypes = {};

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

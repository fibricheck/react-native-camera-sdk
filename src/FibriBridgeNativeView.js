import * as React from 'react';
import { requireNativeComponent } from 'react-native'
import PropTypes from 'prop-types';


export default class FibriBridgeView extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.reference(this.refs['fibriBridge']);
    }

    render () {
        return (
            <FibriBridge ref="fibriBridge" {...this.props}/>
        );
    }
}

FibriBridgeView.propTypes = {
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

const FibriBridge = requireNativeComponent(
    'FibriBridge',
    FibriBridgeView,
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

//  Created by react-native-create-bridge

import * as React from 'react';
import { findNodeHandle, NativeEventEmitter, NativeModules, Platform, requireNativeComponent, UIManager } from 'react-native';

export const fibEmitter = NativeModules.FibriEventEmitter;
export const fibModule = NativeModules.FibriBridge;

export const managerEmitter = Platform.OS === 'ios' ? new NativeEventEmitter(fibEmitter) : new NativeEventEmitter(fibModule);

let fibriBridge;
export default class FibriBridgeView extends React.Component {
  static propTypes = {};

  static stop = () => {
    if (Platform.OS === 'android') {
      (UIManager).dispatchViewManagerCommand(findNodeHandle(fibriBridge), (UIManager).FibriBridge.Commands.stop, []);
    } else if (Platform.OS === 'ios') {
      fibModule.stop();
    }
  };

  setRef = ref => (fibriBridge = ref);

  render() {
    return <FibriBridge ref={this.setRef} {...this.props} />;
  }
}

const FibriBridge = requireNativeComponent('FibriBridge');

FibriBridgeView.propTypes = {};

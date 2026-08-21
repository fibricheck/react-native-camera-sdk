import { StyleProp, ViewStyle } from 'react-native';
import FibriCheckCameraPreview from './specs/FibriCheckCameraPreviewNativeComponent';

interface Props {
  style?: StyleProp<ViewStyle>;
}

export default function RNCameraPreviewView({ style }: Props) {
  return <FibriCheckCameraPreview style={style} />;
}

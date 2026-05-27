import { requireNativeComponent, StyleProp, ViewStyle } from 'react-native';

interface Props {
  style?: StyleProp<ViewStyle>;
}

const FibriCheckCameraPreview = requireNativeComponent<Props>('FibriCheckCameraPreview');

export default function RNCameraPreviewView({ style }: Props) {
  return <FibriCheckCameraPreview style={style} />;
}

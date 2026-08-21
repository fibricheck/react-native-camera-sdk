import React, {useEffect, useRef, useState} from 'react';
import {
  PermissionsAndroid,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  RNCameraPreviewView,
  RNFibriCheckVersion,
  RNFibriCheckView,
} from '@fibricheck/react-native-camera-sdk';
import type {FibriCheckViewHandle} from '@fibricheck/react-native-camera-sdk/build/types/src/FibriCheckView';

type CameraMode = 'measurement' | 'preview';

export default function App(): React.JSX.Element {
  const measurementRef = useRef<FibriCheckViewHandle>(null);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(
    Platform.OS === 'ios',
  );
  const [mode, setMode] = useState<CameraMode | null>('measurement');
  const [status, setStatus] = useState('Preparing measurement');

  useEffect(() => {
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA).then(
        result => {
          const granted = result === PermissionsAndroid.RESULTS.GRANTED;
          setPermissionGranted(granted);
          if (!granted) {
            setStatus('Camera permission required');
          }
        },
      );
    }
    return () => {
      if (transitionTimer.current) {
        clearTimeout(transitionTimer.current);
      }
    };
  }, []);

  const switchMode = (nextMode: CameraMode) => {
    if (mode === null || mode === nextMode) {
      return;
    }
    // Paper may create a replacement before detaching the current native view.
    // Commit an unmounted frame so only one camera owner can exist at a time.
    setMode(null);
    setStatus('Switching camera mode');
    transitionTimer.current = setTimeout(() => {
      setMode(nextMode);
      setStatus(
        nextMode === 'measurement'
          ? 'Preparing measurement'
          : 'Camera preview active',
      );
      transitionTimer.current = null;
    }, 150);
  };

  const isMeasurement = mode === 'measurement';
  const isPreview = mode === 'preview';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.root}>
        <View style={styles.header}>
          <View style={styles.brandMark}>
            <Text style={styles.brandPulse}>♥</Text>
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>FIBRICHECK</Text>
            <Text style={styles.title}>Camera SDK playground</Text>
          </View>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>v{RNFibriCheckVersion}</Text>
          </View>
        </View>

        <View style={styles.modeSelector}>
          <ModeButton
            active={isMeasurement}
            disabled={mode === null}
            label="Measurement"
            onPress={() => switchMode('measurement')}
          />
          <ModeButton
            active={isPreview}
            disabled={mode === null}
            label="Camera preview"
            onPress={() => switchMode('preview')}
          />
        </View>

        <View style={styles.cameraCard}>
          <View style={styles.cameraHeader}>
            <View style={styles.liveDot} />
            <Text style={styles.cameraLabel}>
              {isPreview ? 'LIVE PREVIEW' : 'MEASUREMENT'}
            </Text>
          </View>
          <View style={styles.camera}>
            {!permissionGranted ? (
              <EmptyState
                icon="!"
                message="Allow camera access to run this example."
              />
            ) : mode === null ? (
              <EmptyState icon="↻" message="Switching camera mode…" />
            ) : isMeasurement ? (
              <RNFibriCheckView
                ref={measurementRef}
                style={styles.fill}
                autoStart
                lineColor="#2DD4BF"
                graphBackgroundColor="#0B3E43"
                onMeasurementStart={() => setStatus('Measurement started')}
                onFingerDetected={() => setStatus('Finger detected')}
                onMeasurementProcessed={() =>
                  setStatus('Measurement processed')
                }
                onMeasurementError={error => setStatus('Error: ' + error)}
              />
            ) : (
              <RNCameraPreviewView style={styles.fill} />
            )}
          </View>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <Text style={styles.statusIconText}>i</Text>
          </View>
          <View style={styles.statusCopy}>
            <Text style={styles.statusLabel}>SDK STATUS</Text>
            <Text style={styles.statusText} testID="status">
              {status}
            </Text>
          </View>
        </View>

        {isMeasurement && (
          <View style={styles.actions}>
            <ActionButton
              label="Start measurement"
              primary
              onPress={() => measurementRef.current?.startMeasurement()}
            />
            <ActionButton
              label="Reset"
              onPress={() => measurementRef.current?.resetModule()}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

function ModeButton({
  active,
  disabled,
  label,
  onPress,
}: {
  active: boolean;
  disabled: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.modeButton, active && styles.modeButtonActive]}>
      <Text style={[styles.modeText, active && styles.modeTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function ActionButton({
  label,
  onPress,
  primary = false,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [
        styles.actionButton,
        primary && styles.actionButtonPrimary,
        pressed && styles.buttonPressed,
      ]}>
      <Text
        style={[
          styles.actionButtonText,
          primary && styles.actionButtonTextPrimary,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

function EmptyState({icon, message}: {icon: string; message: string}) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#082F33'},
  root: {flex: 1, padding: 20, backgroundColor: '#F2F7F6'},
  header: {flexDirection: 'row', alignItems: 'center', marginBottom: 20},
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F766E',
  },
  brandPulse: {fontSize: 21, color: '#FFFFFF'},
  headerCopy: {flex: 1, marginLeft: 12},
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.8,
    color: '#0F766E',
  },
  title: {marginTop: 2, fontSize: 20, fontWeight: '700', color: '#123437'},
  versionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#DDEBE8',
  },
  versionText: {fontSize: 11, fontWeight: '700', color: '#315B59'},
  modeSelector: {
    flexDirection: 'row',
    padding: 4,
    marginBottom: 14,
    borderRadius: 14,
    backgroundColor: '#DDEAE7',
  },
  modeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 11,
  },
  modeButtonActive: {backgroundColor: '#FFFFFF'},
  modeText: {fontSize: 13, fontWeight: '600', color: '#66817F'},
  modeTextActive: {color: '#0F676D'},
  cameraCard: {
    flex: 1,
    minHeight: 260,
    overflow: 'hidden',
    borderRadius: 22,
    backgroundColor: '#082F33',
  },
  cameraHeader: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#0B3E43',
  },
  liveDot: {
    width: 7,
    height: 7,
    marginRight: 8,
    borderRadius: 4,
    backgroundColor: '#2DD4BF',
  },
  cameraLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: '#B6D8D3',
  },
  camera: {flex: 1, backgroundColor: '#092B2F'},
  fill: {flex: 1},
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  emptyIcon: {
    marginBottom: 10,
    fontSize: 30,
    fontWeight: '300',
    color: '#5EEAD4',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    color: '#B6D8D3',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  statusIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#DDF5F0',
  },
  statusIconText: {fontSize: 15, fontWeight: '800', color: '#0F766E'},
  statusCopy: {flex: 1, marginLeft: 11},
  statusLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#78908E',
  },
  statusText: {marginTop: 2, fontSize: 14, fontWeight: '600', color: '#183D3F'},
  actions: {flexDirection: 'row', marginTop: 14},
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 13,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#B7CECA',
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
  },
  actionButtonPrimary: {
    marginLeft: 0,
    borderColor: '#0F766E',
    backgroundColor: '#0F766E',
  },
  actionButtonText: {fontSize: 13, fontWeight: '700', color: '#315B59'},
  actionButtonTextPrimary: {color: '#FFFFFF'},
  buttonPressed: {opacity: 0.72},
});

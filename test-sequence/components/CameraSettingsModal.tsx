import React, { useState } from 'react';
import { Alert, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Share from 'react-native-share';
import DeviceInfo from 'react-native-device-info';
import { RNFibriCheckVersion } from '@fibricheck/react-native-camera-sdk';
import type { CameraData } from '@fibricheck/react-native-camera-sdk';
import { colors } from '../theme/colors';

function utf8ToBase64(input: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const bytes = Array.from(new TextEncoder().encode(input));
  let output = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const [b0, b1, b2] = [bytes[i], bytes[i + 1], bytes[i + 2]];
    output += chars[b0 >> 2];
    output += chars[((b0 & 3) << 4) | (b1 === undefined ? 0 : b1 >> 4)];
    output += b1 === undefined ? '=' : chars[((b1 & 15) << 2) | (b2 === undefined ? 0 : b2 >> 6)];
    output += b2 === undefined ? '=' : chars[b2 & 63];
  }
  return output;
}

function buildMeasurementPayload(data: CameraData) {
  return {
    ...data,
    app: {
      name: 'mobile-spot-check',
      build: Number(DeviceInfo.getBuildNumber()),
      version: DeviceInfo.getVersion(),
      camera_sdk_version: RNFibriCheckVersion,
    },
    device: {
      os: DeviceInfo.getSystemVersion(),
      model: Platform.OS === 'android' ? DeviceInfo.getModel() : DeviceInfo.getDeviceId(),
      manufacturer: DeviceInfo.getBrand(),
      type: Platform.OS,
    },
  };
}

export function CameraSettingsModal({
  visible,
  data,
  onClose,
}: {
  visible: boolean;
  data: CameraData | null;
  onClose: () => void;
}) {
  const [isSharing, setIsSharing] = useState(false);

  if (!data) return null;

  const shareMeasurementJson = async () => {
    setIsSharing(true);
    try {
      const payload = buildMeasurementPayload(data);
      const json = JSON.stringify(payload, null, 2);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      await Share.open({
        url: `data:application/json;base64,${utf8ToBase64(json)}`,
        filename: `measurement_${timestamp}`,
        type: 'application/json',
        failOnCancel: false,
        // react-native-share's bundled FileProvider paths only cover the internal
        // cache dir (and the public Download/ folder), not getExternalCacheDir() -
        // without this, base64 shares NPE inside FileProvider.getUriForFile.
        useInternalStorage: true,
      });
    } catch (error) {
      Alert.alert('Share failed', error instanceof Error ? error.message : String(error));
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalRoot} edges={['top', 'right', 'bottom', 'left']}>
        <Text style={styles.modalTitle}>Measurement Results</Text>
        <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent}>
          <ScalarRow label="Heart Rate" value={`${Math.round(data.heartrate)} BPM`} />
          <ScalarRow label="quadrants" value={`${data.quadrants.length} channel(s)`} />
          <ScalarRow label="time samples" value={String(data.time.length)} />
          {data.attempts !== undefined && <ScalarRow label="attempts" value={String(data.attempts)} />}
          {Object.entries(data.technicalDetails ?? {}).map(([key, value]) => (
            <ScalarRow key={key} label={key} value={String(value)} />
          ))}
          {Object.entries(data.camera_settings ?? {}).map(([key, value]) =>
            Array.isArray(value) ? (
              <CollapsibleRow key={key} label={key} values={value} />
            ) : (
              <ScalarRow key={key} label={key} value={String(value)} />
            )
          )}
        </ScrollView>
        <TouchableOpacity
          style={[styles.modalShareBtn, isSharing && styles.modalBtnDisabled]}
          onPress={shareMeasurementJson}
          disabled={isSharing}
          activeOpacity={0.8}
        >
          <Text style={styles.modalShareBtnText}>{isSharing ? 'PREPARING…' : 'SHARE JSON'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose} activeOpacity={0.8}>
          <Text style={styles.modalCloseBtnText}>CLOSE</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
}

function ScalarRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.settingsRow}>
      <Text style={styles.settingsLabel}>{label}</Text>
      <Text style={styles.settingsValue}>{value}</Text>
      <View style={styles.settingsDivider} />
    </View>
  );
}

function CollapsibleRow({ label, values }: { label: string; values: unknown[] }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <View style={styles.settingsRow}>
      <TouchableOpacity style={styles.collapsibleHeader} onPress={() => setExpanded(v => !v)} activeOpacity={0.7}>
        <Text style={styles.collapsibleIndicator}>{expanded ? '▼' : '▶'}</Text>
        <Text style={styles.settingsLabel}>
          {label}: <Text style={styles.settingsValue}>[{values.length} entries]</Text>
        </Text>
      </TouchableOpacity>
      {expanded && <Text style={styles.collapsibleBody}>{JSON.stringify(values, null, 2)}</Text>}
      <View style={styles.settingsDivider} />
    </View>
  );
}

const monospace = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: colors.bgRoot,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textDark,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    padding: 16,
  },
  settingsRow: {
    paddingVertical: 10,
  },
  settingsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMedium,
    fontFamily: monospace,
  },
  settingsValue: {
    fontSize: 13,
    color: colors.textDark,
    marginTop: 2,
  },
  settingsDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginTop: 10,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  collapsibleIndicator: {
    fontSize: 12,
    color: colors.primary,
  },
  collapsibleBody: {
    fontSize: 11,
    fontFamily: monospace,
    color: colors.textMedium,
    marginTop: 6,
    marginLeft: 18,
  },
  modalCloseBtn: {
    margin: 16,
    marginTop: 12,
    padding: 14,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
  modalShareBtn: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    backgroundColor: colors.secondary,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalShareBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
  modalBtnDisabled: {
    opacity: 0.6,
  },
});

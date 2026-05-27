import React, { useState } from 'react';
import { Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { CameraData } from '@fibricheck/react-native-camera-sdk';
import { colors } from '../theme/colors';

export function CameraSettingsModal({
  visible,
  data,
  onClose,
}: {
  visible: boolean;
  data: CameraData | null;
  onClose: () => void;
}) {
  if (!data) return null;
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalRoot}>
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
});

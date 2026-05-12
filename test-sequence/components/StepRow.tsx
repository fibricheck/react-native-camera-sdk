import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import type { TestStep } from '../utils/TestStep';
import { colors } from '../theme/colors';

export function StepRow({ step, onLayout }: { step: TestStep; onLayout?: (y: number) => void }) {
  const isCurrent = step.status === 'current';
  return (
    <View style={[styles.stepRow, isCurrent && styles.stepRowCurrent]} onLayout={e => onLayout?.(e.nativeEvent.layout.y)}>
      <Text style={styles.stepIcon}>{renderStatusIcon(step.status)}</Text>
      <View style={styles.stepTextGroup}>
        <Text
          style={[
            styles.stepTitle,
            isCurrent && styles.stepTitleCurrent,
            step.status === 'completed' && styles.stepTitleCompleted,
            step.status === 'failed' && styles.stepTitleFailed,
          ]}
        >
          {step.id}. {step.title}
        </Text>
        <Text style={styles.stepEvent}>{step.expectedEvent}</Text>
      </View>
    </View>
  );
}

function renderStatusIcon(status: TestStep['status']): string {
  switch (status) {
    case 'completed':
      return '✅';
    case 'current':
      return '▶';
    case 'failed':
      return '❌';
    default:
      return '○';
  }
}

const styles = StyleSheet.create({
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: 12,
  },
  stepRowCurrent: {
    backgroundColor: 'rgba(30, 141, 149, 0.08)',
  },
  stepIcon: {
    fontSize: 16,
    width: 24,
    textAlign: 'center',
  },
  stepTextGroup: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    color: colors.textMedium,
  },
  stepTitleCurrent: {
    fontWeight: '700',
    color: colors.primary,
  },
  stepTitleCompleted: {
    color: colors.primary,
  },
  stepTitleFailed: {
    fontWeight: '700',
    color: colors.danger,
  },
  stepEvent: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: colors.textMuted,
    marginTop: 2,
  },
});

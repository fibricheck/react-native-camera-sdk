import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import type { TestStep } from './utils/TestStep';

function statusIcon(status: TestStep['status']): string {
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

export function StepRow({ step, onLayout }: { step: TestStep; onLayout?: (y: number) => void }) {
  const isCurrent = step.status === 'current';
  return (
    <View style={[styles.stepRow, isCurrent && styles.stepRowCurrent]} onLayout={e => onLayout?.(e.nativeEvent.layout.y)}>
      <Text style={styles.stepIcon}>{statusIcon(step.status)}</Text>
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

const styles = StyleSheet.create({
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#CFD8DC',
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
    color: '#546E7A',
  },
  stepTitleCurrent: {
    fontWeight: '700',
    color: '#1E8D95',
  },
  stepTitleCompleted: {
    color: '#1E8D95',
  },
  stepTitleFailed: {
    fontWeight: '700',
    color: '#C62828',
  },
  stepEvent: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#90A4AE',
    marginTop: 2,
  },
});

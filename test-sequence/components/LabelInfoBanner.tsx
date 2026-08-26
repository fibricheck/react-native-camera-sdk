import React from 'react';
import { Linking, Platform, StyleSheet, Text, View } from 'react-native';
import { getLabel } from '@fibricheck/react-native-camera-sdk';
import { colors } from '../theme/colors';

const label = getLabel();

export function LabelInfoBanner() {
  return (
    <View style={styles.banner}>
      <Text style={styles.componentName}>{label.componentName}</Text>
      <Text style={styles.meta}>
        {label.ceLabel}
        {'   '}
        {label.releaseDate}
      </Text>
      <Text style={styles.small}>{label.udi}</Text>
      <Text style={styles.small}>{label.manufacturer}</Text>
      <Text style={[styles.small, styles.link]} onPress={() => Linking.openURL(label.ifu)}>
        {label.ifu}
      </Text>
      {Platform.OS === 'android' && (
        <Text style={styles.notice}>
          android-camera-sdk v1.0.2: reduced feature set vs. iOS (no exposure/HDR/focus/white balance reporting, no
          camera preview)
        </Text>
      )}
    </View>
  );
}

const monospace = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.bgPrimaryLight,
    paddingVertical: 10,
    paddingHorizontal: 12,
    paddingLeft: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  componentName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.primaryDark,
    fontFamily: monospace,
  },
  meta: {
    fontSize: 9,
    color: colors.primary,
    fontFamily: monospace,
    marginTop: 2,
  },
  small: {
    fontSize: 9,
    color: colors.textSubtle,
    fontFamily: monospace,
    marginTop: 1,
  },
  link: {
    color: colors.link,
  },
  notice: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.secondary,
    fontFamily: monospace,
    marginTop: 4,
  },
});

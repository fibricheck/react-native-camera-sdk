import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

const bgColor: Record<ButtonVariant, string> = {
  primary: colors.primary,
  secondary: colors.secondary,
  danger: colors.danger,
};

export function ControlButton({
  title,
  onPress,
  variant,
  flex,
}: {
  title: string;
  onPress: () => void;
  variant: ButtonVariant;
  flex?: boolean;
}) {
  const bg = bgColor[variant];

  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: bg }, flex && styles.btnFlex]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.btnText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnFlex: {
    flex: 1,
    paddingHorizontal: 0,
  },
  btnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

import React from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text} from 'react-native';
import {colors, radius, shadows} from '../theme';

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
}) {
  const palette =
    variant === 'ghost'
      ? styles.ghost
      : variant === 'danger'
        ? styles.danger
        : styles.primary;
  const labelStyle =
    variant === 'primary' ? styles.labelDark : styles.label;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({pressed}) => [
        styles.base,
        palette,
        variant === 'primary' && shadows.gold,
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
      ]}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.bg : colors.text} />
      ) : (
        <Text style={labelStyle}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  primary: {
    backgroundColor: colors.accent,
  },
  ghost: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  danger: {
    backgroundColor: 'rgba(255, 107, 138, 0.16)',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  pressed: {
    opacity: 0.9,
    transform: [{scale: 0.985}],
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  labelDark: {
    color: '#2A1B08',
    fontSize: 16,
    fontWeight: '800',
  },
});

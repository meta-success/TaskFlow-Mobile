import React from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {colors, radius, shadows} from '../theme';

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  icon,
  iconColor,
}) {
  const palette =
    variant === 'ghost'
      ? styles.ghost
      : variant === 'danger'
        ? styles.danger
        : styles.primary;
  const labelStyle =
    variant === 'primary' ? styles.labelDark : styles.label;
  const resolvedIconColor =
    iconColor || (variant === 'primary' ? '#2A1B08' : colors.text);

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
        <ActivityIndicator
          color={variant === 'primary' ? '#2A1B08' : colors.text}
        />
      ) : (
        <View style={styles.row}>
          {icon ? (
            <Ionicons name={icon} size={18} color={resolvedIconColor} />
          ) : null}
          <Text style={labelStyle}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    fontSize: 14,
    fontWeight: '700',
  },
  labelDark: {
    color: '#2A1B08',
    fontSize: 14,
    fontWeight: '800',
  },
});

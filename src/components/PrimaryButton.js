import React from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Ionicons} from '@expo/vector-icons';
import {colors, shadows} from '../theme';

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  icon,
  iconColor,
}) {
  const isPrimary = variant === 'primary';
  const palette =
    variant === 'ghost'
      ? styles.ghost
      : variant === 'danger'
        ? styles.danger
        : styles.primaryFill;
  const labelStyle = isPrimary ? styles.labelDark : styles.label;
  const resolvedIconColor =
    iconColor || (isPrimary ? '#3B2200' : '#FFFFFF');

  const inner = loading ? (
    <ActivityIndicator color={isPrimary ? '#3B2200' : colors.text} />
  ) : (
    <View style={styles.row}>
      {icon ? (
        <Ionicons name={icon} size={18} color={resolvedIconColor} />
      ) : null}
      <Text style={labelStyle}>{label}</Text>
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({pressed}) => [
        styles.base,
        !isPrimary && palette,
        isPrimary && shadows.gold,
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
      ]}>
      {isPrimary ? (
        <LinearGradient
          colors={['#FFE27A', '#FFD54A', '#FFB703']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.gradient}>
          {inner}
        </LinearGradient>
      ) : (
        inner
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gradient: {
    minHeight: 48,
    width: '100%',
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
  primaryFill: {
    backgroundColor: colors.accent,
  },
  ghost: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.55)',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  danger: {
    backgroundColor: 'rgba(255, 107, 138, 0.2)',
    borderWidth: 1,
    borderColor: colors.danger,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  pressed: {
    opacity: 0.92,
    transform: [{scale: 0.985}],
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  labelDark: {
    color: '#3B2200',
    fontSize: 15,
    fontWeight: '800',
  },
});

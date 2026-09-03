import React from 'react';
import {StyleSheet, View} from 'react-native';
import {colors, radius, shadows} from '../theme';

export function GlassCard({children, style, glow = false}) {
  return (
    <View style={[styles.card, glow && shadows.card, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 16,
  },
});

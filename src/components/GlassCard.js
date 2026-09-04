import React from 'react';
import {StyleSheet, View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {colors, radius, shadows} from '../theme';

export function GlassCard({children, style, glow = false}) {
  return (
    <View style={[styles.wrap, glow && shadows.card, style]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.28)', 'rgba(240,171,252,0.16)']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.card}>
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    overflow: 'hidden',
  },
  card: {
    padding: 16,
  },
});
